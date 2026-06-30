import React, { useState } from 'react'
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

const RULES = {
    username:    v => v.trim().length >= 3          || 'Min 3 characters',
    password:    v => /^(?=.*\d).{8,}$/.test(v)    || 'Min 8 chars, at least 1 digit',
    confirm:     (v, pwd) => v === pwd              || 'Passwords do not match',
    displayName: v => v.trim().length >= 1          || 'Required',
    lat: v => { const n = Number(v); return (!isNaN(n) && n >= -90  && n <= 90)  || 'Must be -90 to 90'   },
    lng: v => { const n = Number(v); return (!isNaN(n) && n >= -180 && n <= 180) || 'Must be -180 to 180' },
}

function validateAll(fields, image) {
    const errs = {}
    const checks = {
        username:    () => RULES.username(fields.username),
        password:    () => RULES.password(fields.password),
        confirm:     () => RULES.confirm(fields.confirm, fields.password),
        displayName: () => RULES.displayName(fields.displayName),
        lat:         () => RULES.lat(fields.lat),
        lng:         () => RULES.lng(fields.lng),
    }
    for (const [k, fn] of Object.entries(checks)) {
        const r = fn()
        if (r !== true) errs[k] = r
    }
    if (!image) errs.image = 'Profile picture required'
    return errs
}

export default function RegisterScreen({ navigation }) {
    const [fields, setFields] = useState({
        username: '', password: '', confirm: '',
        displayName: '', lat: '', lng: '',
    })
    const [image, setImage]     = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [errors, setErrors]   = useState({})
    const [touched, setTouched] = useState({})
    const [loading, setLoading] = useState(false)

    function set(key, val) {
        const next = { ...fields, [key]: val }
        setFields(next)
        // re-validate only fields the user already visited, to avoid showing errors prematurely
        if (touched[key]) {
            const errs = validateAll({ ...next }, image)
            setErrors(e => ({ ...e, [key]: errs[key] }))
        }
    }

    function blur(key) {
        // mark field as visited on first blur so errors start showing
        setTouched(t => ({ ...t, [key]: true }))
        const errs = validateAll(fields, image)
        setErrors(e => ({ ...e, [key]: errs[key] }))
    }

    function useDefaultAvatar() {
        const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(fields.displayName || 'User')}&size=200&background=009DE0&color=fff`
        setImage(url)
        setErrors(e => ({ ...e, image: undefined }))
    }
    async function pickImage() {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!perm.granted) {
            Alert.alert('Permission needed', 'Allow access to your photo library.')
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        })
        if (!result.canceled) {
            setImage(result.assets[0].uri)
            setErrors(e => ({ ...e, image: undefined }))
        }
    }

    async function handleRegister() {
        // touch all fields so every error shows on submit attempt
        const allTouched = Object.fromEntries(
            [...Object.keys(fields), 'image'].map(k => [k, true])
        )
        setTouched(allTouched)
        const errs = validateAll(fields, image)
        setErrors(errs)
        if (Object.keys(errs).length > 0) return

        setLoading(true)
        try {
            await api.post('/users', {
                username: fields.username.trim(),
                password: fields.password,
                displayName: fields.displayName.trim(),
                image,
                isOwner,
                lat: Number(fields.lat),
                lng: Number(fields.lng),
            })
            Alert.alert('Account created!', 'You can now log in.', [
                { text: 'OK', onPress: () => navigation.navigate('Login') },
            ])
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed'
            if (msg.toLowerCase().includes('username')) {
                setErrors(e => ({ ...e, username: 'Username already taken' }))
            } else {
                Alert.alert('Error', msg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={[typography.h1, styles.title]}>Create account</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image
                    ? <Image source={{ uri: image }} style={styles.avatar} />
                    : <Text style={styles.imagePlaceholder}>Tap to pick{'\n'}profile picture</Text>
                }
            </TouchableOpacity>
            <TouchableOpacity onPress={useDefaultAvatar} style={styles.defaultAvatarBtn}>
                <Text style={styles.defaultAvatarText}>Use default avatar</Text>
            </TouchableOpacity>
            {touched.image && errors.image && <Text style={[styles.hint, styles.errorText]}>{errors.image}</Text>}

            <Field label="Username" hint="Min 3 characters"
                value={fields.username} onChangeText={v => set('username', v)} onBlur={() => blur('username')}
                autoCapitalize="none" error={touched.username && errors.username}
            />
            <Field label="Password" hint="Min 8 chars, at least 1 digit"
                value={fields.password} onChangeText={v => set('password', v)} onBlur={() => blur('password')}
                secureTextEntry error={touched.password && errors.password}
            />
            <Field label="Confirm password"
                value={fields.confirm} onChangeText={v => set('confirm', v)} onBlur={() => blur('confirm')}
                secureTextEntry error={touched.confirm && errors.confirm}
            />
            <Field label="Display name"
                value={fields.displayName} onChangeText={v => set('displayName', v)} onBlur={() => blur('displayName')}
                error={touched.displayName && errors.displayName}
            />
            <Field label="Latitude" hint="-90 to 90"
                value={fields.lat} onChangeText={v => set('lat', v)} onBlur={() => blur('lat')}
                keyboardType="numeric" error={touched.lat && errors.lat}
            />
            <Field label="Longitude" hint="-180 to 180"
                value={fields.lng} onChangeText={v => set('lng', v)} onBlur={() => blur('lng')}
                keyboardType="numeric" error={touched.lng && errors.lng}
            />

            <TouchableOpacity style={styles.toggle} onPress={() => setIsOwner(o => !o)}>
                <View style={[styles.checkbox, isOwner && styles.checkboxOn]} />
                <Text style={typography.body}>I am a restaurant owner</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Register</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[typography.caption, styles.link]}>Already have an account? Sign in</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

function Field({ label, hint, error, ...inputProps }) {
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.label}>{label}</Text>
            {hint  && <Text style={styles.hint}>{hint}</Text>}
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={colors.border}
                {...inputProps}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    scroll:     { flex: 1, backgroundColor: colors.background },
    container:  { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
    title:      { marginBottom: spacing.lg },
    imagePicker: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
        alignSelf: 'center', justifyContent: 'center', alignItems: 'center',
        marginBottom: spacing.xs, overflow: 'hidden',
    },
    avatar:           { width: 100, height: 100 },
    imagePlaceholder: { color: colors.border, fontSize: 12, textAlign: 'center' },
    defaultAvatarBtn:  { alignSelf: 'center', marginBottom: spacing.sm },
    defaultAvatarText: { color: colors.primary, fontSize: 12, textDecorationLine: 'underline' },
    fieldWrap:  { marginBottom: spacing.md },
    label:      { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 2 },
    hint:       { fontSize: 11, color: colors.border, marginBottom: 4 },
    errorText:  { fontSize: 11, color: colors.error, marginBottom: 4 },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
        padding: spacing.md, fontSize: 15, color: colors.text, backgroundColor: colors.surface,
    },
    inputError:   { borderColor: colors.error },
    toggle:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    checkbox:     { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.primary },
    checkboxOn:   { backgroundColor: colors.primary },
    button:       { backgroundColor: colors.primary, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
    buttonDisabled: { opacity: 0.6 },
    buttonText:   { color: '#fff', fontSize: 16, fontWeight: '600' },
    link:         { textAlign: 'center', color: colors.primary },
})