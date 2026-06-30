import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

// Sum the line items of an order, which the server does not store directly.
function orderTotal(order) {
    return order.products.reduce((sum, p) => sum + p.price * p.quantity, 0)
}

export default function OrdersScreen() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/orders')
            .then((res) => setOrders(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    async function cancelOrder(id) {
        try {
            await api.patch(`/orders/${id}`, { status: 'cancelled' })
            setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: 'cancelled' } : o)))
        } catch (err) {
            Alert.alert('Could not cancel', err.response?.data?.error || 'Try again.')
        }
    }

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

    if (orders.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={typography.h2}>No orders yet</Text>
                <Text style={[typography.caption, { marginTop: spacing.sm }]}>
                    Your past orders will show up here.
                </Text>
            </View>
        )
    }

    return (
        <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardTop}>
                        <Text style={typography.h3}>{item.restaurantName || 'Restaurant'}</Text>
                        <Text style={styles.status}>{item.status}</Text>
                    </View>
                    {item.products.map((p) => (
                        <Text key={p.productId} style={typography.caption}>
                            {p.quantity}× {p.name}
                        </Text>
                    ))}
                    <View style={styles.cardBottom}>
                        <Text style={typography.body}>₪{orderTotal(item).toFixed(2)}</Text>
                        {item.etaMinutes != null && (
                            <Text style={typography.caption}>ETA {item.etaMinutes} min</Text>
                        )}
                    </View>
                    {item.status !== 'cancelled' && (
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelOrder(item._id)}>
                            <Text style={styles.cancelText}>Cancel order</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    empty: {
        flex: 1, backgroundColor: colors.background,
        alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
    },
    list: { padding: spacing.md },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.md,
        padding: spacing.md, marginBottom: spacing.md,
    },
    cardTop: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: spacing.sm,
    },
    status: {
        color: colors.primary, fontSize: 13, fontWeight: '600',
        textTransform: 'capitalize',
    },
    cardBottom: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: spacing.sm,
    },
    cancelBtn: {
        marginTop: spacing.md, borderWidth: 1, borderColor: colors.error,
        borderRadius: radius.sm, paddingVertical: spacing.sm, alignItems: 'center',
    },
    cancelText: { color: colors.error, fontSize: 14, fontWeight: '600' },
})