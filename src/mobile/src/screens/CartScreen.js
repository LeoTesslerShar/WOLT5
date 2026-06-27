import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useCart } from '../contexts/CartContext'
import { colors, typography, spacing, radius } from '../theme'

export default function CartScreen({ navigation }) {
    const { items, total, setQuantity, removeItem } = useCart()

    if (items.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={typography.h2}>Your cart is empty</Text>
                <Text style={[typography.caption, { marginTop: spacing.sm }]}>
                    Add dishes from a restaurant to get started.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.productId}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardTop}>
                            <Text style={typography.h3}>{item.name}</Text>
                            <Text style={typography.body}>
                                ₪{(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.cardBottom}>
                            <View style={styles.stepper}>
                                <TouchableOpacity
                                    style={styles.stepBtn}
                                    onPress={() => setQuantity(item.productId, item.quantity - 1)}
                                >
                                    <Text style={styles.stepText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.qty}>{item.quantity}</Text>
                                <TouchableOpacity
                                    style={styles.stepBtn}
                                    onPress={() => setQuantity(item.productId, item.quantity + 1)}
                                >
                                    <Text style={styles.stepText}>+</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => removeItem(item.productId)}>
                                <Text style={styles.remove}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={typography.h3}>Total</Text>
                    <Text style={typography.h3}>₪{total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Checkout')}
                >
                    <Text style={styles.buttonText}>Go to checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    empty: {
        flex: 1, backgroundColor: colors.background,
        alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
    },
    list: { padding: spacing.md },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.md,
        padding: spacing.md, marginBottom: spacing.md,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
    cardBottom: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: spacing.md,
    },
    stepper: { flexDirection: 'row', alignItems: 'center' },
    stepBtn: {
        width: 32, height: 32, borderRadius: radius.sm,
        backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
        alignItems: 'center', justifyContent: 'center',
    },
    stepText: { fontSize: 20, color: colors.text },
    qty: { fontSize: 16, marginHorizontal: spacing.md, minWidth: 20, textAlign: 'center' },
    remove: { color: colors.error, fontSize: 14 },
    footer: {
        borderTopWidth: 1, borderTopColor: colors.border,
        padding: spacing.md, backgroundColor: colors.background,
    },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md,
    },
    button: {
        backgroundColor: colors.primary, borderRadius: radius.sm,
        padding: spacing.md, alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})