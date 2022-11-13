import * as path from 'path'
import { Service } from 'typedi'
import { c } from '../console'
import { BaseAppliance } from '../models/appliances/base.appliance'
import { HeaterAppliance } from '../models/appliances/heater.appliance'
import { SensorAppliance } from '../models/appliances/sensor.appliance'
import { ShutterAppliance } from '../models/appliances/shutter.appliance'
import { T1foAppliance } from '../models/appliances/t1fo.appliance'
import { DeviceType } from '../models/base.model'
import { IDeviceReadResponse } from '../models/devices/base.device'
import { ProfileService } from '../profiles/profile-service'

export interface IDevice {
  type: DeviceType
  id: string
}
export interface IDevices {
  [index: string]: IDevice
}

export interface IAppliance {
  appliance: string
  devices: IDevices
}
export interface IAppliances2proxy {
  [index: string]: IAppliance
}

export interface IAppliancesResponse {
  [index: string]: DeviceType
}

export interface IApplianceResponse {
  appliance: string
  devices: { [index: string]: IDeviceReadResponse }
}

@Service()
export class AplApiService {
  public appliances: { [index: string]: BaseAppliance } = {}

  constructor(private readonly profileService: ProfileService) {}

  private static proxy2class(proxy: string): string {
    return proxy.charAt(0).toUpperCase() + proxy.substring(1) + 'Appliance'
  }

  public async register(): Promise<void> {
    const applianceLibPath = path.join(
      '../profiles/appliances',
      `${this.profileService.profile.appliance2proxyName}.ts`,
    )
    const app = await import(applianceLibPath)
    const appliance2proxy: IAppliances2proxy = app.appliance2proxy
    for (const [key, val] of Object.entries(appliance2proxy)) {
      // TODO : build instance dynamicaly
      const appliance = val.appliance
      switch (appliance) {
        case 'sensor':
          this.appliances[key] = new SensorAppliance(val)
          break
        case 'heater':
          this.appliances[key] = new HeaterAppliance(val)
          break
        case 'shutter':
          this.appliances[key] = new ShutterAppliance(val)
          break
        case 't1fo':
          this.appliances[key] = new T1foAppliance(val)
          break
        default:
          console.warn('appliances.ts unknow proxy(' + appliance + ')')
      }
    }
    console.log(c(this), `registered ${Object.keys(this.appliances).length} appliances`)
  }

  public getAll(): IAppliancesResponse {
    const result: any = {}
    for (const [key, val] of Object.entries(this.appliances)) {
      result[key] = val.type
    }
    return result
  }

  public async getOne(apl: string): Promise<IApplianceResponse> {
    const result: IApplianceResponse = {
      appliance: this.appliances[apl].type,
      devices: await this.appliances[apl].read(),
    }
    return result
  }
}