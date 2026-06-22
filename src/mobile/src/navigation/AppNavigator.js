import React from 'react'
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
    const { user } = useAuth()

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
