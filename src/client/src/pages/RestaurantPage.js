import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { api } from '../services/api'

export default function RestaurantPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch the restaurant and its menu together; re-run if the id changes.
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([api.getRestaurant(id), api.getProducts(id)])
      .then(([r, p]) => { if (active) { setRestaurant(r); setProducts(p || []) } })
      .catch(err => { if (active) setError(err.message || 'Failed to load restaurant') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

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

        {!loading && !error && restaurant && (
          <>
            <header
              className="rounded-3 mb-4 p-4 text-white"
              style={{ background: 'linear-gradient(135deg, #009de0, #00c2e8)' }}
            >
              <h2 className="fw-bold mb-2">{restaurant.name}</h2>
              <div>
                {restaurant.cuisine && (
                  <span className="badge bg-light text-dark me-2">{restaurant.cuisine}</span>
                )}
                {restaurant.address && <span>📍 {restaurant.address}</span>}
              </div>
              {restaurant.description && <p className="mb-0 mt-2">{restaurant.description}</p>}
            </header>

            <h4 className="fw-bold mb-3">Menu</h4>
            {products.length === 0 ? (
              <p className="text-muted">This restaurant has no menu items yet.</p>
            ) : (
              Object.entries(
                products.reduce((acc, p) => {
                  const cat = p.category || 'General'
                  ;(acc[cat] = acc[cat] || []).push(p)
                  return acc
                }, {})
              ).map(([cat, items]) => (
                <div key={cat} className="mb-4">
                  <h5 className="fw-semibold mb-3 text-muted text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.05em' }}>{cat}</h5>
                  <div className="row g-3">
                    {items.map(p => (
                      <div className="col-12 col-md-6 col-lg-4" key={p.id}>
                        <ProductCard product={p} restaurantId={id} />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
