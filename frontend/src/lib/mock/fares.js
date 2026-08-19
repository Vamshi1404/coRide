// Base fare rates per km for each ride type (INR)
const BASE_RATES = {
  economy: 8.5,
  comfort: 12.0,
  premium: 18.0,
}

// Surge multipliers by time of day
const SURGE_SCHEDULE = {
  '06:00': 1.0,
  '07:00': 1.3,
  '08:00': 1.8,
  '09:00': 1.5,
  '10:00': 1.0,
  '17:00': 1.2,
  '18:00': 1.7,
  '19:00': 2.0,
  '20:00': 1.5,
  '21:00': 1.2,
  '22:00': 1.0,
}

export function getSurgeMultiplier() {
  const hour = new Date().getHours()
  const timeStr = `${String(hour).padStart(2, '0')}:00`
  return SURGE_SCHEDULE[timeStr] || 1.0
}

export function calculateFare(distanceKm, rideType = 'economy', surgeOverride = null) {
  const rate = BASE_RATES[rideType] || BASE_RATES.economy
  const surge = surgeOverride !== null ? surgeOverride : getSurgeMultiplier()
  const base = distanceKm * rate
  const total = base * surge
  return {
    base: Math.round(base),
    surge,
    total: Math.round(total),
    distance: distanceKm,
    rideType,
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
