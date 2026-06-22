import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { colors, typography, spacing, radius } from '../theme'

export default function LoginScreen({ navigation }) {
    const { login } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        if (!username || !password) return Alert.alert('Error', 'Fill in all fields')
        setLoading(true)
        try {
            await login(username, password)
        } catch {
            Alert.alert('Error', 'Invalid username or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={[typography.h1, styles.title]}>Sign in</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[typography.caption, styles.link]}>Don't have an account? Register</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
    title: { marginBottom: spacing.xl },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
        padding: spacing.md, marginBottom: spacing.md, fontSize: 15,
    },
    button: {
        backgroundColor: colors.primary, borderRadius: radius.sm,
        padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    link: { textAlign: 'center', color: colors.primary },
})
