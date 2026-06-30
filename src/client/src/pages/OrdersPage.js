import React, { useState, useEffect } from 'react'
import { api } from '../services/api'

const CANCEL_WINDOW_MIN = 5
const DEFAULT_ETA_MIN = 30 // fallback when the server didn't provide an ETA

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="wolt-toast">
      <span className="wolt-toast-icon">✓</span>
      {message}
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    api.getOrders()
      .then(data => setOrders(data || []))
      .catch(err => setError(err.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  // tick every 30s so the cancel window and delivered status update live
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])

  const ageMinutes = (order) =>
    order.createdAt ? (now - new Date(order.createdAt).getTime()) / 60000 : 0

  // total estimated minutes from order time to arrival (15 prep + travel)
  const etaMinutes = (order) => order.etaMinutes || DEFAULT_ETA_MIN

  const displayStatus = (order) => {
    if (order.status === 'cancelled') return 'cancelled'
    return ageMinutes(order) >= etaMinutes(order) ? 'delivered' : 'pending'
  }

  // minutes remaining until the order arrives
  const arrivingInMin = (order) =>
    Math.max(1, Math.ceil(etaMinutes(order) - ageMinutes(order)))

  // clock time the order is expected to arrive (e.g. "14:35")
  const arrivalClock = (order) => {
    if (!order.createdAt) return null
    const at = new Date(new Date(order.createdAt).getTime() + etaMinutes(order) * 60000)
    return at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const canCancel = (order) =>
    order.status !== 'cancelled' && ageMinutes(order) < CANCEL_WINDOW_MIN

  const minutesLeft = (order) =>
    Math.max(1, Math.ceil(CANCEL_WINDOW_MIN - ageMinutes(order)))

  const showToast = (msg) => {
    setToast(null)
    setTimeout(() => setToast(msg), 10)
  }

  const cancelOrder = async (orderId) => {
    try {
      await api.updateOrder(orderId, { status: 'cancelled' })
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ))
      setConfirmingId(null)
      showToast('Order cancelled')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status" />
    </div>
  )

  if (error) return (
    <div className="container mt-4">
      <div className="alert alert-danger">{error}</div>
    </div>
  )

  return (
    <div className="container mt-4" style={{ maxWidth: 680 }}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <h2 className="fw-bold mb-4">My Orders</h2>

      {orders.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <p className="fw-semibold fs-5 mb-1">No orders yet</p>
          <p className="text-muted small">Your past orders will appear here.</p>
        </div>
      )}

      {orders.map(order => {
        const total = (order.products || []).reduce((sum, p) => sum + (p.price || 0) * (p.quantity ?? p.qty ?? 1), 0)
        const status = displayStatus(order)
        const cancellable = canCancel(order)
        const isConfirming = confirmingId === order.id
        const date = order.createdAt
          ? new Date(order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          : null

        return (
          <div key={order.id} className={`card mb-3 border-0 shadow-sm overflow-hidden ${status === 'cancelled' ? 'order-cancelled' : ''}`}>
            {/* header */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3"
                 style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <span className="fw-bold" style={{ fontSize: '0.95rem' }}>Order</span>
                <span className="text-muted small ms-2" style={{ fontFamily: 'monospace' }}>
                  #{order.id.slice(0, 8)}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {date && <span className="text-muted small">{date}</span>}
                <span className={`order-status-badge ${status}`}>{status}</span>
              </div>
            </div>

            {/* live delivery ETA — only while the order is on its way */}
            {status === 'pending' && (
              <div className="order-eta-banner">
                <span className="order-eta-icon">🛵</span>
                <div className="order-eta-text">
                  <span className="order-eta-main">Arriving in ~{arrivingInMin(order)} min</span>
                  <span className="order-eta-sub">
                    Estimated arrival {arrivalClock(order)}
                    {order.etaDistanceKm != null && ` · ${order.etaDistanceKm} km away`}
                  </span>
                </div>
              </div>
            )}

            {/* product list */}
            <div className="px-4 py-3">
              {(order.products || []).map((p, i) => (
                <div key={i} className="order-item-row">
                  <div className="order-item-left">
                    <span className="order-qty-bubble">{p.quantity ?? p.qty}</span>
                    <div className="order-item-text">
                      <span className="order-item-name">{p.name}</span>
                      <span className="order-item-price">₪{p.price * (p.quantity ?? p.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="order-total-row">
                <span className="text-muted small">Total</span>
                <span className="order-total-amount">₪{total}</span>
              </div>

              {order.payment && (
                <div className="order-paid-row">
                  <span className="order-paid-badge">✓ Paid</span>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {order.payment.brand} •••• {order.payment.last4}
                  </span>
                </div>
              )}
            </div>

            {/* contact the restaurant to modify the order */}
            {(order.restaurantName || order.restaurantPhone) && (
              <div className="order-contact-box mx-4 mb-3">
                <span className="order-contact-label">In case you want to modify your order:</span>
                <div className="order-contact-details">
                  {order.restaurantName && (
                    <span className="order-contact-name">{order.restaurantName}</span>
                  )}
                  {order.restaurantPhone && (
                    <a href={`tel:${order.restaurantPhone}`} className="order-contact-phone">
                      📞 {order.restaurantPhone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* cancel area — only within the 10-min window */}
            {cancellable && (
              <div className="px-4 pb-3">
                {isConfirming ? (
                  <div className="order-confirm-box">
                    <span className="order-confirm-text">Cancel this order?</span>
                    <div className="d-flex gap-2">
                      <button className="order-confirm-yes" onClick={() => cancelOrder(order.id)}>Yes, cancel</button>
                      <button className="order-confirm-no" onClick={() => setConfirmingId(null)}>Keep it</button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-sm order-cancel-btn" onClick={() => setConfirmingId(order.id)}>
                      Cancel order
                    </button>
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Cancellable for {minutesLeft(order)} more min
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
