import { useEffect, useRef } from 'react'
import tt from '@tomtom-international/web-sdk-maps'
import { calculateRoute } from '../../lib/tomtom'

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY

export default function RouteMap({ from, to, height = 300 }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (!from || !to || !mapEl.current || !API_KEY) return

    const map = tt.map({
      key: API_KEY,
      container: mapEl.current,
      center: [(from.lng + to.lng) / 2, (from.lat + to.lat) / 2],
      zoom: 13,
      scrollZoom: false,
      dragPan: true,
    })

    mapRef.current = map

    map.on('load', async () => {
      new tt.Marker().setLngLat([from.lng, from.lat]).addTo(map)
      new tt.Marker().setLngLat([to.lng, to.lat]).addTo(map)

      try {
        const route = await calculateRoute(from.lat, from.lng, to.lat, to.lng)
        const coords = route.routeGeometry.map((p) => [p.lon, p.lat])

        if (!mapRef.current) return
        map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: coords },
            },
          },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ff4d1c', 'line-width': 4, 'line-opacity': 0.85 },
        })

        const bounds = new tt.LngLatBounds()
        coords.forEach((c) => bounds.extend(c))
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      } catch {
        const bounds = new tt.LngLatBounds()
        bounds.extend([from.lng, from.lat])
        bounds.extend([to.lng, to.lat])
        map.fitBounds(bounds, { padding: 60, maxZoom: 14 })
      }
    })

    return () => {
      mapRef.current = null
      map.remove()
    }
  }, [from?.lat, from?.lng, to?.lat, to?.lng])

  if (!API_KEY) {
    return (
      <div className="map-frame__fallback" style={{ height }}>
        Map preview unavailable — set VITE_TOMTOM_API_KEY
      </div>
    )
  }

  if (!from || !to) {
    return (
      <div className="map-frame__fallback" style={{ height }}>
        Map unavailable
      </div>
    )
  }

  return (
    <div
      ref={mapEl}
      style={{ position: 'absolute', inset: 0, height }}
      aria-label={`Route map from ${from.lat}, ${from.lng} to ${to.lat}, ${to.lng}`}
      role="img"
    />
  )
}
