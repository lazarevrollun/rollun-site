import * as migration_20260705_141430_initial from './20260705_141430_initial';
import * as migration_20260706_064817_site_settings from './20260706_064817_site_settings';
import * as migration_20260706_072820_media from './20260706_072820_media';

export const migrations = [
  {
    up: migration_20260705_141430_initial.up,
    down: migration_20260705_141430_initial.down,
    name: '20260705_141430_initial',
  },
  {
    up: migration_20260706_064817_site_settings.up,
    down: migration_20260706_064817_site_settings.down,
    name: '20260706_064817_site_settings',
  },
  {
    up: migration_20260706_072820_media.up,
    down: migration_20260706_072820_media.down,
    name: '20260706_072820_media'
  },
];
