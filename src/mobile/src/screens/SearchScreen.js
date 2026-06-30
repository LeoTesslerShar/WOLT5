import React, { useState } from 'react'
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator,
} from 'react-native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function SearchScreen({ navigation }) {
    const [query, setQuery]       = useState('')
    const [results, setResults]   = useState(null)
    const [loading, setLoading]   = useState(false)

    async function handleSearch(text) {
        setQuery(text)
        // clear results instantly when input is empty, no API call needed
        if (!text.trim()) { setResults(null); return }
        setLoading(true)
        try {
            const res = await api.get(`/search?query=${encodeURIComponent(text.trim())}`)
            setResults(res.data)
        } catch {
            setResults({ restaurants: [], products: [] })
        } finally {
            setLoading(false)
        }
    }

    const hasResults = results && (results.restaurants.length > 0 || results.products.length > 0)

    return (
        <View style={styles.container}>
            <View style={styles.searchRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Search restaurants or dishes..."
                    placeholderTextColor={colors.border}
                    value={query}
                    onChangeText={handleSearch}
                    autoFocus
                />
            </View>

            {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />}

            {!loading && results && !hasResults && (
                <Text style={styles.empty}>No results for "{query}"</Text>
            )}

            {!loading && hasResults && (
                <FlatList
                    data={[
                        ...results.restaurants.map(r => ({ ...r, _type: 'restaurant' })),
                        ...results.products.map(p => ({ ...p, _type: 'product' })),
                    ]}
                    keyExtractor={item => item._id + item._type}
                    contentContainerStyle={{ padding: spacing.md }}
                    renderItem={({ item }) =>
                        item._type === 'restaurant'
                            ? <RestaurantResult item={item} onPress={() => navigation.navigate('Restaurant', { restaurantId: item._id })} />
                            : <ProductResult item={item} />
                    }
                />
            )}
        </View>
    )
}

function RestaurantResult({ item, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.typeTag}>
                <Text style={styles.typeText}>Restaurant</Text>
            </View>
            <Text style={typography.h3}>{item.name}</Text>
            <Text style={[typography.caption, { color: colors.border }]}>{item.cuisine} • {item.address}</Text>
        </TouchableOpacity>
    )
}

function ProductResult({ item }) {
    return (
        <View style={styles.card}>
            <View style={[styles.typeTag, styles.typeTagProduct]}>
                <Text style={styles.typeText}>Dish</Text>
            </View>
            <Text style={typography.h3}>{item.name}</Text>
            <Text style={[typography.caption, { color: colors.primary }]}>{item.category}</Text>
            <Text style={[typography.body, { marginTop: spacing.xs }]}>₪{item.price?.toFixed(2)}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container:      { flex: 1, backgroundColor: colors.background },
    searchRow:      { padding: spacing.md, paddingBottom: 0 },
    input: {
        borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
        padding: spacing.md, fontSize: 15, color: colors.text, backgroundColor: colors.surface,
    },
    empty:          { textAlign: 'center', marginTop: spacing.xl, color: colors.border },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.md,
        padding: spacing.md, marginBottom: spacing.md,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
    },
    typeTag:        { alignSelf: 'flex-start', backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, marginBottom: spacing.xs },
    typeTagProduct: { backgroundColor: colors.success },
    typeText:       { color: '#fff', fontSize: 11, fontWeight: '600' },
})