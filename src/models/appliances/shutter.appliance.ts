import { IWriteRequest } from '../../api/apl-api-controller'
import { BaseAppliance } from './base.appliance'

type ShutterActionType = 'O' | 'C'

export class ShutterAppliance extends BaseAppliance {
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
        throw new Error(`Shutter action must be 'O' to open or 'C' to close`)
    }

    console.log(`>>> shuter action(${action}), devices`, this.devices)

    if (Object.prototype.hasOwnProperty.call(this.devices, action)) {
      const device = this.devices[action]
      await device.write('1')
      await new Promise((resolve) => setTimeout(resolve, 750))
      await device.write('0')
    } else {
      throw new Error(`Action(${body.value}) doesn't exist in appliance(${this.type}) `)
    }

    return await Promise.resolve(['not yet implemented'])
  }
}
