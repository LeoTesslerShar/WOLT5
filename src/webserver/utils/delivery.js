// Estimates how long an order takes to reach the customer:
//   total = preparation time + travel time from the restaurant to the user.
// Travel time is derived from the straight-line (Haversine) distance and an
// assumed average courier speed.

const PREP_MINUTES = 15          // time until the courier picks the order up
const COURIER_SPEED_KMH = 30     // average city courier speed (scooter/bike)
const DEFAULT_TRAVEL_MINUTES = 15 // fallback when coordinates are unknown

// great-circle distance between two lat/lng points, in kilometres
function haversineKm(lat1, lng1, lat2, lng2) {
    const toRad = (deg) => (deg * Math.PI) / 180
    const R = 6371 // earth radius in km
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(a))
}

const hasCoords = (p) =>
    p && typeof p.lat === 'number' && typeof p.lng === 'number'

// Returns { totalMinutes, prepMinutes, travelMinutes, distanceKm }.
// distanceKm is null when coordinates are missing.
function estimateDelivery(restaurant, user) {
    if (hasCoords(restaurant) && hasCoords(user)) {
        const distanceKm = haversineKm(restaurant.lat, restaurant.lng, user.lat, user.lng)
        const travelMinutes = Math.max(1, Math.ceil((distanceKm / COURIER_SPEED_KMH) * 60))
        return {
            totalMinutes: PREP_MINUTES + travelMinutes,
            prepMinutes: PREP_MINUTES,
            travelMinutes,
            distanceKm: Math.round(distanceKm * 10) / 10
        }
    }
    // no coordinates → fall back to a flat estimate
    return {
        totalMinutes: PREP_MINUTES + DEFAULT_TRAVEL_MINUTES,
        prepMinutes: PREP_MINUTES,
        travelMinutes: DEFAULT_TRAVEL_MINUTES,
        distanceKm: null
    }
}

module.exports = { estimateDelivery, haversineKm, PREP_MINUTES, COURIER_SPEED_KMH }
