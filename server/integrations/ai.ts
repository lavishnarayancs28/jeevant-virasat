import type { AppConfig } from '../config/env'

export type AiResult = { provider: 'deterministic' | 'external'; available: boolean; prototype: boolean }

export class AiService {
  constructor(private readonly config: AppConfig) {}
  get status(): AiResult { return this.config.aiApiKey ? { provider: 'external', available: false, prototype: true } : { provider: 'deterministic', available: false, prototype: true } }
}
