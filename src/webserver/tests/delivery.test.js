const { test, describe } = require('node:test')
const assert = require('assert/strict')
const { estimateDelivery, haversineKm, PREP_MINUTES } = require('../utils/delivery')

describe('haversineKm', () => {
    test('distance between identical points is 0', () => {
        assert.equal(haversineKm(32.07, 34.79, 32.07, 34.79), 0)
    })
    test('Tel Aviv → Haifa is roughly 80–95 km', () => {
        const d = haversineKm(32.07, 34.79, 32.79, 34.99)
        assert.ok(d > 70 && d < 100, `expected ~80km, got ${d}`)
    })
})

describe('estimateDelivery', () => {
    test('adds prep time plus travel time when both have coordinates', () => {
        const restaurant = { lat: 32.07, lng: 34.79 }
        const user = { lat: 32.08, lng: 34.80 } // ~1.4 km away
        const eta = estimateDelivery(restaurant, user)
        assert.equal(eta.prepMinutes, PREP_MINUTES)
        assert.ok(eta.travelMinutes >= 1)
        assert.equal(eta.totalMinutes, eta.prepMinutes + eta.travelMinutes)
        assert.ok(eta.distanceKm > 0)
    })

    test('a farther user gets a longer travel time', () => {
        const restaurant = { lat: 32.07, lng: 34.79 }
        const near = estimateDelivery(restaurant, { lat: 32.08, lng: 34.80 })
        const far = estimateDelivery(restaurant, { lat: 32.79, lng: 34.99 })
        assert.ok(far.travelMinutes > near.travelMinutes)
    })

    test('falls back to a flat estimate when coordinates are missing', () => {
        const eta = estimateDelivery({ lat: 32.07, lng: 34.79 }, null)
        assert.equal(eta.distanceKm, null)
        assert.equal(eta.totalMinutes, PREP_MINUTES + 15)
    })

    test('falls back when the restaurant has no coordinates', () => {
        const eta = estimateDelivery({}, { lat: 32.0, lng: 34.0 })
        assert.equal(eta.distanceKm, null)
    })
})
