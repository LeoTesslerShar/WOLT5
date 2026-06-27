import React, { useEffect, useState, useCallback } from 'react'
import { Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, View, RefreshControl, Image } from 'react-native'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { colors, typography, spacing, radius } from '../theme'

export default function HomeScreen({ navigation }) {
    const { logout, user }           = useAuth()
    const { isDark, toggleTheme }    = useTheme()
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading]         = useState(true)
    const [refreshing, setRefreshing]   = useState(false)

    const bg      = isDark ? '#121212' : colors.background
    const cardBg  = isDark ? '#1E1E1E' : colors.surface
    const textCol = isDark ? '#FFFFFF' : colors.text
    const subCol  = isDark ? '#AAAAAA' : colors.textSecondary

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
                <View style={styles.headerLeft}>
                    {user?.image ? (
                        <Image source={{ uri: user.image }} style={styles.avatar} />
                    ) : null}
                    <TouchableOpacity onPress={logout} style={{ marginLeft: 8 }}>
                        <Text style={{ color: '#fff', fontSize: 13 }}>Logout</Text>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: () => (
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 12 }}>
                        <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={{ marginRight: 16 }}>
                        <Text style={{ color: '#fff', fontSize: 13 }}>My Orders</Text>
                    </TouchableOpacity>
                </View>
            ),
        })
    }, [navigation, isDark, user])

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

    return (
        <FlatList
            data={restaurants}
            keyExtractor={item => item._id}
            contentContainerStyle={[styles.list, { backgroundColor: bg }]}
            style={{ backgroundColor: bg }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            ListEmptyComponent={<Text style={[styles.empty, { color: subCol }]}>No restaurants yet.</Text>}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: cardBg }]}
                    onPress={() => navigation.navigate('Restaurant', { restaurantId: item._id })}
                >
                    <View style={styles.cardBody}>
                        <Text style={[typography.h3, { color: textCol }]}>{item.name}</Text>
                        <Text style={[typography.caption, { color: subCol, marginTop: 2 }]}>{item.cuisine} • {item.address}</Text>
                        <Text style={[typography.body, { color: textCol, marginTop: spacing.xs }]} numberOfLines={2}>{item.description}</Text>
                    </View>
                    <Text style={[styles.arrow, { color: subCol }]}>›</Text>
                </TouchableOpacity>
            )}
        />
    )
}

const styles = StyleSheet.create({
    list:       { padding: spacing.md, flexGrow: 1 },
    empty:      { textAlign: 'center', marginTop: spacing.xl },
    headerLeft: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    headerRight:{ flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 30, height: 30, borderRadius: 15,
        borderWidth: 2, borderColor: '#fff',
    },
    card: {
        borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
    },
    cardBody: { flex: 1 },
    arrow:    { fontSize: 24, marginLeft: spacing.sm },
})