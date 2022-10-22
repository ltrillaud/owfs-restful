import { BaseAppliance } from './base.appliance'

export class SensorAppliance extends BaseAppliance {
  public async read(): Promise<{ [index: string]: string }> {
    const result: { [index: string]: string } = {}
    for (const [key, device] of Object.entries(this.devices)) {
      result[key] = await device.read()
    }
    return result
  }
}
