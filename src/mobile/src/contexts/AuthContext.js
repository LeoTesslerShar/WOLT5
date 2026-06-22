import React, { createContext, useContext, useState } from 'react'
import api, { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    async function login(username, password) {
        const res = await api.post('/tokens', { username, password })
        const { token: jwt, userId, displayName, image, isOwner } = res.data
        setAuthToken(jwt)
        setToken(jwt)
        setUser({ userId, displayName, image, isOwner })
    }

    function logout() {
        setAuthToken(null)
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
