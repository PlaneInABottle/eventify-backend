import * as migration_20250102_150037 from './20250102_150037';

export const migrations = [
  {
    up: migration_20250102_150037.up,
    down: migration_20250102_150037.down,
    name: '20250102_150037'
  },
];
