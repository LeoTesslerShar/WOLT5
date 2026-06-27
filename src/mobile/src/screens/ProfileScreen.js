import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { colors, typography, spacing, radius } from '../theme'

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth()

    return (
        <View style={styles.container}>
            {user?.image ? (
                <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarLetter}>
                        {user?.displayName?.[0]?.toUpperCase() || '?'}
                    </Text>
                </View>
            )}

            <Text style={[typography.h2, styles.name]}>{user?.displayName || 'User'}</Text>
            {user?.isOwner && <Text style={styles.badge}>Restaurant owner</Text>}

            {user?.isOwner && (
                <TouchableOpacity
                    style={styles.manage}
                    onPress={() => navigation.navigate('AdminRestaurants')}
                >
                    <Text style={styles.manageText}>Manage restaurants</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.logout} onPress={logout}>
                <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: colors.background,
        alignItems: 'center', padding: spacing.lg,
    },
    avatar: {
        width: 96, height: 96, borderRadius: 48,
        marginTop: spacing.xl, marginBottom: spacing.md,
    },
    avatarFallback: {
        backgroundColor: colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarLetter: { fontSize: 40, fontWeight: '700', color: colors.primary },
    name: { marginBottom: spacing.xs },
    badge: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    manage: {
        marginTop: spacing.xl, backgroundColor: colors.primary,
        borderRadius: radius.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    },
    manageText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    logout: {
        marginTop: spacing.xl, borderWidth: 1, borderColor: colors.error,
        borderRadius: radius.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    },
    logoutText: { color: colors.error, fontSize: 16, fontWeight: '600' },
})