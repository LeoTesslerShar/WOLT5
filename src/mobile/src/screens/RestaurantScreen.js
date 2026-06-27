import React, { useEffect, useState } from 'react'
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function RestaurantScreen({ route, navigation }) {
    const { restaurantId } = route.params ?? {}
    const [restaurant, setRestaurant] = useState(null)
    const [products, setProducts]     = useState([])
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const [rRes, pRes] = await Promise.all([
                    api.get(`/restaurants/${restaurantId}`),
                    api.get(`/restaurants/${restaurantId}/products`),
                ])
                setRestaurant(rRes.data)
                setProducts(pRes.data)
                // set header title dynamically once we know the restaurant name
                navigation.setOptions({ title: rRes.data.name })
            } catch {
                Alert.alert('Error', 'Could not load restaurant')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [restaurantId])

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

    return (
        <FlatList
            data={products}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                restaurant && (
                    <View style={styles.header}>
                        <Text style={typography.h2}>{restaurant.name}</Text>
                        <Text style={[typography.caption, styles.meta]}>
                            {restaurant.cuisine} • {restaurant.address}
                        </Text>
                        <Text style={[typography.body, styles.desc]}>{restaurant.description}</Text>
                        <Text style={[typography.caption, styles.meta]}>📞 {restaurant.phone}</Text>
                        <Text style={styles.menuTitle}>Menu</Text>
                    </View>
                )
            }
            ListEmptyComponent={
                <Text style={[typography.caption, styles.empty]}>No dishes available yet.</Text>
            }
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardBody}>
                        <Text style={typography.h3}>{item.name}</Text>
                        <Text style={[typography.caption, styles.category]}>{item.category}</Text>
                        <Text style={[typography.body, styles.desc]}>{item.description}</Text>
                    </View>
                    <Text style={styles.price}>₪{item.price.toFixed(2)}</Text>
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    list:       { padding: spacing.md },
    header:     { marginBottom: spacing.lg },
    meta:       { marginTop: spacing.xs, color: colors.border },
    desc:       { marginTop: spacing.xs, color: colors.text },
    menuTitle:  { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
    empty:      { textAlign: 'center', marginTop: spacing.xl, color: colors.border },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.md,
        padding: spacing.md, marginBottom: spacing.md,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    cardBody:   { flex: 1, marginRight: spacing.md },
    category:   { color: colors.primary, marginTop: 2 },
    price:      { fontSize: 16, fontWeight: '700', color: colors.primary },
})