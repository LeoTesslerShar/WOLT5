import React from 'react'
import { useCart } from '../contexts/CartContext'

export default function ProductCard({ product, restaurantId }) {
  const { name, description, price } = product
  const { requestAdd } = useCart()

  const handleAdd = () => {
    // requestAdd shows a styled confirmation if the cart belongs to another restaurant
    requestAdd(product, restaurantId)
  }

  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body d-flex justify-content-between align-items-start">
        <div className="pe-2">
          <h6 className="card-title mb-1">{name}</h6>
          {description && <p className="card-text small text-muted mb-0">{description}</p>}
        </div>
        <div className="d-flex flex-column align-items-end gap-2">
          {price != null && <span className="badge bg-primary rounded-pill">₪{price}</span>}
          <button className="btn btn-sm btn-outline-primary" onClick={handleAdd}>+ Add</button>
        </div>
      </div>
    </div>
  )
}