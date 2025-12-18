'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Activity, ActivityCompletion } from '@/lib/types'

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface MapViewProps {
  activities: Activity[]
  completions: ActivityCompletion[]
  currentActivityId?: string
  className?: string
}

export function MapView({ 
  activities, 
  completions, 
  currentActivityId,
  className 
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [icons, setIcons] = useState<{
    completed: L.Icon
    current: L.Icon
    locked: L.Icon
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)
    
    // Import Leaflet only on client
    import('leaflet').then((L) => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Custom icons
      const createIcon = (color: string) => new L.Icon({
        iconUrl: `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36">
            <path fill="${color}" stroke="#000" stroke-width="0.5" d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24C24 5.4 18.6 0 12 0z"/>
            <circle fill="#fff" cx="12" cy="12" r="6"/>
          </svg>
        `)}`,
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
      })

      setIcons({
        completed: createIcon('#10B981'),
        current: createIcon('#D4AF37'),
        locked: createIcon('#71717A'),
      })
    })
  }, [])

  if (!isMounted || !icons) {
    return (
      <div className={`bg-zinc-900 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-zinc-500">Caricamento mappa...</div>
      </div>
    )
  }

  // Calculate center
  const centerLat = activities.reduce((sum, a) => sum + Number(a.latitude), 0) / activities.length
  const centerLng = activities.reduce((sum, a) => sum + Number(a.longitude), 0) / activities.length

  const getMarkerIcon = (activityId: string) => {
    const isCompleted = completions.some(c => c.activity_id === activityId)
    const isCurrent = activityId === currentActivityId
    
    if (isCompleted) return icons.completed
    if (isCurrent) return icons.current
    return icons.locked
  }

  return (
    <div className={className}>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        className="rounded-xl"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {activities.map((activity) => (
          <Marker
            key={activity.id}
            position={[Number(activity.latitude), Number(activity.longitude)]}
            icon={getMarkerIcon(activity.id)}
          >
            <Popup>
              <div className="text-zinc-900">
                <h3 className="font-semibold">{activity.sequence_order}. {activity.name}</h3>
                <p className="text-sm text-zinc-600">{activity.description}</p>
                <p className="text-xs mt-1">Difficoltà: {activity.difficulty}/10</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
