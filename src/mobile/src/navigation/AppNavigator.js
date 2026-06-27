import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../contexts/AuthContext'
import { colors } from '../theme'

import HomeScreen       from '../screens/HomeScreen'
import LoginScreen      from '../screens/LoginScreen'
import RegisterScreen   from '../screens/RegisterScreen'
import RestaurantScreen from '../screens/RestaurantScreen'
import OrdersScreen     from '../screens/OrdersScreen'
import SearchScreen     from '../screens/SearchScreen'

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
                <>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={({ navigation }) => ({
                            title: 'Wolt',
                            headerRight: () => (
                                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={{ marginRight: 8 }}>
                                    <Text style={{ fontSize: 20 }}>🔍</Text>
                                </TouchableOpacity>
                            ),
                        })}
                    />
                    <Stack.Screen name="Restaurant" component={RestaurantScreen} />
                    <Stack.Screen name="Orders"     component={OrdersScreen}     options={{ title: 'My Orders' }} />
                    <Stack.Screen name="Search"     component={SearchScreen}     options={{ title: 'Search' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login"    component={LoginScreen}    options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
                </>
            )}
        </Stack.Navigator>
    )
}