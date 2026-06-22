import React, { useEffect, useState } from 'react'
import { Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import api from '../services/api'
import { colors, typography, spacing, radius } from '../theme'

export default function HomeScreen({ navigation }) {
    const [restaurants, setRestaurants] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/restaurants')
        .then(res => setRestaurants(res.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }, [])

    if (loading) 
        return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />


    return (
        <FlatList
            data={restaurants}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => navigation.navigate('Restaurant', { restaurantId: item._id })}
                >
                    <Text style={typography.h3}>{item.name}</Text>
                    <Text style={typography.caption}>{item.cuisine} • {item.address}</Text>
                    <Text style={[typography.caption, { marginTop: spacing.xs }]}>{item.description}</Text>
                </TouchableOpacity>
            )}
        />
    )
}

const styles = StyleSheet.create({
    list: { padding: spacing.md },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
})

