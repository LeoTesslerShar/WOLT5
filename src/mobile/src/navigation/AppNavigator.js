import React from 'react'
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { colors } from '../theme'

import HomeScreen                from '../screens/HomeScreen'
import LoginScreen               from '../screens/LoginScreen'
import RegisterScreen            from '../screens/RegisterScreen'
import RestaurantScreen          from '../screens/RestaurantScreen'
import SearchScreen              from '../screens/SearchScreen'
import CartScreen                from '../screens/CartScreen'
import CheckoutScreen            from '../screens/CheckoutScreen'
import OrdersScreen              from '../screens/OrdersScreen'
import ProfileScreen             from '../screens/ProfileScreen'
import AdminRestaurantsScreen    from '../screens/AdminRestaurantsScreen'
import AdminRestaurantFormScreen from '../screens/AdminRestaurantFormScreen'
import AdminDishesScreen         from '../screens/AdminDishesScreen'
import AdminDishFormScreen       from '../screens/AdminDishFormScreen'
import AdminOrdersScreen         from '../screens/AdminOrdersScreen'

const Stack = createNativeStackNavigator()

const screenOptions = {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { color: '#fff', fontWeight: '700' },
    headerTitleAlign: 'center',
}

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
                <>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={({ navigation }) => ({
                            title: 'Wolt',
                            headerLeft:  () => <HomeHeaderLeft  navigation={navigation} />,
                            headerRight: () => <HomeHeaderRight navigation={navigation} />,
                        })}
                    />
                    <Stack.Screen name="Restaurant"          component={RestaurantScreen} />
                    <Stack.Screen name="Search"              component={SearchScreen}              options={{ title: 'Search' }} />
                    <Stack.Screen name="Cart"                component={CartScreen} />
                    <Stack.Screen name="Checkout"            component={CheckoutScreen} />
                    <Stack.Screen name="Orders"              component={OrdersScreen}              options={{ title: 'My Orders' }} />
                    <Stack.Screen name="Profile"             component={ProfileScreen} />
                    <Stack.Screen name="AdminRestaurants"    component={AdminRestaurantsScreen}    options={{ title: 'My Restaurants' }} />
                    <Stack.Screen name="AdminRestaurantForm" component={AdminRestaurantFormScreen} options={{ title: 'Restaurant' }} />
                    <Stack.Screen name="AdminDishes"         component={AdminDishesScreen}         options={{ title: 'Dishes' }} />
                    <Stack.Screen name="AdminDishForm"       component={AdminDishFormScreen}       options={{ title: 'Dish' }} />
                    <Stack.Screen name="AdminOrders"         component={AdminOrdersScreen}         options={{ title: 'Restaurant Orders' }} />
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
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    headerLink: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
