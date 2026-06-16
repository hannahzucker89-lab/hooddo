'use client'

import { useEffect, useRef } from 'react'

interface Props {
  onSelect: (coords: { lat: number; lng: number }) => void
  selected: { lat: number; lng: number } | null
}

const TEL_AVIV_CENTER = { lat: 32.0853, lng: 34.7818 }

export default function LocationPicker({ onSelect, selected }: Props) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return

    import('leaflet').then((L) => {
      // אם כבר יש מפה על ה-container — הסר אותה קודם
      if ((containerRef.current as any)._leaflet_id) {
        mapRef.current?.remove()
        mapRef.current = null
        markerRef.current = null
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = selected ?? TEL_AVIV_CENTER
      const map = L.map(containerRef.current!).setView([center.lat, center.lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      if (selected) {
        markerRef.current = L.marker([selected.lat, selected.lng]).addTo(map)
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map)
        }
        onSelect({ lat, lng })
      })

      mapRef.current = map
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-stone-200"
        style={{ height: 220 }}
      />
      <p className="text-xs text-stone-400 mt-1.5 text-center">
        לחצי על המפה לסימון המיקום המדויק
      </p>
    </>
  )
}