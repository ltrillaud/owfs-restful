// based on https://github.com/benediktarnold/owfs
/* tslint:disable: no-bitwise no-console */

const net: any = require('net');

import * as Q from 'q';

const OW_READ: number = 2; // read from 1-wire bus
const OW_WRITE: number = 3; // write to 1-wire bus
// UNUSED: const OW_DIR =    4; // list 1-wire bus
// UNUSED: const OW_PRESENT = 6; // Is the specified component recognized and known
const OW_DIRALL: number = 7; // list 1-wire bus, in one packet string
// UNUSED: const OW_GET =    8; // dirall or read depending on path
// UNUSED: const OW_DIRALLSLASH = 9; // dirall but with directory entries getting a trailing '/'
// UNUSED: const OW_GETSLASH = 10; // dirallslash or read depending on path

export class Client {
    headers: Array<string> = ['version', 'payload', 'ret', 'controlflags', 'size', 'offset'];
    option: any = {
        host: 'localhost',
        port: 4304,
    };

    constructor(options: any) {
        console.log('      owfs.ts constructor', options);

        // set options
        for (let i in options) {
            if (typeof (options[i]) === 'object') {
                this.option[i] = {};
                for (const j in options[i]) {
                    this.option[i][j] = options[i][j];
                }
            } else {
                this.option[i] = options[i];
            }
        }
    }

    // define procedures
    htonl(n: number): Array<number> {
        return [
            (n & 0xFF000000) >>> 24, (n & 0x00FF0000) >>> 16, (n & 0x0000FF00) >>> 8, (n & 0x000000FF) >>> 0
        ];
    };

    ntohl(b: Array<number>): number {
        return ((0xff & b[0]) << 24) | ((0xff & b[1]) << 16) | ((0xff & b[2]) << 8) | ((0xff & b[3]));
    };

    // send raw data to 1-wire and return responding
    send(path: any, value: any, type: any): any {
        console.log('      owfs.ts send path(' + path + '), value(' + value + '), type(' + type + ')');
        const deferred: any = Q.defer();
        const socket: any = new net.Socket({ type: 'tcp4' });
        const messages: Array<any> = [];

        socket.on('error', (error: any) => {
            deferred.reject(new Error(error));
        });

        // finished receiving
        socket.on('end', () => {
            deferred.resolve(messages);
        });

        // receive data
        socket.on('data', (data: any) => {
            let j: number = 0;
            const chunk: number = 4;
            const header: any = {};
            for (let i = 0; i < 24; i += chunk) {
                const tmp = data.slice(i, i + chunk);
                const value = this.ntohl(tmp);
                header[this.headers[j]] = value;
                j++;
            }
            messages.push({
                header: header,
                payload: data.slice(24).toString('utf8')
            });
        });

        // send stuff
        socket.connect(this.option.port, this.option.host, () => {
            let msg: Array<any> = [];
            path += '\x00';
            if (type === OW_WRITE && (typeof value === 'undefined' || value === null)) {
                throw new Error('Must have a value to write to ' + path);
            }
            value = (type === OW_WRITE) ? value.toString() + '\x00' : '';
            // http://owfs.org/index.php?page=owserver-message-types
            msg = msg.concat(
                this.htonl(0),
                this.htonl(path.length + value.length),
                this.htonl(type),
                this.htonl(0x00000020),
                this.htonl(value.length ? value.length : 8192),
                this.htonl(0)
            );
            const buf = new Buffer(msg.length + path.length + value.length);
            new Buffer(msg).copy(buf, 0);
            new Buffer(path + value).copy(buf, msg.length);

            socket.end(buf);
        });

        return deferred.promise;
    };

    // read value
    read(path: any): any {
        let promise: any;

        if (path instanceof Array) {
            promise = Q.all(path.map(this.read));
        } else {
            promise = this.send(path, null, OW_READ).then(
                (messages: any): any => { // sucess
                    console.log('      owfs.ts read result', messages);
                    // take the last one only
                    const message = messages[messages.length - 1];

                    if (message.header.ret < 0) {
                        throw new Error(message.header.ret);
                    }
                    return { path: path, value: message.payload };
                }
            );
        }
        return promise;
    }

    // write value
    write(path: any, value: any) {
        return this.send(path, value, OW_WRITE).then((messages: any) => {
            if (messages[0].header.ret < 0) {
                throw new Error(messages[0].header.ret);
            }
            return true;
        });
    }

    // return array of dir
    list(path: any): any {
        console.log('      owfs.ts list path(' + path + ')');
        let promise: any;
        if (path instanceof Array) {
            promise = Q.all(path.map(this.list));
        } else {
            promise = this.send(path, null, OW_DIRALL).then((messages: any) => {
                const message = messages[0];
                if (message.header.ret < 0) {
                    throw new Error(message.header.ret);
                }
                let str = message.payload;
                str = str.substring(0, str.length - 1); // remove zero-char from end
                return str.split(',');
            });
        }
        return promise;
    };
}
