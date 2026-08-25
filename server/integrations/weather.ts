import type { AppConfig } from '../config/env'
import { ApiError } from '../utils/errors'

function coordinate(value: unknown, field: string) {
  if (value === undefined || value === '') return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw ApiError.badRequest(`${field} must be a number.`)
  return parsed
}

export class WeatherService {
  constructor(private readonly config: AppConfig) {}
  async get(latitudeValue: unknown, longitudeValue: unknown) {
    const latitude = coordinate(latitudeValue, 'latitude')
    const longitude = coordinate(longitudeValue, 'longitude')
    if (latitude !== undefined && latitude > 90) throw ApiError.badRequest('latitude must be between -90 and 90.')
    if (longitude !== undefined && longitude > 180) throw ApiError.badRequest('longitude must be between -180 and 180.')
    if (!this.config.weatherApiKey) return { available: false, message: 'Live weather is unavailable because no weather provider is configured.', weather: { source: 'unavailable' as const } }
    // Provider-specific credentials are intentionally not guessed. Add a provider
    // adapter when WEATHER_API_KEY is paired with a documented provider contract.
    return { available: false, message: 'Live weather provider adapter is not configured.', weather: { source: 'unavailable' as const, ...(latitude !== undefined ? { latitude } : {}), ...(longitude !== undefined ? { longitude } : {}) } }
  }
}
