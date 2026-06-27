import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import HomeScreen from '../screens/HomeScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import RestaurantScreen from '../screens/RestaurantScreen'
import CartScreen from '../screens/CartScreen'
import CheckoutScreen from '../screens/CheckoutScreen'
import OrdersScreen from '../screens/OrdersScreen'
import ProfileScreen from '../screens/ProfileScreen'
import AdminRestaurantsScreen from '../screens/AdminRestaurantsScreen'
import AdminRestaurantFormScreen from '../screens/AdminRestaurantFormScreen'
import AdminDishesScreen from '../screens/AdminDishesScreen'
import AdminDishFormScreen from '../screens/AdminDishFormScreen'
import AdminOrdersScreen from '../screens/AdminOrdersScreen'
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

// Temporary header links until the Wolt-style drawer (story 3.2) lands.
function HomeHeaderRight({ navigation }) {
    const { itemCount } = useCart()
    return (
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Text style={styles.headerLink}>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Text>
        </TouchableOpacity>
    )
}

function HomeHeaderLeft({ navigation }) {
    return (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.headerLink}>Profile</Text>
        </TouchableOpacity>
    )
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
                            headerLeft: () => <HomeHeaderLeft navigation={navigation} />,
                            headerRight: () => <HomeHeaderRight navigation={navigation} />,
                        })}
                    />
                    <Stack.Screen name="Restaurant" component={RestaurantScreen} />
                    <Stack.Screen name="Cart" component={CartScreen} />
                    <Stack.Screen name="Checkout" component={CheckoutScreen} />
                    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen
                        name="AdminRestaurants"
                        component={AdminRestaurantsScreen}
                        options={{ title: 'My Restaurants' }}
                    />
                    <Stack.Screen
                        name="AdminRestaurantForm"
                        component={AdminRestaurantFormScreen}
                        options={{ title: 'Restaurant' }}
                    />
                    <Stack.Screen
                        name="AdminDishes"
                        component={AdminDishesScreen}
                        options={{ title: 'Dishes' }}
                    />
                    <Stack.Screen
                        name="AdminDishForm"
                        component={AdminDishFormScreen}
                        options={{ title: 'Dish' }}
                    />
                    <Stack.Screen
                        name="AdminOrders"
                        component={AdminOrdersScreen}
                        options={{ title: 'Restaurant Orders' }}
                    />
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

const styles = StyleSheet.create({
    headerLink: { color: colors.primary, fontSize: 15, fontWeight: '600' },
})
