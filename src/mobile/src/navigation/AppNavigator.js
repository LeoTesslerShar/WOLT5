import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer'
import { DrawerActions } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useTheme } from '../contexts/ThemeContext'
import HomeScreen from '../screens/HomeScreen'
import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import RestaurantScreen from '../screens/RestaurantScreen'
import SearchScreen from '../screens/SearchScreen'
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

const Stack = createNativeStackNavigator()
const Drawer = createDrawerNavigator()

const screenOptions = {
    headerStyle: { backgroundColor: colors.primary },
    headerTintColor: '#fff',
    headerTitleStyle: { color: '#fff', fontWeight: '700' },
    headerTitleAlign: 'center',
}

// hamburger that opens the slide-out drawer
function MenuButton({ navigation }) {
    return (
        <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ paddingHorizontal: 8 }}
        >
            <Text style={{ fontSize: 22, color: '#fff' }}>☰</Text>
        </TouchableOpacity>
    )
}

function CartButton({ navigation }) {
    const { itemCount } = useCart()
    return (
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={{ paddingHorizontal: 8 }}>
            <Text style={styles.headerLink}>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Text>
        </TouchableOpacity>
    )
}

// the full app lives in one stack so search/home/admin can navigate freely
function AppStack() {
    return (
        <Stack.Navigator screenOptions={screenOptions}>
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={({ navigation }) => ({
                    title: 'Wolt',
                    headerLeft: () => <MenuButton navigation={navigation} />,
                    headerRight: () => <CartButton navigation={navigation} />,
                })}
            />
            <Stack.Screen name="Restaurant" component={RestaurantScreen} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="AdminRestaurants" component={AdminRestaurantsScreen} options={{ title: 'My Restaurants' }} />
            <Stack.Screen name="AdminRestaurantForm" component={AdminRestaurantFormScreen} options={{ title: 'Restaurant' }} />
            <Stack.Screen name="AdminDishes" component={AdminDishesScreen} options={{ title: 'Dishes' }} />
            <Stack.Screen name="AdminDishForm" component={AdminDishFormScreen} options={{ title: 'Dish' }} />
            <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'Restaurant Orders' }} />
        </Stack.Navigator>
    )
}

// Wolt-style slide-out menu
function DrawerContent(props) {
    const { user, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const go = (screen) => props.navigation.navigate('Main', { screen })
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>{user?.displayName || 'Wolt'}</Text>
                {user?.isOwner && <Text style={styles.drawerBadge}>Restaurant owner</Text>}
            </View>
            <DrawerItem label="Restaurants" onPress={() => go('Home')} />
            <DrawerItem label="Search" onPress={() => go('Search')} />
            <DrawerItem label="My Orders" onPress={() => go('Orders')} />
            <DrawerItem label="Profile" onPress={() => go('Profile')} />
            {user?.isOwner && <DrawerItem label="Manage Restaurants" onPress={() => go('AdminRestaurants')} />}
            <DrawerItem label={isDark ? 'Light mode' : 'Dark mode'} onPress={toggleTheme} />
            <DrawerItem label="Log out" labelStyle={{ color: colors.error }} onPress={logout} />
        </DrawerContentScrollView>
    )
}

export default function AppNavigator() {
    const { user, loading } = useAuth()

    // wait for the persisted session to be read before deciding which stack to show
    if (loading) {
        return (
            <View style={styles.splash}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    if (!user) {
        return (
            <Stack.Navigator screenOptions={screenOptions}>
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
            </Stack.Navigator>
        )
    }

    return (
        <Drawer.Navigator
            drawerContent={(props) => <DrawerContent {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Drawer.Screen name="Main" component={AppStack} />
        </Drawer.Navigator>
    )
}

const styles = StyleSheet.create({
    splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    headerLink: { color: '#fff', fontSize: 15, fontWeight: '600' },
    drawerHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 8 },
    drawerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    drawerBadge: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 2 },
})
