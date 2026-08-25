import type { AppConfig } from '../config/env'
import type { WeatherConditions } from '../../shared/types'
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
    if (latitude !== undefined && (latitude < -90 || latitude > 90)) throw ApiError.badRequest('latitude must be between -90 and 90.')
    if (longitude !== undefined && (longitude < -180 || longitude > 180)) throw ApiError.badRequest('longitude must be between -180 and 180.')
    if (latitude === undefined || longitude === undefined) throw ApiError.badRequest('latitude and longitude are required.')
    if (!this.config.weatherApiKey) return this.unavailable('Live weather unavailable: no weather provider is configured.')
    if (this.config.weatherProvider !== 'openweathermap') return this.unavailable('Live weather unavailable: the configured weather provider is unsupported.')

    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${encodeURIComponent(this.config.weatherApiKey)}&units=metric`)
      if (!response.ok) return this.unavailable('Live weather unavailable: the weather provider did not respond successfully.')
      const payload = await response.json() as { main?: { temp?: number; visibility?: number }; weather?: Array<{ description?: string }>; rain?: { '1h'?: number }; wind?: { speed?: number }; dt?: number }
      const updated = payload.dt ? new Date(payload.dt * 1000).toISOString() : new Date().toISOString()
      const weather: WeatherConditions = {
        status: 'LIVE',
        temperature: payload.main?.temp,
        condition: payload.weather?.[0]?.description,
        windKph: payload.wind?.speed === undefined ? undefined : Math.round(payload.wind.speed * 3.6 * 10) / 10,
        visibilityKm: payload.main?.visibility === undefined ? undefined : Math.round(payload.main.visibility / 100) / 10,
        lastUpdated: updated,
        provider: 'OpenWeather',
      }
      return { available: true, weather }
    } catch {
      return this.unavailable('Live weather unavailable: the weather provider could not be reached.')
    }
  }

  private unavailable(message: string) { return { available: false, message, weather: { status: 'UNAVAILABLE' as const, provider: this.config.weatherProvider } } }
}
