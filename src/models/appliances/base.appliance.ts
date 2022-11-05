import { IWriteRequest } from '../../api/apl-api-controller'
import { IAppliance } from '../../api/apl-api-service'
import { BaseDevice, IDeviceReadResponse } from '../devices/base.device'
import { OwfsDevice } from '../devices/owfs/owfs.device'

export abstract class BaseAppliance {
  public type: string
  protected devices: { [index: string]: BaseDevice } = {}

  constructor(options: IAppliance) {
    this.type = options.appliance

    for (const [key, device] of Object.entries(options.devices)) {
      // TODO : dynamic build
      switch (device.type) {
        case 'owfs':
          this.devices[key] = new OwfsDevice(key, device)
      }
    }
  }

  public async create(): Promise<any[]> {
    return await Promise.resolve(['not yet implemented'])
  }

  public async read(): Promise<{ [index: string]: IDeviceReadResponse }> {
    const result: { [index: string]: IDeviceReadResponse } = {}
    for (const key of Object.keys(this.devices)) {
      result[key] = await Promise.resolve({ family: 'none', value: 'not yet implemented' })
    }
    return result
  }

  public async update(body: IWriteRequest): Promise<any[]> {
    return await Promise.resolve(['not yet implemented'])
  }

  public async delete(): Promise<any[]> {
    return await Promise.resolve(['not yet implemented'])
  }
}
