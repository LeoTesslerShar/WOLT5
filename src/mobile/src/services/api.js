import axios from 'axios'

const BASE_URL = 'http://10.0.2.2:3000/api'
const api = axios.create({ baseURL: BASE_URL })

// Attach JWT token to every request automatically.
// AuthContext sets this after login.
export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common['Authorization']
    }
}

export default api
