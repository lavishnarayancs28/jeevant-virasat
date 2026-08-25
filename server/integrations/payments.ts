import type { AppConfig } from '../config/env'
import { ApiError } from '../utils/errors'

export class PaymentsService {
  constructor(private readonly config: AppConfig) {}
  get enabled() { return Boolean(this.config.paymentSecretKey) }
  createPaymentIntent() { throw ApiError.unavailable('Payments are disabled until a payment provider is configured.', 'PAYMENTS_DISABLED') }
}
