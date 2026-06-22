import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/Navbar'
import CartSidebar from './components/CartSidebar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import RestaurantPage from './pages/RestaurantPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import AdminRestaurantPage from './pages/AdminRestaurantPage'

function AppRoutes() {
  const { loading } = useAuth()
  if (loading) return null
  return (
    <>
      <Navbar />
      <CartSidebar />
      <Routes>
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />
        <Route path="/"           element={<HomePage />} />
        <Route path="/search"     element={<SearchResultsPage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />

        <Route path="/checkout"   element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders"     element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/admin"      element={<ProtectedRoute><AdminRestaurantPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
