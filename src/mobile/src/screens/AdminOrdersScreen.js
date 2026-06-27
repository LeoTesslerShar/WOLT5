import React, { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

const STATUSES = ['pending', 'preparing', 'delivering', 'delivered']

export default function AdminOrdersScreen({ route }) {
    const { restaurantId } = route.params
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(() => {
        setLoading(true)
        api.get(`/restaurants/${restaurantId}/orders`)
            .then((res) => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [restaurantId])

    useFocusEffect(load)

    async function setStatus(orderId, status) {
        try {
            await api.patch(`/orders/${orderId}`, { status })
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status } : o))
            )
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not update status.')
        }
    }

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

    return (
        <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
                <Text style={[typography.caption, styles.emptyText]}>No orders for this restaurant.</Text>
            }
            renderItem={({ item }) => (
                <View style={styles.card}>
                    {item.products.map((p) => (
                        <Text key={p.productId || p.name} style={typography.caption}>
                            {p.quantity}× {p.name}
                        </Text>
                    ))}
                    <Text style={[typography.caption, styles.current]}>Status: {item.status}</Text>
                    <View style={styles.statusRow}>
                        {STATUSES.map((s) => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.chip, item.status === s && styles.chipActive]}
                                onPress={() => setStatus(item._id, s)}
                            >
                                <Text style={[styles.chipText, item.status === s && styles.chipTextActive]}>
                                    {s}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    list: { padding: spacing.md },
    emptyText: { textAlign: 'center', marginTop: spacing.xl },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.md,
        padding: spacing.md, marginBottom: spacing.md,
    },
    current: { marginTop: spacing.sm, fontWeight: '600', color: colors.text },
    statusRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
    chip: {
        borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
        paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
        marginRight: spacing.sm, marginBottom: spacing.sm,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.text, fontSize: 13, textTransform: 'capitalize' },
    chipTextActive: { color: '#fff' },
})