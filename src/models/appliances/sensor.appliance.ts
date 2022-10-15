import { all, Promise } from 'q';
import { BaseAppliance } from './base.appliance';

export class SensorAppliance extends BaseAppliance {
    constructor(options: any) {
        super(options);
    }

    read(): Promise<any[]> {
        const requests: Array<any> = [];

        for (let key in this.devices) {
            const device: any = this.devices[key];
            requests.push( device.read());
        }
        return all(requests);
    }

}