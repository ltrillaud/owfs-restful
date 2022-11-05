import { IDeviceReadResponse } from '../devices/base.device'
import { BaseAppliance } from './base.appliance'

export class SensorAppliance extends BaseAppliance {
  public async read(): Promise<{ [index: string]: IDeviceReadResponse }> {
    const result: { [index: string]: IDeviceReadResponse } = {}
    for (const [key, device] of Object.entries(this.devices)) {
      result[key] = await device.read()
    }
    return result
  }
}
