import { Clock3, CloudRain, ExternalLink, Eye, MapPin, Navigation, ThermometerSun, Wind } from 'lucide-react'
import type { HeritageLocation, TravelConditions as TravelConditionsData } from '../../shared/types'
import { useResource } from '../lib/api'
import { useLanguage } from '../lib/i18n'
import { LoadingState, StatusNotice } from './Shared'

function statusLabel(status: string) { return status }
function timeLabel(value?: string) { return value ? new Date(value).toLocaleString() : 'Not available' }

export function TravelConditions({ item }: { item: HeritageLocation }) {
  const { language } = useLanguage()
  const fallback: TravelConditionsData = {
    destination: { id: item.id, name: item.name, latitude: item.latitude, longitude: item.longitude, district: item.district, state: item.state, coordinateNote: item.coordinateNote },
    weather: { status: 'UNAVAILABLE', message: 'Live weather unavailable.' },
    traffic: { status: 'UNAVAILABLE', message: 'Live traffic unavailable.' },
    recommendation: 'Live weather and traffic are unavailable. Check local conditions before leaving.',
    retrievedAt: '',
  }
  const { data, loading, error } = useResource<TravelConditionsData>(`/api/heritage/${item.slug}/conditions`, fallback)
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`
  const weather = data.weather
  const traffic = data.traffic
  return <section className="travel-conditions" aria-labelledby="travel-conditions-title">
    <div className="travel-conditions-head"><div><span className="eyebrow"><Navigation size={13} /> Travel + visit</span><h2 id="travel-conditions-title">Travel Conditions</h2><p>Current provider information for {item.name}. Values are not a safety or medical assessment.</p></div><a className="button primary navigate-button" href={navigationUrl} target="_blank" rel="noreferrer"><MapPin size={16} /> Navigate to this place <ExternalLink size={14} /></a></div>
    {item.coordinateNote && <div className="prototype-note"><MapPin size={15} /><span>{item.coordinateNote} Use local confirmation before relying on navigation.</span></div>}
    {error && <StatusNotice>{language === 'hi' ? 'लाइव यात्रा जानकारी उपलब्ध नहीं है।' : 'Live travel information is unavailable.'}</StatusNotice>}
    {loading && !data.retrievedAt ? <LoadingState label="Loading travel conditions" /> : <>
      <div className="conditions-grid">
        <article className="conditions-card"><div className="conditions-card-head"><strong>Weather</strong><span className={`condition-status ${weather.status.toLowerCase()}`}>{statusLabel(weather.status)}</span></div>{weather.temperature !== undefined && <div className="condition-value"><ThermometerSun size={17} /><strong>{weather.temperature}°C</strong></div>}<dl>{weather.condition && <><dt>Condition</dt><dd>{weather.condition}</dd></>}{weather.rainProbability !== undefined && <><dt><CloudRain size={13} /> Rain probability</dt><dd>{weather.rainProbability}%</dd></>}{weather.windKph !== undefined && <><dt><Wind size={13} /> Wind</dt><dd>{weather.windKph} km/h</dd></>}{weather.visibilityKm !== undefined && <><dt><Eye size={13} /> Visibility</dt><dd>{weather.visibilityKm} km</dd></>}</dl><p className="condition-meta"><Clock3 size={12} /> Updated {timeLabel(weather.lastUpdated)}{weather.provider && ` · ${weather.provider}`}</p>{weather.message && <p className="condition-message">{weather.message}</p>}</article>
        <article className="conditions-card"><div className="conditions-card-head"><strong>Traffic</strong><span className={`condition-status ${traffic.status.toLowerCase()}`}>{statusLabel(traffic.status)}</span></div>{traffic.status === 'UNAVAILABLE' ? <p className="condition-unavailable">Live traffic unavailable.</p> : <dl>{traffic.estimatedTravelMinutes !== undefined && <><dt>Estimated travel time</dt><dd>{traffic.estimatedTravelMinutes} min</dd></>}{traffic.normalTravelMinutes !== undefined && <><dt>Normal travel time</dt><dd>{traffic.normalTravelMinutes} min</dd></>}{traffic.condition && <><dt>Traffic condition</dt><dd>{traffic.condition}</dd></>}{traffic.delayMinutes !== undefined && <><dt>Delay</dt><dd>{traffic.delayMinutes} min</dd></>}{traffic.distanceKm !== undefined && <><dt>Distance</dt><dd>{traffic.distanceKm} km</dd></>}</dl>}<p className="condition-meta"><Clock3 size={12} /> Updated {timeLabel(traffic.lastUpdated)}{traffic.provider && ` · ${traffic.provider}`}</p>{traffic.message && <p className="condition-message">{traffic.message}</p>}</article>
      </div>
      <div className="travel-recommendation"><strong>Visit note</strong><span>{data.recommendation}</span><small>Retrieved {timeLabel(data.retrievedAt)}</small></div>
    </>}
  </section>
}
