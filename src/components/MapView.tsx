import { useEffect } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import type { HeritageLocation } from '../../shared/types'
import 'leaflet/dist/leaflet.css'

function MapFocus({ item }: { item?: HeritageLocation }) {
  const map = useMap()
  useEffect(() => {
    if (item) map.flyTo([item.latitude, item.longitude], Math.max(map.getZoom(), 11), { duration: 0.8 })
  }, [item, map])
  return null
}

export function MapView({ items, selected, onSelect, height = '600px' }: { items: HeritageLocation[]; selected?: HeritageLocation; onSelect?: (item: HeritageLocation) => void; height?: string }) {
  const center: [number, number] = selected ? [selected.latitude, selected.longitude] : [29.9695, 76.8783]
  return <div className="map-shell" style={{ height }}><MapContainer center={center} zoom={9} scrollWheelZoom className="leaflet-map"><TileLayer attribution="&copy; OpenStreetMap contributors" url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} /><MapFocus item={selected} />{items.map((item) => <CircleMarker key={item.id} center={[item.latitude, item.longitude]} radius={selected?.id === item.id ? 11 : 8} pathOptions={{ color: selected?.id === item.id ? '#bb6945' : '#234b4b', fillColor: selected?.id === item.id ? '#bb6945' : '#e8a675', fillOpacity: 0.95, weight: 3 }} eventHandlers={{ click: () => onSelect?.(item) }}><Popup><strong>{item.name}</strong><br /><span>{item.category} · {item.durationMinutes} min</span><br /><Link to={`/heritage/${item.slug}`}>Read the story ↗</Link></Popup></CircleMarker>)}</MapContainer><div className="map-attribution-note">Map tiles by OpenStreetMap · marker data is demonstration content</div></div>
}
