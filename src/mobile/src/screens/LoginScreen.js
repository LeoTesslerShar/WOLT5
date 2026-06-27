import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { colors, typography, spacing, radius } from '../theme'

export default function LoginScreen({ navigation }) {
    const { login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors]     = useState({})
    const [touched, setTouched]   = useState({})
    const [loading, setLoading]   = useState(false)

    function validateField(key, val) {
        return val.trim() ? null : 'Required'
    }

    function blur(key, val) {
        setTouched(t => ({ ...t, [key]: true }))
        setErrors(e => ({ ...e, [key]: validateField(key, val) }))
    }

    function changeField(key, val, setter) {
        setter(val)
        // also clear the server auth error when the user starts correcting input
        if (touched[key]) setErrors(e => ({ ...e, [key]: validateField(key, val), auth: null }))
    }

    async function handleLogin() {
        setTouched({ username: true, password: true })
        const errs = {
            username: validateField('username', username),
            password: validateField('password', password),
        }
        setErrors(errs)
        if (errs.username || errs.password) return

        setLoading(true)
        try {
            await login(username, password)
        } catch {
            setErrors({ auth: 'Invalid username or password' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={[typography.h1, styles.title]}>Sign in</Text>

            <Text style={styles.label}>Username</Text>
            {touched.username && errors.username && <Text style={styles.error}>{errors.username}</Text>}
            <TextInput
                style={[styles.input, touched.username && errors.username && styles.inputError]}
                autoCapitalize="none"
                value={username}
                onChangeText={v => changeField('username', v, setUsername)}
                onBlur={() => blur('username', username)}
            />

            <Text style={styles.label}>Password</Text>
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
            <TextInput
                style={[styles.input, touched.password && errors.password && styles.inputError]}
                secureTextEntry
                value={password}
                onChangeText={v => changeField('password', v, setPassword)}
                onBlur={() => blur('password', password)}
            />

            {errors.auth && <Text style={styles.authError}>{errors.auth}</Text>}

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Sign in</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[typography.caption, styles.link]}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container:      { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
    title:          { marginBottom: spacing.xl },
    label:          { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 2 },
    error:          { fontSize: 11, color: colors.error, marginBottom: 4 },
    authError:      { fontSize: 13, color: colors.error, textAlign: 'center', marginBottom: spacing.md },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
        padding: spacing.md, marginBottom: spacing.md, fontSize: 15,
        color: colors.text, backgroundColor: colors.surface,
    },
    inputError:     { borderColor: colors.error },
    button:         { backgroundColor: colors.primary, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
    buttonDisabled: { opacity: 0.6 },
    buttonText:     { color: '#fff', fontSize: 16, fontWeight: '600' },
    link:           { textAlign: 'center', color: colors.primary },
})