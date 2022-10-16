import { IProfile } from './profile-service'

export const profile: IProfile = {
  // This is the profile for local dev debug
  prod: false,
  morgan: 'dev',
  port: 8001,

  ca: {
    key: './localhost.key',
    cert: './localhost.crt',
  },
}
