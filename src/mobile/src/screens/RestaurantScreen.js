import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '../theme'

export default function RestaurantScreen({ route }) {
    const { restaurantId } = route.params ?? {}
    return (
        <View style={styles.container}>
            <Text style={typography.h1}>Restaurant</Text>
            <Text style={[typography.caption, { marginTop: spacing.sm }]}>ID: {restaurantId}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
})
