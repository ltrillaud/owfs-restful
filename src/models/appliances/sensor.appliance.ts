import { c } from '../../console'
import { IDeviceReadResponse } from '../devices/base.device'
import { BaseAppliance } from './base.appliance'

export class SensorAppliance extends BaseAppliance {
  public async read(): Promise<{ [index: string]: IDeviceReadResponse }> {
    console.log(c(this), `apl(${this.key}) read`)

    const result: { [index: string]: IDeviceReadResponse } = {}
    for (const [key, device] of Object.entries(this.devices)) {
      result[key] = await device.read()
    }
    return result
  }
}
