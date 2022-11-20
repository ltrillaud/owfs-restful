import { IProfile } from './profile-model'

export const profile: IProfile = {
  // This is the profile for local dev debug
  prod: false,
  morgan: 'dev',
  port: 8001,

  // set your owserver IP Port
  owServerHost: '192.168.1.1',
  owServerPort: 4304,

  // set here your keycloak certificate
  jwtSecret: '-----BEGIN CERTIFICATE----- MII...<cert here> -----END CERTIFICATE-----',

  ca: {
    key: './localhost.key',
    cert: './localhost.crt',
  },

  unitsSystem: 'metric',

  // set yours openwheathermap.org Api Key
  weatherApiKey: '',

  // sample location to Paris. replace by yours
  location: {
    latitude: 48.84096714416889,
    longitude: 2.2873007986327933,
  },

  // sample of fake appliances. Replace by yours
  appliance2proxy: {
    // --- heater
    R: {
      appliance: 'heater',
      devices: {
        PIO: { type: 'owfs', id: '05.5FDF31000000' },
      },
    },

    // --- Shutter
    PR: {
      appliance: 'shutter',
      devices: {
        O: { type: 'owfs', id: '05.3EED31000000' },
        C: { type: 'owfs', id: '05.F80732000000' },
      },
    },

    // --- Sensor
    J1P: {
      appliance: 'sensor',
      devices: {
        J1P: { type: 'owfs', id: '10.5F0255010800' },
      },
    },
  },
}
