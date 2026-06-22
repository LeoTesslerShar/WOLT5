import React from 'react'
import { useNavigate } from 'react-router-dom'
import './RestaurantCard.css'

// The server's restaurant object has no image field, so we render a colored
// banner with an emoji chosen by cuisine — a Wolt-style placeholder.
const CUISINE_EMOJI = {
  American: '🍔',
  Japanese: '🍣',
  Italian: '🍕',
  Mexican: '🌮',
  Israeli: '🧆',
  Vegan: '🥗',
  Chinese: '🥡',
  Indian: '🍛',
  Dessert: '🍰'
}

export default function RestaurantCard({ restaurant, badge }) {
  const { id, name, description, cuisine, address } = restaurant
  const emoji = CUISINE_EMOJI[cuisine] || '🍽️'
  const navigate = useNavigate()

  return (
    <div className="card h-100 shadow-sm border-0 restaurant-card"
      onClick={() => navigate(`/restaurant/${id}`)}>
      <div className="restaurant-card__banner d-flex align-items-center justify-content-center position-relative">
        <span style={{ fontSize: '3rem' }}>{emoji}</span>
        {badge && (
          <span className="badge bg-primary position-absolute bottom-0 end-0 m-2">{badge}</span>
        )}
      </div>
      <div className="card-body">
        <h5 className="card-title mb-1">{name}</h5>
        {cuisine && (
          <span className="badge rounded-pill bg-light text-dark mb-2">{cuisine}</span>
        )}
        {description && <p className="card-text small text-muted mb-1">{description}</p>}
        {address && <p className="card-text small text-secondary mb-0">📍 {address}</p>}
      </div>
    </div>
  )
}
