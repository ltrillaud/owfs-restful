import { IWriteRequest } from '../../api/apl-api-controller'
import { IDeviceReadResponse } from '../devices/base.device'
import { BaseAppliance } from './base.appliance'

export type ShutterActionType = 'O' | 'C'

export class ShutterAppliance extends BaseAppliance {
  public async read(): Promise<{ [index: string]: IDeviceReadResponse }> {
    const result: { [index: string]: IDeviceReadResponse } = {}
    for (const key of Object.keys(this.devices)) {
      // no need to read pio with shutter
      result[key] = await Promise.resolve({ family: 'PIO', value: '0' })
    }
    return result
  }

  public async update(body: IWriteRequest): Promise<any[]> {
    let action: ShutterActionType
    switch (body.value) {
      case 'O':
        action = 'O'
        break
      case 'C':
        action = 'C'
        break
      default:
        throw new Error('Shutter action must be \'O\' to open or \'C\' to close')
    }

    if (Object.prototype.hasOwnProperty.call(this.devices, action)) {
      const device = this.devices[action]
      await device.write('1')
      await new Promise((resolve) => setTimeout(resolve, 750))
      await device.write('0')
    } else {
      throw new Error(`Action(${body.value}) doesn't exist in appliance(${this.type}) `)
    }

    return await Promise.resolve(['ok'])
  }
}
