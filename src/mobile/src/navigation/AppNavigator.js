import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../contexts/AuthContext'
import HomeScreen from '../screens/HomeScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import RestaurantScreen from '../screens/RestaurantScreen'
import OrdersScreen from '../screens/OrdersScreen'
import { colors } from '../theme'

const Stack = createNativeStackNavigator()

const screenOptions = {
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text },
}

export default function AppNavigator() {
    const { user, loading } = useAuth()

    // Wait for the persisted session to be read before deciding which stack to
    // show, otherwise we'd briefly flash the Login screen on every cold start.
    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    return (
        <Stack.Navigator screenOptions={screenOptions}>
            {user ? (
                // Logged-in screens
                <>
                    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Wolt' }} />
                    <Stack.Screen name="Restaurant" component={RestaurantScreen} />
                    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
                </>
            ) : (
                // Auth screens
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
                </>
            )}
        </Stack.Navigator>
    )
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
})
