import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { api } from '../services/api'

// ── client-side card form validation (matches the server) ──────────
const luhnValid = (digits) => {
  let sum = 0, alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10)
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

const expiryValid = (expiry) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry.trim())
  if (!m) return false
  const month = parseInt(m[1], 10)
  const year = 2000 + parseInt(m[2], 10)
  if (month < 1 || month > 12) return false
  return new Date(year, month, 1) > new Date()
}

const validateCard = ({ cardName, cardNumber, expiry, cvv }) => {
  if (!cardName.trim()) return 'Cardholder name is required'
  const digits = cardNumber.replace(/[\s-]/g, '')
  if (!/^\d{13,19}$/.test(digits)) return 'Card number must be 13–19 digits'
  if (!luhnValid(digits)) return 'Card number is invalid'
  if (!expiryValid(expiry)) return 'Expiry must be MM/YY and not in the past'
  if (!/^\d{3,4}$/.test(cvv)) return 'CVV must be 3 or 4 digits'
  return null
}

// group the card number into blocks of 4 as the user types
const formatCardNumber = (value) =>
  value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()

const formatExpiry = (value) => {
  const v = value.replace(/\D/g, '').slice(0, 4)
  return v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v
}

export default function CheckoutPage() {
  const { items, total, restaurantId, clear } = useCart()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // card form state
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const handleOrder = async () => {
    setError('')
    const card = { cardName, cardNumber, expiry, cvv }
    const cardError = validateCard(card)
    if (cardError) { setError(cardError); return }

    setLoading(true)
    try {
      await api.createOrder({
        restaurantId,
        products: items,
        payment: {
          cardName,
          cardNumber: cardNumber.replace(/[\s-]/g, ''),
          expiry,
          cvv
        }
      })
      clear()
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="container mt-5 text-center" style={{ maxWidth: 480 }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
      <h3 className="fw-bold mb-2">Order placed!</h3>
      <p className="text-muted mb-4">Your food is on its way. You can track it in My Orders.</p>
      <button className="cart-checkout-btn" onClick={() => navigate('/orders')}>
        View my orders
      </button>
    </div>
  )

  if (items.length === 0) return (
    <div className="container mt-5 text-center" style={{ maxWidth: 480 }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
      <h4 className="fw-bold mb-2">Your cart is empty</h4>
      <p className="text-muted mb-4">Add items from a restaurant to get started.</p>
      <button className="cart-checkout-btn" onClick={() => navigate('/')}>Browse restaurants</button>
    </div>
  )

  return (
    <div className="container mt-4" style={{ maxWidth: 560 }}>
      <h2 className="fw-bold mb-4">Checkout</h2>

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body px-4 py-3">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}>
            Your items
          </h6>

          {items.map(item => (
            <div key={item.id} className="checkout-item-row">
              <div className="checkout-item-left">
                <span className="order-qty-bubble">{item.qty}</span>
                <span className="checkout-item-name">{item.name}</span>
                <span className="checkout-item-price">₪{item.price * item.qty}</span>
              </div>
            </div>
          ))}

          <div className="checkout-total-row">
            <span className="checkout-total-label">Total</span>
            <span className="checkout-total-amount">₪{total}</span>
          </div>
        </div>
      </div>

      {/* payment card */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body px-4 py-3">
          <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.06em' }}>
            💳 Payment details
          </h6>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Cardholder name</label>
            <input
              className="form-control"
              placeholder="Name on card"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Card number</label>
            <input
              className="form-control"
              inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
            />
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold">Expiry</label>
              <input
                className="form-control"
                inputMode="numeric"
                placeholder="MM/YY"
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
              />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label small fw-semibold">CVV</label>
              <input
                className="form-control"
                inputMode="numeric"
                placeholder="123"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </div>

          <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
            🔒 This is a demo — no real charge is made. Card details are validated for format only and never stored.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

      <button
        className="cart-checkout-btn"
        onClick={handleOrder}
        disabled={loading}
      >
        {loading ? 'Placing order…' : `Pay ₪${total} & place order`}
      </button>
    </div>
  )
}
