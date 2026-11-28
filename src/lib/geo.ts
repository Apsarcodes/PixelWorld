export interface MetroLocation {
  slug: string
  name: string
  lat: number
  lng: number
}

export const INDIAN_METROS: MetroLocation[] = [
  { slug: 'mumbai', name: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { slug: 'delhi', name: 'Delhi NCR', lat: 28.6139, lng: 77.209 },
  { slug: 'bangalore', name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { slug: 'chennai', name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { slug: 'hyderabad', name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
  { slug: 'pune', name: 'Pune', lat: 18.5204, lng: 73.8567 },
  { slug: 'kolkata', name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { slug: 'ahmedabad', name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
]

export function findNearestMetro(lat: number, lng: number): string {
  let nearest = INDIAN_METROS[0]
  let minDistance = Infinity

  for (const metro of INDIAN_METROS) {
    const dLat = metro.lat - lat
    const dLng = metro.lng - lng
    const dist = dLat * dLat + dLng * dLng
    if (dist < minDistance) {
      minDistance = dist
      nearest = metro
    }
  }

  return nearest.slug
}

export async function detectUserCity(): Promise<string> {
  // 1. Browser GPS Geolocation
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 300000,
        })
      })
      if (pos.coords) {
        return findNearestMetro(pos.coords.latitude, pos.coords.longitude)
      }
    } catch {
      // Continue to IP detection
    }
  }

  // 2. IP-based location fallback
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
      if (res.ok) {
        const data = await res.json()
        if (data.latitude && data.longitude) {
          return findNearestMetro(Number(data.latitude), Number(data.longitude))
        }
        if (data.city) {
          const matched = INDIAN_METROS.find(
            (m) =>
              m.slug.toLowerCase().includes(data.city.toLowerCase()) ||
              data.city.toLowerCase().includes(m.slug.toLowerCase()),
          )
          if (matched) return matched.slug
        }
      }
    } catch {
      // Fallback
    }
  }

  return 'mumbai'
}
