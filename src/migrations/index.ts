import * as migration_20250102_141710 from './20250102_141710';

export const migrations = [
  {
    up: migration_20250102_141710.up,
    down: migration_20250102_141710.down,
    name: '20250102_141710'
  },
];
