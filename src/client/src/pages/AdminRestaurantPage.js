import React, { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function AdminRestaurantPage() {
  const { user } = useAuth()

  const [restaurants, setRestaurants] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // product form state
  const [products, setProducts] = useState([])
  const [editingProductId, setEditingProductId] = useState(null)
  const [pName, setPName] = useState('')
  const [pDescription, setPDescription] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pCategory, setPCategory] = useState('')
  const [pError, setPError] = useState('')

  useEffect(() => {
    api.getRestaurants()
      .then(data => setRestaurants((data || []).filter(r => r.ownerId === user?.id)))
      .catch(err => setError(err.message))
  }, [])

  // fetch products when a restaurant is selected
  useEffect(() => {
    if (!selectedRestaurant) { setProducts([]); return }
    api.getProducts(selectedRestaurant.id)
      .then(data => setProducts(data || []))
      .catch(err => setPError(err.message))
  }, [selectedRestaurant])

  const resetForm = () => {
    setName(''); setCuisine(''); setAddress(''); setDescription('')
    setLat(''); setLng(''); setPhone('')
    setEditingId(null); setError(''); setSuccess('')
    setSelectedRestaurant(null)
  }

  const handleEdit = (restaurant) => {
    setEditingId(restaurant.id)
    setSelectedRestaurant(restaurant)
    setName(restaurant.name || '')
    setCuisine(restaurant.cuisine || '')
    setAddress(restaurant.address || '')
    setDescription(restaurant.description || '')
    setLat(restaurant.lat ?? '')
    setLng(restaurant.lng ?? '')
    setPhone(restaurant.phone || '')
    setError(''); setSuccess('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return
    try {
      await api.deleteRestaurant(id)
      setRestaurants(prev => prev.filter(r => r.id !== id))
      if (selectedRestaurant?.id === id) setSelectedRestaurant(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (!name.trim()) return setError('Name is required')
    if (!cuisine.trim()) return setError('Cuisine is required')
    if (!address.trim()) return setError('Address is required')
    if (!phone.trim()) return setError('Phone number is required')

    // coordinates are required so delivery distance can be computed
    const rLat = parseFloat(lat)
    if (String(lat).trim() === '' || Number.isNaN(rLat) || rLat < -90 || rLat > 90)
      return setError('A valid latitude (-90 to 90) is required')
    const rLng = parseFloat(lng)
    if (String(lng).trim() === '' || Number.isNaN(rLng) || rLng < -180 || rLng > 180)
      return setError('A valid longitude (-180 to 180) is required')

    try {
      if (editingId) {
        await api.updateRestaurant(editingId, { name, cuisine, address, description, lat: rLat, lng: rLng, phone })
        setRestaurants(prev => prev.map(r =>
          r.id === editingId ? { ...r, name, cuisine, address, description, lat: rLat, lng: rLng, phone } : r
        ))
        setSuccess('Restaurant updated!')
      } else {
        const data = await api.createRestaurant({ name, cuisine, address, description, lat: rLat, lng: rLng, phone })
        setRestaurants(prev => [...prev, { ...data, name, cuisine, address, description, lat: rLat, lng: rLng, phone, ownerId: user?.id }])
        setSuccess('Restaurant created!')
      }
      resetForm()
    } catch (err) {
      setError(err.message)
    }
  }

  // ---- product handlers ----

  const resetProductForm = () => {
    setPName(''); setPDescription(''); setPPrice(''); setPCategory('')
    setEditingProductId(null); setPError('')
  }

  const handleProductEdit = (product) => {
    setEditingProductId(product.id)
    setPName(product.name || '')
    setPDescription(product.description || '')
    setPPrice(product.price ?? '')
    setPCategory(product.category || '')
    setPError('')
  }

  const handleProductDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.deleteProduct(selectedRestaurant.id, productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (err) {
      setPError(err.message)
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setPError('')
    if (!pName.trim()) return setPError('Name is required')
    if (!pPrice || isNaN(pPrice) || Number(pPrice) <= 0) return setPError('Valid price is required')
    try {
      if (editingProductId) {
        await api.updateProduct(selectedRestaurant.id, editingProductId, {
          name: pName, description: pDescription, price: Number(pPrice), category: pCategory
        })
        setProducts(prev => prev.map(p =>
          p.id === editingProductId
            ? { ...p, name: pName, description: pDescription, price: Number(pPrice), category: pCategory }
            : p
        ))
      } else {
        await api.createProduct(selectedRestaurant.id, {
          name: pName, description: pDescription, price: Number(pPrice), category: pCategory
        })
        // re-fetch to get the new product with its id
        const updated = await api.getProducts(selectedRestaurant.id)
        setProducts(updated || [])
      }
      resetProductForm()
    } catch (err) {
      setPError(err.message)
    }
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h2 className="fw-bold mb-4">My Restaurant</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* restaurant create / edit form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <h5>{editingId ? 'Edit Restaurant' : 'Create New Restaurant'}</h5>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Cuisine *</label>
          <input className="form-control" value={cuisine} onChange={e => setCuisine(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Address *</label>
          <input className="form-control" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone *</label>
          <input className="form-control" placeholder="e.g. 03-1234567" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="row mb-1">
          <div className="col">
            <label className="form-label">Latitude *</label>
            <input type="number" step="any" className="form-control" placeholder="e.g. 32.0853"
              value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className="col">
            <label className="form-label">Longitude *</label>
            <input type="number" step="any" className="form-control" placeholder="e.g. 34.7818"
              value={lng} onChange={e => setLng(e.target.value)} />
          </div>
        </div>
        <p className="text-muted small mb-3">
          📍 The restaurant's exact location is required to estimate delivery times.
        </p>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            {editingId ? 'Save Changes' : 'Create Restaurant'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
          )}
        </div>
      </form>

      {/* list of my restaurants */}
      <h5>My Restaurants</h5>
      {restaurants.length === 0 && <p className="text-muted">No restaurants yet.</p>}
      {restaurants.map(r => (
        <div key={r.id} className="card mb-2 shadow-sm border-0">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">{r.name}</div>
              <div className="small text-muted">{r.cuisine} · {r.address}</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(r)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}

      {/* product management — shown only when a restaurant is selected */}
      {selectedRestaurant && (
        <div className="mt-5">
          <h5>Menu — {selectedRestaurant.name}</h5>

          {pError && <div className="alert alert-danger">{pError}</div>}

          <form onSubmit={handleProductSubmit} className="mb-4">
            <h6>{editingProductId ? 'Edit Product' : 'Add Product'}</h6>
            <div className="mb-2">
              <label className="form-label">Name *</label>
              <input className="form-control" value={pName} onChange={e => setPName(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Price *</label>
              <input className="form-control" type="number" min="0" value={pPrice} onChange={e => setPPrice(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Category</label>
              <input className="form-control" value={pCategory} onChange={e => setPCategory(e.target.value)} />
            </div>
            <div className="mb-2">
              <label className="form-label">Description</label>
              <input className="form-control" value={pDescription} onChange={e => setPDescription(e.target.value)} />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm">
                {editingProductId ? 'Save' : 'Add Product'}
              </button>
              {editingProductId && (
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={resetProductForm}>Cancel</button>
              )}
            </div>
          </form>

          {products.length === 0 && <p className="text-muted">No products yet.</p>}
          {products.map(p => (
            <div key={p.id} className="card mb-2 border-0 shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{p.name}</div>
                  <div className="small text-muted">{p.category} · ₪{p.price}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => handleProductEdit(p)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleProductDelete(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}