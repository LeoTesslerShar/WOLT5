import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function AdminRestaurantFormScreen({ route, navigation }) {
    const existing = route.params?.restaurant
    const isEdit = Boolean(existing)

    const [name, setName] = useState(existing?.name || '')
    const [description, setDescription] = useState(existing?.description || '')
    const [cuisine, setCuisine] = useState(existing?.cuisine || '')
    const [address, setAddress] = useState(existing?.address || '')
    const [phone, setPhone] = useState(existing?.phone || '')
    const [lat, setLat] = useState(existing?.lat?.toString() || '')
    const [lng, setLng] = useState(existing?.lng?.toString() || '')
    const [loading, setLoading] = useState(false)

    function validate() {
        if (!name.trim()) return 'Name is required'
        if (!phone.trim()) return 'Phone number is required'
        const latNum = Number(lat)
        if (lat === '' || Number.isNaN(latNum) || latNum < -90 || latNum > 90)
            return 'Latitude must be between -90 and 90'
        const lngNum = Number(lng)
        if (lng === '' || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180)
            return 'Longitude must be between -180 and 180'
        return null
    }

    async function save() {
        const error = validate()
        if (error) return Alert.alert('Invalid details', error)

        const body = {
            name: name.trim(),
            description,
            cuisine,
            address,
            phone,
            lat: Number(lat),
            lng: Number(lng),
        }

        setLoading(true)
        try {
            if (isEdit) await api.patch(`/restaurants/${existing._id}`, body)
            else await api.post('/restaurants', body)
            navigation.goBack()
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not save restaurant.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={[typography.h2, styles.title]}>
                {isEdit ? 'Edit restaurant' : 'New restaurant'}
            </Text>
            <Field label="Name" value={name} onChangeText={setName} />
            <Field label="Description" value={description} onChangeText={setDescription} />
            <Field label="Cuisine" value={cuisine} onChangeText={setCuisine} />
            <Field label="Address" value={address} onChangeText={setAddress} />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Field label="Latitude" value={lat} onChangeText={setLat} keyboardType="numbers-and-punctuation" />
            <Field label="Longitude" value={lng} onChangeText={setLng} keyboardType="numbers-and-punctuation" />

            <TouchableOpacity style={styles.button} onPress={save} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

function Field({ label, ...props }) {
    return (
        <>
            <Text style={styles.label}>{label}</Text>
            <TextInput style={styles.input} {...props} />
        </>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    title: { marginBottom: spacing.md },
    label: { ...typography.caption, marginBottom: spacing.xs },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
        padding: spacing.md, marginBottom: spacing.md, fontSize: 15,
    },
    button: {
        backgroundColor: colors.primary, borderRadius: radius.sm,
        padding: spacing.md, alignItems: 'center', marginTop: spacing.sm,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})