import { CloudRain, Droplets, ThermometerSun, Wind } from 'lucide-react'
import { useMemo, useState } from 'react'
import { heritage } from '../../shared/data'
import type { WeatherObservation } from '../../shared/types'
import { recommendWeatherFood } from '../../shared/weather-food'
import { useLanguage } from '../lib/i18n'
import { FoodCard } from './FoodCard'

export function WeatherFoodDiscovery() {
  const { language, t } = useLanguage()
  const [weather, setWeather] = useState<WeatherObservation | undefined>(undefined)
  const foodRecords = heritage.filter((item) => item.category === 'Food')
  const recommendation = useMemo(() => recommendWeatherFood(weather, foodRecords, language), [weather, foodRecords, language])
  const selected = foodRecords.filter((item) => recommendation.foodRecordIds.includes(item.id))
  const choices: Array<{ condition: WeatherObservation['condition']; label: string; icon: React.ReactNode }> = [{ condition: 'hot', label: t('weather.hot'), icon: <ThermometerSun size={17} /> }, { condition: 'cold', label: t('weather.cold'), icon: <Wind size={17} /> }, { condition: 'rain', label: t('weather.rain'), icon: <CloudRain size={17} /> }, { condition: 'mild', label: t('weather.mild'), icon: <Droplets size={17} /> }]
  return <section className="weather-food" aria-labelledby="weather-food-title"><div className="weather-food-head"><div><span className="eyebrow"><ThermometerSun size={13} /> {t('weather.foodTitle')}</span><h2 id="weather-food-title">{t('weather.foodTitle')}</h2><p>{t('weather.foodBody')}</p></div><span className="prototype-label">{t('provenance.prototype')}</span></div><div className="weather-choices" role="group" aria-label={t('weather.select')}><span>{t('weather.select')}</span>{choices.map((choice) => <button key={choice.condition} type="button" className={weather?.condition === choice.condition ? 'selected' : ''} onClick={() => setWeather({ condition: choice.condition, location: 'Haryana', source: 'user-provided', timestamp: new Date().toISOString() })} aria-pressed={weather?.condition === choice.condition}>{choice.icon}{choice.label}</button>)}</div><div className={`weather-result ${recommendation.available ? 'available' : 'unavailable'}`} role="status"><p>{recommendation.message}</p>{recommendation.available && <small>{t('weather.culturalOnly')}</small>}</div>{selected.length > 0 && <div className="food-grid">{selected.map((item) => <FoodCard key={item.id} item={item} />)}</div>}</section>
}
