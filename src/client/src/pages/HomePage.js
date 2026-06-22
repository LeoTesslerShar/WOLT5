import React, { useState, useEffect } from 'react'
import RestaurantCard from '../components/RestaurantCard'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Group a list into { key: [items] } by a key-selector.
const groupBy = (list, keyOf) =>
  list.reduce((acc, item) => {
    const key = keyOf(item) || 'Other'
    ;(acc[key] = acc[key] || []).push(item)
    return acc
  }, {})

// Renders labeled rows: one section per group key, each a responsive card grid.
function CategoryRows({ groups }) {
  return Object.entries(groups).map(([title, list]) => (
    <section key={title} className="mb-4">
      <h4 className="fw-bold mb-3">{title}</h4>
      <div className="row g-3">
        {list.map(r => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={r.id}>
            <RestaurantCard restaurant={r} />
          </div>
        ))}
      </div>
    </section>
  ))
}

export default function HomePage() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch restaurants from the server on first render — nothing is hard-coded.
  useEffect(() => {
    let active = true
    api.getRestaurants()
      .then(data => { if (active) setRestaurants(data || []) })
      .catch(err => { if (active) setError(err.message || 'Failed to load restaurants') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const byCuisine = groupBy(restaurants, r => r.cuisine)
  const byCity = groupBy(restaurants, r => r.address)

  const nearby = user?.lat && user?.lng
    ? [...restaurants]
        .filter(r => r.lat && r.lng)
        .map(r => ({ ...r, distance: haversineKm(user.lat, user.lng, r.lat, r.lng) }))
        .sort((a, b) => a.distance - b.distance)
    : null

  return (
    <div>
      <div className="container my-4">
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        )}

        {!loading && error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center text-muted my-5">
            <p className="fs-5 mb-1">No restaurants yet</p>
            <p className="small">Log in and use “Add restaurant” to create one.</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <>
            {nearby && (
              <>
                <h3 className="fw-bold mb-3">Nearby restaurants</h3>
                <div className="row g-3 mb-5">
                  {nearby.map(r => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={r.id}>
                      <RestaurantCard restaurant={r} badge={`${r.distance.toFixed(1)} km`} />
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 className="fw-bold mb-3">Browse by cuisine</h3>
            <CategoryRows groups={byCuisine} />

            <h3 className="fw-bold mb-3 mt-5">Browse by city</h3>
            <CategoryRows groups={byCity} />
          </>
        )}
      </div>
    </div>
  )
}
