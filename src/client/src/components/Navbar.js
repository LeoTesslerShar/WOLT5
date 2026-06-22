import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useCart } from '../contexts/CartContext'
import { clearToken } from '../services/api'
import SearchBar from './SearchBar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { items, openCart } = useCart()
  const navigate = useNavigate()
  const cartCount = items.reduce((sum, i) => sum + i.qty, 0)

  const handleLogout = () => {
    clearToken()
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar app-navbar px-4 py-2 shadow-sm d-flex align-items-center justify-content-between"
        style={{ backgroundColor: 'var(--navbar-bg)' }}>

        <span className="fw-bold fs-4 text-white" role="button" onClick={() => navigate('/')}>
            Wolt
        </span>

        <SearchBar />

        <div className="d-flex align-items-center gap-3">
        {cartCount > 0 && (
          <button className="btn btn-sm btn-warning fw-bold" onClick={openCart}>
            🛒 {cartCount}
          </button>
        )}
        {user ? (
            <>
            <button className="btn btn-sm btn-light" onClick={toggleTheme}>
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {user.image && (
                <img src={user.image} alt={user.displayName}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            )}
            <span className="text-white fw-semibold">{user.displayName}</span>
            <button className="btn btn-sm btn-outline-light" onClick={() => navigate('/orders')}>
                My Orders
            </button>
            {user.isOwner && (
              <button className="btn btn-sm btn-outline-light" onClick={() => navigate('/admin')}>
                My Restaurant
              </button>
            )}
            <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
                Logout
            </button>
            </>
        ) : (
            <button className="btn btn-sm btn-light" onClick={() => navigate('/login')}>
                Log in
            </button>
        )}
        </div>
    </nav>
    )
}
