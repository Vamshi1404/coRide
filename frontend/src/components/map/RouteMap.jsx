import { useEffect, useRef } from 'react'
import tt from '@tomtom-international/web-sdk-maps'
import { HYDERABAD_CENTER } from '../../lib/hyderabad'

const API_KEY = import.meta.env.VITE_TOMTOM_API_KEY

export default function RouteMap({ from, to, driverLocation, height = '300px' }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const driverMarkerRef = useRef(null)

  useEffect(() => {
    if (!mapEl.current || !API_KEY) return
    const map = tt.map({
      key: API_KEY,
      container: mapEl.current,
      center: [HYDERABAD_CENTER[1], HYDERABAD_CENTER[0]],
      zoom: 12,
      scrollZoom: true,
      dragPan: true,
    })
    mapRef.current = map

    map.on('load', () => {
      const hasCoords = from?.lat && from?.lng && to?.lat && to?.lng
      if (hasCoords) {
        const m1 = new tt.Marker().setLngLat([from.lng, from.lat]).addTo(map)
        const m2 = new tt.Marker().setLngLat([to.lng, to.lat]).addTo(map)
        markersRef.current = [m1, m2]

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
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (from?.lat && from?.lng && to?.lat && to?.lng) {
      const m1 = new tt.Marker().setLngLat([from.lng, from.lat]).addTo(mapRef.current)
      const m2 = new tt.Marker().setLngLat([to.lng, to.lat]).addTo(mapRef.current)
      markersRef.current = [m1, m2]

      const bounds = new tt.LngLatBounds()
      bounds.extend([from.lng, from.lat])
      bounds.extend([to.lng, to.lat])
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14 })
    }
  }, [from?.lat, from?.lng, to?.lat, to?.lng])

  useEffect(() => {
    if (!mapRef.current) return
    if (driverLocation) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLngLat([driverLocation.lng, driverLocation.lat])
      } else {
        const el = document.createElement('div')
        el.className = 'driver-marker'
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          el.classList.add('driver-marker--pulse')
        }
        const marker = new tt.Marker({ element: el })
          .setLngLat([driverLocation.lng, driverLocation.lat])
          .addTo(mapRef.current)
        driverMarkerRef.current = marker
      }
    }
  }, [driverLocation?.lat, driverLocation?.lng])

  return (
    <div style={{ height, width: '100%' }}>
      <div ref={mapEl} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}
