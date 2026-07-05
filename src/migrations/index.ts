import * as migration_20260705_141430_initial from './20260705_141430_initial';

export const migrations = [
  {
    up: migration_20260705_141430_initial.up,
    down: migration_20260705_141430_initial.down,
    name: '20260705_141430_initial'
  },
];
