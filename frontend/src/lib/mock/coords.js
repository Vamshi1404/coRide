// Mock route coordinates for live tracking simulation
// Sampled every 2s of simulated time — actual on-screen position is
// interpolated every animation frame between the last two points.

export const MOCK_DRIVER_ROUTE = [
  { lat: 17.4401, lng: 78.3489, timestamp: 0 },
  { lat: 17.4412, lng: 78.3501, timestamp: 2000 },
  { lat: 17.4425, lng: 78.3518, timestamp: 4000 },
  { lat: 17.4438, lng: 78.3532, timestamp: 6000 },
  { lat: 17.445, lng: 78.355, timestamp: 8000 },
  { lat: 17.4465, lng: 78.3568, timestamp: 10000 },
  { lat: 17.4478, lng: 78.3585, timestamp: 12000 },
  { lat: 17.449, lng: 78.36, timestamp: 14000 },
  { lat: 17.4505, lng: 78.3618, timestamp: 16000 },
  { lat: 17.452, lng: 78.3635, timestamp: 18000 },
  { lat: 17.4535, lng: 78.365, timestamp: 20000 },
  { lat: 17.4548, lng: 78.3668, timestamp: 22000 },
  { lat: 17.456, lng: 78.3685, timestamp: 24000 },
  { lat: 17.4575, lng: 78.37, timestamp: 26000 },
  { lat: 17.459, lng: 78.3718, timestamp: 28000 },
  { lat: 17.4602, lng: 78.3732, timestamp: 30000 },
  { lat: 17.4615, lng: 78.375, timestamp: 32000 },
  { lat: 17.463, lng: 78.3765, timestamp: 34000 },
  { lat: 17.4642, lng: 78.378, timestamp: 36000 },
  { lat: 17.4655, lng: 78.3798, timestamp: 38000 },
  { lat: 17.4668, lng: 78.3812, timestamp: 40000 },
  { lat: 17.468, lng: 78.383, timestamp: 42000 },
  { lat: 17.4695, lng: 78.3845, timestamp: 44000 },
  { lat: 17.4708, lng: 78.386, timestamp: 46000 },
  { lat: 17.472, lng: 78.3878, timestamp: 48000 },
  { lat: 17.4735, lng: 78.3892, timestamp: 50000 },
  { lat: 17.4748, lng: 78.391, timestamp: 52000 },
  { lat: 17.476, lng: 78.3925, timestamp: 54000 },
  { lat: 17.4775, lng: 78.394, timestamp: 56000 },
  { lat: 17.4788, lng: 78.3958, timestamp: 58000 },
  { lat: 17.48, lng: 78.3972, timestamp: 60000 },
]

export const MOCK_ROUTE_POLYLINE = [
  [17.4401, 78.3489],
  [17.4425, 78.3518],
  [17.445, 78.355],
  [17.4478, 78.3585],
  [17.4505, 78.3618],
  [17.4535, 78.365],
  [17.456, 78.3685],
  [17.459, 78.3718],
  [17.4615, 78.375],
  [17.4642, 78.378],
  [17.4668, 78.3812],
  [17.4695, 78.3845],
  [17.472, 78.3878],
  [17.4748, 78.391],
  [17.4775, 78.394],
  [17.48, 78.3972],
]

// Interpolate between two coordinate points based on progress (0-1)
export function interpolatePosition(pointA, pointB, progress) {
  return {
    lat: pointA.lat + (pointB.lat - pointA.lat) * progress,
    lng: pointA.lng + (pointB.lng - pointA.lng) * progress,
  }
}

// Get current position from route based on elapsed time
export function getPositionAtTime(elapsedMs) {
  const route = MOCK_DRIVER_ROUTE
  if (elapsedMs <= 0) return route[0]
  if (elapsedMs >= route[route.length - 1].timestamp) return route[route.length - 1]

  for (let i = 0; i < route.length - 1; i++) {
    if (elapsedMs >= route[i].timestamp && elapsedMs < route[i + 1].timestamp) {
      const segmentDuration = route[i + 1].timestamp - route[i].timestamp
      const progress = (elapsedMs - route[i].timestamp) / segmentDuration
      return interpolatePosition(route[i], route[i + 1], progress)
    }
  }
  return route[route.length - 1]
}
