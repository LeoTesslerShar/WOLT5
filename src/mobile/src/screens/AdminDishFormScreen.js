import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function AdminDishFormScreen({ route, navigation }) {
    const { restaurantId, dish } = route.params
    const isEdit = Boolean(dish)

    const [name, setName] = useState(dish?.name || '')
    const [description, setDescription] = useState(dish?.description || '')
    const [category, setCategory] = useState(dish?.category || '')
    const [price, setPrice] = useState(dish?.price?.toString() || '')
    const [loading, setLoading] = useState(false)

    function validate() {
        if (!name.trim()) return 'Name is required'
        const priceNum = Number(price)
        if (price === '' || Number.isNaN(priceNum) || priceNum <= 0)
            return 'Price must be a positive number'
        return null
    }

    async function save() {
        const error = validate()
        if (error) return Alert.alert('Invalid details', error)

        const body = { name: name.trim(), description, category, price: Number(price) }
        const base = `/restaurants/${restaurantId}/products`

        setLoading(true)
        try {
            if (isEdit) await api.patch(`${base}/${dish._id}`, body)
            else await api.post(base, body)
            navigation.goBack()
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not save dish.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={[typography.h2, styles.title]}>{isEdit ? 'Edit dish' : 'New dish'}</Text>
            <Field label="Name" value={name} onChangeText={setName} />
            <Field label="Description" value={description} onChangeText={setDescription} />
            <Field label="Category" value={category} onChangeText={setCategory} />
            <Field label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

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