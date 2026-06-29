'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onSelect: (coords: { lat: number; lng: number }) => void
  selected: { lat: number; lng: number } | null
}

const ISRAEL_CENTER = { lat: 31.5, lng: 34.75 }
const ISRAEL_ZOOM = 7

export default function LocationPicker({ onSelect, selected }: Props) {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [results, setResults] = useState<{ lat: number; lng: number; display_name: string }[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return

    import('leaflet').then((L) => {
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

      const center = selected ?? ISRAEL_CENTER
      const zoom = selected ? 15 : ISRAEL_ZOOM
      const map = L.map(containerRef.current!).setView([center.lat, center.lng], zoom)

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

  // כש-selected משתנה מבחוץ (למשל GPS) - נזיז את המפה
  useEffect(() => {
    if (!selected || !mapRef.current) return
    import('leaflet').then((L) => {
      mapRef.current.setView([selected.lat, selected.lng], 15)
      if (markerRef.current) {
        markerRef.current.setLatLng([selected.lat, selected.lng])
      } else {
        markerRef.current = L.marker([selected.lat, selected.lng]).addTo(mapRef.current)
      }
    })
  }, [selected])

  async function handleSearch() {
    if (query.trim().length < 2) return
    setSearching(true)
    setSearchError('')
    setResults([])
    try {
      const res = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (!res.ok || !data.results?.length) {
        setSearchError('לא הצלחנו למצוא את הכתובת. נסו לכתוב שם רחוב ועיר (למשל: דיזנגוף 50, תל אביב), או לבחור את המיקום ישירות על המפה.')
        return
      }
      setResults(data.results)
    } catch {
      setSearchError('שגיאה בחיפוש. נסו שוב.')
    } finally {
      setSearching(false)
    }
  }

  function selectResult(result: { lat: number; lng: number; display_name: string }) {
    setResults([])
    setQuery(result.display_name.split(',')[0])
    if (mapRef.current) {
      mapRef.current.setView([result.lat, result.lng], 15)
    }
    import('leaflet').then((L) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([result.lat, result.lng])
      } else {
        markerRef.current = L.marker([result.lat, result.lng]).addTo(mapRef.current)
      }
    })
    onSelect({ lat: result.lat, lng: result.lng })
  }

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="חפשו כתובת, מקום או עיר"
          className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400"
          dir="rtl"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2.5 bg-stone-100 rounded-xl text-sm text-stone-600 font-medium active:scale-95 transition-transform disabled:opacity-50"
        >
          {searching ? '...' : '🔍'}
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-500 mb-2 text-right">{searchError}</p>
      )}

      {results.length > 0 && (
        <div className="border border-stone-200 rounded-xl overflow-hidden mb-3 bg-white shadow-sm">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectResult(r)}
              className="w-full text-right px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 border-b border-stone-100 last:border-0 leading-snug"
            >
              {r.display_name.split(',').slice(0, 2).join(',')}
            </button>
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-stone-200"
        style={{ height: 220 }}
      />
      <p className="text-xs text-stone-400 mt-1.5 text-center">
        אפשר גם ללחוץ על המפה לדיוק המיקום
      </p>
      {selected && (
        <p className="text-xs text-stone-500 mt-1.5 text-center">
          📍 המיקום שנבחר: {query || 'על פי המפה'}
        </p>
      )}
    </>
  )
}
