import { Promise, fcall } from 'q';
import { BaseDevice } from '../devices/base.device';
import { OwfsDevice } from '../devices/owfs/owfs.device';

export abstract class BaseAppliance {
    public type: string;
    protected devices: { [index: string]: BaseDevice } = {};

    constructor(options: any) {
        this.type = options.appliance;
        this.devices = options.devices;

        for (let key in this.devices) {
            const device: any = this.devices[key];
            // TODO : dynamic build
            switch (device.type) {
                case 'owfs':
                    this.devices[key] = new OwfsDevice(key, device);
            }
        }

    }

    create(): Promise<any[]> {
        return fcall<any[]>(() => {
            return ['not implemented']
        }) 
    };
    read(): Promise<any[]> {
        return fcall<any[]>(() => {
            return ['not implemented']
        }) 
    };
    update(): Promise<any[]> {
        return fcall<any[]>(() => {
            return ['not implemented']
        }) 
    };
    delete(): Promise<any[]> {
        return fcall<any[]>(() => {
            return ['not implemented']
        }) 
    };
}