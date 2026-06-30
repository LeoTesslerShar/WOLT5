import React, { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function AdminRestaurantsScreen({ navigation }) {
    const { user } = useAuth()
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(() => {
        setLoading(true)
        api.get('/restaurants')
            .then((res) => setRestaurants(res.data.filter((r) => r.ownerId === user.userId)))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [user.userId])

    // Reload whenever the screen regains focus, e.g. after add or edit.
    useFocusEffect(load)

    function confirmDelete(restaurant) {
        Alert.alert('Delete restaurant', `Delete "${restaurant.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => remove(restaurant._id) },
        ])
    }

    async function remove(id) {
        try {
            await api.delete(`/restaurants/${id}`)
            setRestaurants((prev) => prev.filter((r) => r._id !== id))
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not delete restaurant.')
        }
    }

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

    return (
        <View style={styles.container}>
            <FlatList
                data={restaurants}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={[typography.caption, styles.emptyText]}>
                        You have no restaurants yet. Add one below.
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardText}>
                            <Text style={typography.h3}>{item.name}</Text>
                            <Text style={typography.caption}>{item.cuisine} • {item.address}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AdminDishes', { restaurantId: item._id })}
                            >
                                <Text style={styles.edit}>Dishes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AdminOrders', { restaurantId: item._id })}
                            >
                                <Text style={styles.edit}>Orders</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AdminRestaurantForm', { restaurant: item })}
                            >
                                <Text style={styles.edit}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => confirmDelete(item)}>
                                <Text style={styles.delete}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('AdminRestaurantForm')}
            >
                <Text style={styles.buttonText}>Add restaurant</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md },
    emptyText: { textAlign: 'center', marginTop: spacing.xl },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md,
        marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: { flex: 1, paddingRight: spacing.md },
    actions: { flexDirection: 'row', alignItems: 'center' },
    edit: { color: colors.primary, fontSize: 14, marginRight: spacing.md },
    delete: { color: colors.error, fontSize: 14 },
    button: {
        backgroundColor: colors.primary, borderRadius: radius.sm,
        padding: spacing.md, alignItems: 'center', margin: spacing.md,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})