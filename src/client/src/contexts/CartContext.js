import React, { createContext, useContext, useState } from 'react'
const CartContext = createContext(null)

export function CartProvider({ children }) {
    // cart items array: each item has { id, name, price, qty, ... }
    const [items, setItems] = useState([])
    // tracks which restaurant the cart belongs to — prevents mixing restaurants
    const [restaurantId, setRestaurantId] = useState(null)
    // holds an add request awaiting confirmation: { product, restaurantId }
    const [pendingAdd, setPendingAdd] = useState(null)

    const [isOpen, setIsOpen] = useState(false)
    const openCart = () => setIsOpen(true)
    const closeCart = () => setIsOpen(false)


    // add product to cart with given qty (default 1)
    // if product is from a different restaurant, clear cart first
    const addItem = (product, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id)
            if (existing) {
                return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
            }
            return [...prev, { ...product, qty }]
        })
    }

    // switch to a new restaurant — clears cart and sets new restaurantId
    const switchRestaurant = (newRestaurantId) => {
        setItems([])
        setRestaurantId(newRestaurantId)
    }

    // request to add a product from a given restaurant.
    // if the cart already belongs to a different restaurant, defer until the
    // user confirms clearing it (handled by the styled modal below).
    const requestAdd = (product, fromRestaurantId) => {
        if (restaurantId && restaurantId !== fromRestaurantId) {
            setPendingAdd({ product, restaurantId: fromRestaurantId })
            return
        }
        if (!restaurantId) setRestaurantId(fromRestaurantId)
        addItem(product, 1)
        openCart()
    }

    // user confirmed clearing the cart to start a new restaurant's order
    const confirmPendingAdd = () => {
        if (!pendingAdd) return
        switchRestaurant(pendingAdd.restaurantId)
        addItem(pendingAdd.product, 1)
        setPendingAdd(null)
        openCart()
    }

    const cancelPendingAdd = () => setPendingAdd(null)

    // remove item from cart by id
    const removeItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    // set item qty directly; remove item if qty drops to 0 or below
    const updateQty = (id, newQty) => {
        if (newQty <= 0) {
            removeItem(id)
            return
        }
        setItems(prev => prev.map(item => item.id === id ? { ...item, qty: newQty } : item))
    }


    // sum of price * qty for all items in cart
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

    // clear all items after successful order submission
    const clear = () => {
        setItems([])
        setRestaurantId(null)
    }

    return (
        <CartContext.Provider value={{ items, restaurantId, addItem, requestAdd, removeItem, updateQty, total, clear, switchRestaurant, isOpen, openCart, closeCart }}>
            {children}
            {pendingAdd && (
                <div className="cart-confirm-overlay" onClick={cancelPendingAdd}>
                    <div className="cart-confirm-modal" onClick={e => e.stopPropagation()}>
                        <div className="cart-confirm-icon">🛒</div>
                        <h5 className="cart-confirm-title">Start a new order?</h5>
                        <p className="cart-confirm-text">
                            Starting a new order will clear your current cart. Continue?
                        </p>
                        <div className="cart-confirm-actions">
                            <button className="cart-confirm-cancel" onClick={cancelPendingAdd}>Keep my cart</button>
                            <button className="cart-confirm-continue" onClick={confirmPendingAdd}>Continue</button>
                        </div>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    )
}
export const useCart = () => useContext(CartContext)
