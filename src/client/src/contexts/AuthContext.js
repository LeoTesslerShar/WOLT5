import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, setToken, clearToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = sessionStorage.getItem('wolt_user')
        if (stored) {
            try { setUser(JSON.parse(stored)) } catch {}
        }
        setLoading(false)
    }, [])

    const login = (userData, jwt) => {
        setUser(userData)
        setToken(jwt)
        sessionStorage.setItem('wolt_user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        clearToken()
        sessionStorage.removeItem('wolt_user')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)