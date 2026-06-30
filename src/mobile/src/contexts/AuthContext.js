import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api, { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

// Keys used to persist the session in AsyncStorage so it survives app restarts.
const TOKEN_KEY = 'auth.token'
const USER_KEY = 'auth.user'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    // While we read the persisted session on startup we don't yet know if the
    // user is logged in, so we hold off rendering to avoid flashing the Login screen.
    const [loading, setLoading] = useState(true)

    // Rehydrate the session from AsyncStorage on app start.
    useEffect(() => {
        async function restoreSession() {
            try {
                const [storedToken, storedUser] = await Promise.all([
                    AsyncStorage.getItem(TOKEN_KEY),
                    AsyncStorage.getItem(USER_KEY),
                ])
                if (storedToken && storedUser) {
                    setAuthToken(storedToken)
                    setToken(storedToken)
                    setUser(JSON.parse(storedUser))
                }
            } catch (err) {
                // Corrupt/unavailable storage: start logged out rather than crash.
                console.warn('Failed to restore session', err)
            } finally {
                setLoading(false)
            }
        }
        restoreSession()
    }, [])

    async function login(username, password) {
        const res = await api.post('/tokens', { username, password })
        const { token: jwt, userId, displayName, image, isOwner } = res.data
        const nextUser = { userId, displayName, image, isOwner }
        setAuthToken(jwt)
        setToken(jwt)
        setUser(nextUser)
        await AsyncStorage.multiSet([
            [TOKEN_KEY, jwt],
            [USER_KEY, JSON.stringify(nextUser)],
        ])
    }

    async function logout() {
        setAuthToken(null)
        setToken(null)
        setUser(null)
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY])
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
