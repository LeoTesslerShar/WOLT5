import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './src/contexts/AuthContext'
import { CartProvider } from './src/contexts/CartContext'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <CartProvider>
                    <NavigationContainer>
                        <AppNavigator />
                    </NavigationContainer>
                    <StatusBar style="auto" />
                </CartProvider>
            </AuthProvider>
        </SafeAreaProvider>
    )
}
