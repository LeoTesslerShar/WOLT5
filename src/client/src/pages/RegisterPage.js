import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isOwner, setIsOwner] = useState(false)
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [error, setError] = useState('')

  const usernameRef    = useRef(null)
  const passwordRef    = useRef(null)
  const confirmRef     = useRef(null)
  const displayNameRef = useRef(null)
  const imageRef       = useRef(null)
  const latRef         = useRef(null)
  const lngRef         = useRef(null)

  const navigate = useNavigate()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result)
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

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

    const tooShort = password.length < 8
    const noNumbers = !/\d/.test(password)
    if (tooShort && noNumbers) {
      setError('Password must be at least 8 characters and contain at least one number')
      passwordRef.current.focus()
      return false
    }
    if (tooShort) {
      setError('Password must be at least 8 characters')
      passwordRef.current.focus()
      return false
    }
    if (noNumbers) {
      setError('Password must contain at least one number')
      passwordRef.current.focus()
      return false
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      confirmRef.current.focus()
      return false
    }

    if (!displayName.trim()) {
      setError('Display name is required')
      displayNameRef.current.focus()
      return false
    }

    if (!image) {
      setError('Please select a profile picture')
      imageRef.current.focus()
      return false
    }

    const latNum = parseFloat(lat)
    if (lat.trim() === '' || Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('A valid latitude (-90 to 90) is required')
      latRef.current.focus()
      return false
    }

    const lngNum = parseFloat(lng)
    if (lng.trim() === '' || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('A valid longitude (-180 to 180) is required')
      lngRef.current.focus()
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    try {
      await api.register(username, password, displayName, image, isOwner, parseFloat(lat), parseFloat(lng))
      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 py-4">
        <div className="card p-4 shadow" style={{ width: 420 }}>
          <h2 className="text-center fw-bold mb-4 text-primary">Wolt</h2>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input ref={usernameRef} type="text" className="form-control"
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input ref={passwordRef} type="password" className="form-control"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm password</label>
              <input ref={confirmRef} type="password" className="form-control"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Display name</label>
              <input ref={displayNameRef} type="text" className="form-control"
                value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Profile picture</label>
              <input ref={imageRef} type="file" accept="image/*"
                className="form-control" onChange={handleImage} />
            </div>

            {imagePreview && (
              <div className="text-center mb-3">
                <img src={imagePreview} alt="Preview"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            )}

            <div className="row mb-2">
              <div className="col">
                <label className="form-label">Latitude</label>
                <input ref={latRef} type="number" step="any" className="form-control" placeholder="e.g. 32.0853"
                  value={lat} onChange={e => setLat(e.target.value)} />
              </div>
              <div className="col">
                <label className="form-label">Longitude</label>
                <input ref={lngRef} type="number" step="any" className="form-control" placeholder="e.g. 34.7818"
                  value={lng} onChange={e => setLng(e.target.value)} />
              </div>
            </div>
            <p className="text-muted small mb-3">
              📍 Your location is required so we can estimate delivery times to you.
            </p>

            <div className="mb-3 form-check">
              <input type="checkbox" className="form-check-input" id="isOwner"
                checked={isOwner} onChange={e => setIsOwner(e.target.checked)} />
              <label className="form-check-label" htmlFor="isOwner">
                I am a restaurant owner
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100">Register</button>
          </form>

          <p className="text-center mt-3">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    )
}
