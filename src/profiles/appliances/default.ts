export const appliance2proxy = {
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
  H1: {
    appliance: 'sensor',
    devices: {
      H1T: { type: 'owfs', id: '10.CD55CB010800' },
      H1H: { type: 'owfs', id: '26.8F55E7000000' },
    },
  },
  G1: {
    appliance: 'sensor',
    devices: {
      G1PT: { type: 'owfs', id: '10.1FBE54010800' },
      G1IT: { type: 'owfs', id: '10.D4F054010800' },
      G1ET: { type: 'owfs', id: '10.54C754010800' },
      G1TT: { type: 'owfs', id: '10.0DD554010800' },
    },
  },
  ADCO: {
    appliance: 't1fo',
  },
  OPTARIF: {
    appliance: 't1fo',
  },
  ISOUSC: {
    appliance: 't1fo',
  },
  HCHC: {
    appliance: 't1fo',
  },
  HCHP: {
    appliance: 't1fo',
  },
  PTEC: {
    appliance: 't1fo',
  },
  IINST: {
    appliance: 't1fo',
  },
  IMAX: {
    appliance: 't1fo',
  },
  PAPP: {
    appliance: 't1fo',
  },
  HHPHC: {
    appliance: 't1fo',
  },
  MOTDETAT: {
    appliance: 't1fo',
  },
}
