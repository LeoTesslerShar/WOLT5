import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { api } from '../services/api'

export default function SearchResultsPage() {
  const [params] = useSearchParams()
  const query = params.get('query') || ''

  const [results, setResults] = useState({ restaurants: [], products: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Re-run whenever the query in the URL changes (SPA navigation, no refresh).
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    api.search(query)
      .then(data => { if (active) setResults({ restaurants: data.restaurants || [], products: data.products || [] }) })
      .catch(err => { if (active) setError(err.message || 'Search failed') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [query])

  const { restaurants, products } = results
  const total = restaurants.length + products.length

  return (
    <div>
      <div className="container my-4">
        <h4 className="fw-bold mb-3">Results for “{query}”</h4>

        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        )}

        {!loading && error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && total === 0 && (
          <div className="text-center text-muted my-5">
            <p className="fs-5">No results found</p>
          </div>
        )}

        {!loading && !error && restaurants.length > 0 && (
          <section className="mb-5">
            <h5 className="text-muted mb-3">Restaurants</h5>
            <div className="row g-3">
              {restaurants.map(r => (
                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={r.id}>
                  <RestaurantCard restaurant={r} />
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && products.length > 0 && (
          <section className="mb-5">
            <h5 className="text-muted mb-3">Dishes</h5>
            <div className="list-group">
              {products.map(p => (
                <div className="list-group-item d-flex justify-content-between align-items-center" key={p.id}>
                  <div>
                    <div className="fw-semibold">{p.name}</div>
                    {p.description && <div className="small text-muted">{p.description}</div>}
                  </div>
                  {p.price != null && <span className="badge bg-primary rounded-pill">₪{p.price}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
