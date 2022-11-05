import { DeviceType } from '../base.model'

export interface IDeviceModel {
  type: DeviceType
  id: string
}

export interface IDeviceReadResponse {
  value: string
  family: string
}

export class BaseDevice {
  constructor(public id: string, public device: IDeviceModel) { }

  async read(): Promise<IDeviceReadResponse> {
    return await Promise.resolve({ family: 'none', value: 'not implemented' })
  }

  async write(value: string): Promise<string> {
    return await Promise.resolve('not implemented')
  }
}
