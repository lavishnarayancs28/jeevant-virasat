import type { AppConfig } from '../config/env'

export class NotificationService {
  constructor(private readonly config: AppConfig) {}
  get enabled() { return Boolean(this.config.emailApiKey) }
  async notify() { return { sent: false, reason: this.enabled ? 'provider-adapter-pending' : 'email-provider-not-configured' } }
}
