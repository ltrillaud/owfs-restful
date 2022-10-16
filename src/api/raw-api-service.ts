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

@Service()
export class RawApiService {
  headers: string[] = ['version', 'payload', 'ret', 'controlflags', 'size', 'offset']

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
      const socket = new net.Socket()

      socket.on('error', (error: any) => {
        reject(new Error(error))
      })

      // finished receiving
      socket.on('end', () => {
        if (response.header.ret < 0) {
          throw new Error(response.header.ret.toString())
        }
        resolve(response)
      })

      // receive data
      socket.on('data', (data: any) => {
        let j: number = 0
        const chunk: number = 4
        const header: any = {}
        for (let i = 0; i < 24; i += chunk) {
          const tmp = data.slice(i, i + chunk)
          const value = this.ntohl(tmp)
          header[this.headers[j]] = value
          j++
        }
        response = {
          header,
          payload: data.slice(24).toString('utf8'),
        }
        console.log(c(this), `send path(${path}) ondata`, response)
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
          this.htonl(0x00000020),
          this.htonl(value !== '' ? value.length : 8192),
          this.htonl(0)
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

  private ntohl(b: number[]): number {
    return ((0xff & b[0]) << 24) | ((0xff & b[1]) << 16) | ((0xff & b[2]) << 8) | (0xff & b[3])
  }
}
