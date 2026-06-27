import React, { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function AdminDishesScreen({ route, navigation }) {
    const { restaurantId } = route.params
    const [dishes, setDishes] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(() => {
        setLoading(true)
        api.get(`/restaurants/${restaurantId}/products`)
            .then((res) => setDishes(res.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [restaurantId])

    // Reload whenever the screen regains focus, e.g. after add or edit.
    useFocusEffect(load)

    function confirmDelete(dish) {
        Alert.alert('Delete dish', `Delete "${dish.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => remove(dish._id) },
        ])
    }

    async function remove(id) {
        try {
            await api.delete(`/restaurants/${restaurantId}/products/${id}`)
            setDishes((prev) => prev.filter((d) => d._id !== id))
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not delete dish.')
        }
    }

    if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />

    return (
        <View style={styles.container}>
            <FlatList
                data={dishes}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={[typography.caption, styles.emptyText]}>
                        No dishes yet. Add one below.
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardText}>
                            <Text style={typography.h3}>{item.name}</Text>
                            <Text style={typography.caption}>{item.category} • ₪{item.price}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate('AdminDishForm', { restaurantId, dish: item })
                                }
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
                onPress={() => navigation.navigate('AdminDishForm', { restaurantId })}
            >
                <Text style={styles.buttonText}>Add dish</Text>
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