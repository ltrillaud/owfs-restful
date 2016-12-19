import { Promise } from 'q';

import { BaseDevice } from '../base.device';
import { server } from '../../../app';

export class OwfsDevice extends BaseDevice {
    private static family2defaultPath = {
        '10': 'temperature',
        '26': 'humidity',
        '05': 'PIO'
    }
    public id: string
    constructor(id: string, device: any) {
        super(id, device);
    }

    read(): Promise<any> {
        return server.owfsClient.read('/' + this.device.id + '/'+ OwfsDevice.family2defaultPath[this.owId.family]);
    };

}