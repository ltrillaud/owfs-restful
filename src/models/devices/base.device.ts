import { DeviceType } from '../base.model'

export interface IDeviceModel {
  type: DeviceType
  id: string
}

export class BaseDevice {
  constructor(public id: string, public device: IDeviceModel) {}

  async read(): Promise<string> {
    return await Promise.resolve('not implemented')
  }
}
