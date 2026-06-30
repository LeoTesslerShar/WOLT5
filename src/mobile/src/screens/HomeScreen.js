import React, { useEffect, useState, useCallback } from 'react'
import { Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, View, RefreshControl } from 'react-native'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { colors, typography, spacing, radius } from '../theme'

export default function HomeScreen({ navigation }) {
    const { logout } = useAuth()
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading]         = useState(true)
    const [refreshing, setRefreshing]   = useState(false)

    async function fetchRestaurants() {
        try {
            const res = await api.get('/restaurants')
            setRestaurants(res.data)
        } catch {
            // silently fail — list stays empty
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => { fetchRestaurants() }, [])

    const onRefresh = useCallback(() => { setRefreshing(true); fetchRestaurants() }, [])

    useEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                    <TouchableOpacity onPress={logout}>
                        <Text style={{ color: colors.error, fontSize: 13 }}>Logout</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginLeft: 12 }}>
                        <Text style={{ color: colors.primary, fontSize: 13 }}>Profile</Text>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: () => (
                <View style={{ flexDirection: 'row', marginRight: 8 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
                        <Text style={{ color: colors.primary, fontSize: 13 }}>Cart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={{ marginLeft: 12 }}>
                        <Text style={{ color: colors.primary, fontSize: 13 }}>My Orders</Text>
                    </TouchableOpacity>
                </View>
            ),
        })
    }, [navigation])

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

    return (
        <FlatList
            data={restaurants}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={<Text style={styles.empty}>No restaurants yet.</Text>}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Restaurant', { restaurantId: item._id })}
                >
                    <View style={styles.cardBody}>
                        <Text style={typography.h3}>{item.name}</Text>
                        <Text style={[typography.caption, styles.meta]}>{item.cuisine} • {item.address}</Text>
                        <Text style={[typography.body, styles.desc]} numberOfLines={2}>{item.description}</Text>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            )}
        />
    )
}

const styles = StyleSheet.create({
    list:    { padding: spacing.md },
    empty:   { textAlign: 'center', marginTop: spacing.xl, color: colors.border },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.md,
        padding: spacing.md, marginBottom: spacing.md,
        flexDirection: 'row', alignItems: 'center',
    },
    cardBody: { flex: 1 },
    meta:     { color: colors.border, marginTop: 2 },
    desc:     { marginTop: spacing.xs },
    arrow:    { fontSize: 24, color: colors.border, marginLeft: spacing.sm },
})