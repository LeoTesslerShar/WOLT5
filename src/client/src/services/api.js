const TOKEN_KEY = 'wolt_jwt'

let authToken = sessionStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  authToken = token
  sessionStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = () => {
  authToken = null
  sessionStorage.removeItem(TOKEN_KEY)
}

// All API calls go through this one function.
// It automatically adds the JWT header when the user is logged in.
async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`/api${path}`, options)

  // handle empty responses (201 No Content, 204, etc.)
  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    throw { status: res.status, message: data?.error || 'Request failed' }
  }
  return data
}

// All server endpoints in one place
export const api = {
  // Auth
  register: (username, password, displayName, image, isOwner = false, lat = null, lng = null) =>
    request('POST', '/users', { username, password, displayName, image, isOwner, lat, lng }),
  login: (username, password) =>
    request('POST', '/tokens', { username, password }),
  getUser: (id) => request('GET', `/users/${id}`),

  // Restaurants
  getRestaurants:    ()         => request('GET',    '/restaurants'),
  getRestaurant:     (id)       => request('GET',    `/restaurants/${id}`),
  createRestaurant:  (data)     => request('POST',   '/restaurants', data),
  updateRestaurant:  (id, data) => request('PATCH',  `/restaurants/${id}`, data),
  deleteRestaurant:  (id)       => request('DELETE', `/restaurants/${id}`),

  // Products
  getProducts:    (rId)          => request('GET',    `/restaurants/${rId}/products`),
  createProduct:  (rId, data)    => request('POST',   `/restaurants/${rId}/products`, data),
  updateProduct:  (rId, pId, d)  => request('PATCH',  `/restaurants/${rId}/products/${pId}`, d),
  deleteProduct:  (rId, pId)     => request('DELETE', `/restaurants/${rId}/products/${pId}`),

  // Orders
  getOrders:    ()         => request('GET',    '/orders'),
  createOrder:  (data)    => request('POST',   '/orders', data),
  deleteOrder:  (id)      => request('DELETE', `/orders/${id}`),
  updateOrder:  (id, data)=> request('PATCH',  `/orders/${id}`, data),

  // Search
  search: (query) => request('GET', `/search?query=${encodeURIComponent(query)}`)
}
