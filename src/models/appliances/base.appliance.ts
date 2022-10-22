import { IAppliance } from '../../api/apl-api-service'
import { BaseDevice } from '../devices/base.device'
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

  public async read(): Promise<{ [index: string]: string }> {
    return await Promise.resolve({ nobe: 'not yet implemented' })
  }

  public async update(): Promise<any[]> {
    return await Promise.resolve(['not yet implemented'])
  }

  public async delete(): Promise<any[]> {
    return await Promise.resolve(['not yet implemented'])
  }
}
