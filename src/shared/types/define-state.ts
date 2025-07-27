enum ErrorState {
  NotFound = 0,
  Deprecated = 1,
  Duplicated = 2,
  Invalid = 3,
  Forbidden = 4,
}

enum ConfigState {
  Pending = 'PENDING', // The initial state when a configuration is created
  Active = 'ACTIVE', // The configuration is currently active
  // Failed = 'FAILED',
  Mismatch = 'MISMATCH', // The configuration does not match the current state of the access point
  Maintenance = 'MAINTENANCE', // The access point is in maintenance mode
}

enum StatusState {
  Up = 'UP',
  Roff = 'RADIO_OFF',
  Down = 'DOWN',
  // Download = 'DOWNLOAD', // The access point is downloading a firmware
}

export { ErrorState, ConfigState, StatusState };
