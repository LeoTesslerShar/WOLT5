import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api, { setAuthToken } from '../services/api'

const AuthContext = createContext(null)
const STORAGE_KEY = 'wolt.session'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    // true while we check storage for a saved session on launch
    const [restoring, setRestoring] = useState(true)

    // restore a persisted session when the app starts
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((raw) => {
                if (!raw) return
                const saved = JSON.parse(raw)
                setAuthToken(saved.token)
                setToken(saved.token)
                setUser(saved.user)
            })
            .catch(() => {})
            .finally(() => setRestoring(false))
    }, [])

    async function login(username, password) {
        const res = await api.post('/tokens', { username, password })
        const { token: jwt, userId, displayName, image, isOwner } = res.data
        const nextUser = { userId, displayName, image, isOwner }
        setAuthToken(jwt)
        setToken(jwt)
        setUser(nextUser)
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: jwt, user: nextUser }))
    }

    async function logout() {
        setAuthToken(null)
        setToken(null)
        setUser(null)
        await AsyncStorage.removeItem(STORAGE_KEY)
    }

    return (
        <AuthContext.Provider value={{ user, token, restoring, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
