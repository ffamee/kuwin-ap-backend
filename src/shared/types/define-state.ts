// enum ConfigState {
//   Pending = 'PENDING', // The initial state when a configuration is created
//   Active = 'ACTIVE', // The configuration is currently active
//   // Failed = 'FAILED',
//   Mismatch = 'MISMATCH', // The configuration does not match the current state of the access point
//   Maintenance = 'MAINTENANCE', // The access point is in maintenance mode
// }

enum StatusState {
  Pending = 'PENDING', // The initial state when a configuration is created
  Up = 'UP',
  Roff = 'RADIO_OFF',
  Down = 'DOWN', // The access point is not associated to switch
  Download = 'DOWNLOAD', // The access point is downloading a firmware
  Maintenance = 'MAINTENANCE', // The access point is in maintenance mode
  Mismatch = 'MISMATCH', // The access point configuration does not match the current state
}

export { StatusState };
