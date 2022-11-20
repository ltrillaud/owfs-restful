import { IAppliances2proxy } from '../api/apl-api-service'
import { Location } from '../api/cron-api-service'

export type UnitsSystem = 'metric' | 'imperial'
export interface IProfileCa {
  key: string
  cert: string
}

export interface IBaseProfile {
  prod: boolean
  morgan: string
  port: number
  ca: IProfileCa
  jwtSecret: string
}

export interface IProfile extends IBaseProfile {
  owServerHost: string
  owServerPort: number

  unitsSystem: UnitsSystem
  weatherApiKey: string
  location: Location
  appliance2proxy: IAppliances2proxy
}
