export interface IProfileCa {
  key: string
  cert: string
}

export interface IBaseProfile {
  prod: boolean
  morgan: string
  port: number
  ca: IProfileCa
}

export interface IProfile extends IBaseProfile {
  owServerHost: string
  owServerPort: number
  appliance2proxyName: string
}
