import type { AppConfig } from '../config/env'
import type { TrafficConditions } from '../../shared/types'
import { ApiError } from '../utils/errors'

function coordinate(value: unknown, field: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw ApiError.badRequest(`${field} must be a number.`)
  return parsed
}

export class TrafficService {
  constructor(private readonly config: AppConfig) {}

  async get(destinationLatitudeValue: unknown, destinationLongitudeValue: unknown, _originLatitudeValue?: unknown, _originLongitudeValue?: unknown) {
    const destinationLatitude = coordinate(destinationLatitudeValue, 'destinationLatitude')
    const destinationLongitude = coordinate(destinationLongitudeValue, 'destinationLongitude')
    if (destinationLatitude < -90 || destinationLatitude > 90 || destinationLongitude < -180 || destinationLongitude > 180) throw ApiError.badRequest('Destination coordinates are invalid.')
    if (!this.config.trafficApiKey || !this.config.trafficProvider) return this.unavailable('Live traffic unavailable: no traffic provider is configured.')
    return this.unavailable('Live traffic unavailable: the configured traffic provider is unsupported.')
  }

  private unavailable(message: string) { const traffic: TrafficConditions = { status: 'UNAVAILABLE', provider: this.config.trafficProvider, message }; return { available: false, traffic } }
}