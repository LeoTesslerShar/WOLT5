import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

export default function CartSidebar() {
  const navigate = useNavigate()
  const { isOpen, closeCart, items, updateQty, total } = useCart()

  if (!isOpen) return null

  return (
    <div className="cart-sidebar">
      {/* header */}
      <div className="cart-header">
        <span className="cart-title">Your order</span>
        <button className="cart-close-btn" onClick={closeCart}>✕</button>
      </div>

      {/* items */}
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-left">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">₪{item.price * item.qty}</span>
            </div>
            <div className="cart-qty-control">
              <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
              <span className="cart-qty-value">{item.qty}</span>
              <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* footer */}
      <div className="cart-footer">
        <div className="cart-total-row">
          <span className="cart-total-label">Total</span>
          <span className="cart-total-price">₪{total}</span>
        </div>
        <button className="cart-checkout-btn" onClick={() => { closeCart(); navigate('/checkout') }}>
          Go to checkout
        </button>
      </div>
    </div>
  )
}
