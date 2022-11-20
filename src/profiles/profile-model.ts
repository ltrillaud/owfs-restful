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
  privacyName: string
}
