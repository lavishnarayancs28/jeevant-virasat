import type { AppConfig } from '../config/env'

export type MediaStorage = { provider: 'local-development' | 'object-storage-unconfigured'; available: boolean; publicUploadsAllowed: boolean }

export class MediaService {
  constructor(private readonly config: AppConfig) {}
  get status(): MediaStorage { return this.config.storageBucket ? { provider: 'object-storage-unconfigured', available: false, publicUploadsAllowed: false } : { provider: 'local-development', available: this.config.nodeEnv !== 'production', publicUploadsAllowed: false } }
}
