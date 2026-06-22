import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, typography, spacing } from '../theme'

export default function RegisterScreen() {
    return (
        <View style={styles.container}>
            <Text style={typography.h1}>Register</Text>
            <Text style={[typography.caption, { marginTop: spacing.sm }]}>Coming soon</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, justifyContent: 'center' },
})
