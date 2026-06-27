import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useCart } from '../contexts/CartContext'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function CheckoutScreen({ navigation }) {
    const { items, total, itemsByRestaurant, clearCart } = useCart()
    const [cardName, setCardName] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvv, setCvv] = useState('')
    const [loading, setLoading] = useState(false)

    async function placeOrder() {
        if (items.length === 0) return Alert.alert('Cart is empty', 'Add items before checking out.')
        if (!cardName || !cardNumber || !expiry || !cvv)
            return Alert.alert('Missing details', 'Fill in all payment fields.')

        const payment = { cardName, cardNumber, expiry, cvv }

        // One order per restaurant, since each order belongs to a single restaurant.
        const requests = Object.entries(itemsByRestaurant).map(([restaurantId, group]) => {
            const products = group.map((it) => ({
                productId: it.productId,
                name: it.name,
                price: it.price,
                quantity: it.quantity,
            }))
            return api.post('/orders', { restaurantId, products, payment })
        })

        setLoading(true)
        try {
            await Promise.all(requests)
            clearCart()
            Alert.alert('Order placed', 'Your order is on its way!')
            navigation.navigate('Orders')
        } catch (err) {
            const message = err.response?.data?.error || 'Could not place the order. Try again.'
            Alert.alert('Payment failed', message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={[typography.h2, styles.section]}>Order summary</Text>
            {items.map((item) => (
                <View key={item.productId} style={styles.summaryRow}>
                    <Text style={typography.body}>
                        {item.quantity}× {item.name}
                    </Text>
                    <Text style={typography.body}>₪{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
            ))}
            <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={typography.h3}>Total</Text>
                <Text style={typography.h3}>₪{total.toFixed(2)}</Text>
            </View>

            <Text style={[typography.h2, styles.section]}>Payment</Text>
            <TextInput
                style={styles.input}
                placeholder="Cardholder name"
                value={cardName}
                onChangeText={setCardName}
            />
            <TextInput
                style={styles.input}
                placeholder="Card number"
                keyboardType="number-pad"
                value={cardNumber}
                onChangeText={setCardNumber}
            />
            <View style={styles.row}>
                <TextInput
                    style={[styles.input, styles.half]}
                    placeholder="MM/YY"
                    value={expiry}
                    onChangeText={setExpiry}
                />
                <TextInput
                    style={[styles.input, styles.half]}
                    placeholder="CVV"
                    keyboardType="number-pad"
                    secureTextEntry
                    value={cvv}
                    onChangeText={setCvv}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={placeOrder} disabled={loading}>
                <Text style={styles.buttonText}>
                    {loading ? 'Placing order…' : `Pay ₪${total.toFixed(2)}`}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    section: { marginTop: spacing.lg, marginBottom: spacing.md },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm,
    },
    totalRow: {
        borderTopWidth: 1, borderTopColor: colors.border,
        paddingTop: spacing.md, marginTop: spacing.sm,
    },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
        padding: spacing.md, marginBottom: spacing.md, fontSize: 15,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    half: { width: '48%' },
    button: {
        backgroundColor: colors.primary, borderRadius: radius.sm,
        padding: spacing.md, alignItems: 'center', marginTop: spacing.sm,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})