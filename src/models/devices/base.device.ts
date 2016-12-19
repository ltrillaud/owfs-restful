import { Promise, fcall } from 'q';

import { DeviceType } from '../base.model';

export interface IDeviceModel {
    type: DeviceType;
    id: string;
}

export class OwId {
    private static pattern: RegExp = /^([0-9A-F]{2})\.([0-9A-F]{12})/i;
    public family: string;
    public address: string;
    constructor(public id: string) {
        var result: RegExpMatchArray = id.match(OwId.pattern);
        this.family = result[1];
        this.address = result[2];
    }
}

export class BaseDevice {
    public owId: OwId;

    constructor(public id: string, public device: IDeviceModel) {
        this.owId = new OwId(device.id);
    }

    create(): Promise<any> {
        return fcall<any>(() => {
            return 'not implemented';
        }) 
    };
    read(): Promise<any> {
        return fcall<any>(() => {
            return 'not implemented';
        }) 
    };
    update(): Promise<any> {
        return fcall<any>(() => {
            return 'not implemented';
        }) 
    };
    delete(): Promise<any> {
        return fcall<any>(() => {
            return 'not implemented';
        }) 
    };
}