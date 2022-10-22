import { IProfile } from './profile-model'

export const profile: IProfile = {
  // This is the profile for local dev debug
  prod: false,
  morgan: 'dev',
  port: 8001,

  owServerHost: '192.168.1.1',
  owServerPort: 4304,

  // name of the appliance to used
  // appliance2proxyName: 'default',
  appliance2proxyName: 'home',

  ca: {
    key: './localhost.key',
    cert: './localhost.crt',
  },
}
