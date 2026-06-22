import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, setToken } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const usernameRef = useRef(null)
  const passwordRef = useRef(null)

  const navigate = useNavigate()
  const { login } = useAuth()

  const validate = () => {
    if (!username.trim()){
      setError('Username is required')
      usernameRef.current.focus()
      return false
    }
      
    if (!password){
      setError('Password is required')
      passwordRef.current.focus()
      return false
    }
      
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    try {
      const data = await api.login(username, password)
      setToken(data.token)
      const user = await api.getUser(data.userId)
      login(user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: 380 }}>
        <h2 className="text-center fw-bold mb-4 text-primary">Wolt</h2>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              ref={usernameRef}
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              ref={passwordRef}
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Sign in</button>
        </form>

        <p className="text-center mt-3">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  )

}

