import * as net from 'net'
import { Service } from 'typedi'
import { c } from '../console'
import { ProfileService } from '../profiles/profile-service'

// based on https://github.com/benediktarnold/owfs
const OW_READ: number = 2 // read from 1-wire bus
const OW_WRITE: number = 3 // write to 1-wire bus
// UNUSED: const OW_DIR =    4; // list 1-wire bus
// UNUSED: const OW_PRESENT = 6; // Is the specified component recognized and known
const OW_DIRALL: number = 7 // list 1-wire bus, in one packet string
// UNUSED: const OW_GET =    8; // dirall or read depending on path
// UNUSED: const OW_DIRALLSLASH = 9; // dirall but with directory entries getting a trailing '/'
// UNUSED: const OW_GETSLASH = 10; // dirallslash or read depending on path

// DOC: https://owfs.org/index_php_page_owserver-flag-word.html
const flags: { [index: string]: number } = {
  request: 0x00000100,
  uncached: 0x00000020,
  safemode: 0x00000010,
  alias: 0x00000008,
  persist: 0x00000004,
  busRet: 0x00000002,
}

export interface IListResponse {
  path: string
  header: IOwHeaderResponse
  values: string[]
}
export interface IReadResponse extends IOwResponse {
  path: string
}

export interface IWriteResponse extends IOwResponse {
  path: string
}

// https://owfs.org/index_php_page_tcp-messages.html
export interface IOwHeaderResponse {
  version: number // 4 bytes, "0"
  payload: number // length in bytes of payload field
  ret: number // return value
  controlflags: number // various flags
  size: number // expected size of data read or written
  offset: number // location in read or write field that data starts
}

export interface IOwResponse {
  header: IOwHeaderResponse
  payload: string // Either just a filename path (for  directory element), or data read
}

type OwHeaderType = 'version' | 'payload' | 'ret' | 'controlflags' | 'size' | 'offset'

@Service()
export class RawApiService {
  headerProps: OwHeaderType[] = ['version', 'payload', 'ret', 'controlflags', 'size', 'offset']
  headerLength = 24

  constructor(private readonly profileService: ProfileService) {}

  // return array of dir
  async list(path: string): Promise<IListResponse> {
    const response = await this.send(path, OW_DIRALL)
    let str = response.payload
    str = str.substring(0, str.length - 1) // remove zero-char from end
    return { path, header: response.header, values: str.split(',') }
  }

  // read value
  async read(path: string): Promise<IReadResponse> {
    const response = await this.send(path, OW_READ)
    return { path, ...response }
  }

  // write value
  async write(path: string, value: string): Promise<IWriteResponse> {
    const response = await this.send(path, OW_WRITE, value)
    return { path, ...response }
  }

  // send raw data to 1-wire and return responding
  private async send(path: string, type: number, value: string = ''): Promise<IOwResponse> {
    return await new Promise<IOwResponse>((resolve, reject) => {
      console.log(c(this), `send path(${path}), type(${type}), value(${value})`)
      let response: IOwResponse
      const buffers: Buffer[] = []
      const socket = new net.Socket()

      socket.on('error', (error: any) => {
        reject(new Error(error))
      })

      // finished receiving
      socket.on('end', () => {
        let buffer = Buffer.concat(buffers)
        while (buffer.length >= this.headerLength) {
          const header: IOwHeaderResponse = { version: 0, controlflags: 0, offset: 0, payload: 0, ret: 0, size: 0 }
          for (let i = 0; i < this.headerProps.length; i++) {
            const prop = this.headerProps[i]
            header[prop] = this.ntohl(buffer, i * 4)
          }
          console.log('Extracted header', header)
          if (header.ret < 0) {
            const err = new Error(`Communication Error. Received(${header.ret}) `)
            // FIXME: remove this in version 1.0.0
            // err.msg = err.message
            // err.header = header
            // err.options = options
            reject(err)
          }
          if (header.payload > 0) {
            const payload = buffer.slice(this.headerLength, this.headerLength + header.payload).toString('utf8')
            console.log('Extracted payload', payload)
            response = { header, payload }
            break
          } else {
            response = { header, payload: '' }
            buffer = buffer.slice(this.headerLength)
          }
        }
        resolve(response)
        // if (response.header.ret < 0) {
        //   reject(new Error(response.header.ret.toString()))
        // }
        // resolve(response)
      })

      // receive data
      socket.on('data', (buffer: Buffer) => {
        buffers.push(buffer)

        // buffer = Buffer.concat([buffer, data])
        // let j: number = 0
        // const chunk: number = 4
        // const header: any = {}
        // for (let i = 0; i < 24; i += chunk) {
        //   const tmp = data.subarray(i, i + chunk)
        //   const value = this.ntohl(tmp)
        //   header[this.headers[j]] = value
        //   j++
        // }
        // response = {
        //   header,
        //   payload: data.subarray(24).toString('utf8'),
        // }
        console.log(c(this), `send path(${path}) ondata len(${buffer.byteLength})`)
      })
      // send stuff
      socket.connect(this.profileService.profile.owServerPort, this.profileService.profile.owServerHost, () => {
        let msg: any[] = []
        path += '\x00'
        value = type === OW_WRITE ? value + `${value}\x00` : ''
        // http://owfs.org/index.php?page=owserver-message-types
        msg = msg.concat(
          this.htonl(0),
          this.htonl(path.length + value.length),
          this.htonl(type),
          this.htonl(flags.request | flags.alias),
          this.htonl(value !== '' ? value.length : 8192),
          this.htonl(0),
        )
        const buf = Buffer.alloc(msg.length + path.length + value.length)
        Buffer.from(msg).copy(buf, 0)
        Buffer.from(path + value).copy(buf, msg.length)
        socket.end(buf)
      })
    })
  }

  // define procedures
  private htonl(n: number): number[] {
    return [(n & 0xff000000) >>> 24, (n & 0x00ff0000) >>> 16, (n & 0x0000ff00) >>> 8, (n & 0x000000ff) >>> 0]
  }

  private ntohl(b: Buffer, i: number): number {
    return ((0xff & b[i]) << 24) | ((0xff & b[i + 1]) << 16) | ((0xff & b[i + 2]) << 8) | (0xff & b[i + 3])
  }
}
