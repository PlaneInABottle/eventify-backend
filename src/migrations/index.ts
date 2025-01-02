import * as migration_20250102_150037 from './20250102_150037';
import * as migration_20250102_164220 from './20250102_164220';

export const migrations = [
  {
    up: migration_20250102_150037.up,
    down: migration_20250102_150037.down,
    name: '20250102_150037',
  },
  {
    up: migration_20250102_164220.up,
    down: migration_20250102_164220.down,
    name: '20250102_164220'
  },
];
