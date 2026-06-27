import React, { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
    // The cart's contents, kept in state and re-rendered on every change.
    // Each item is { productId, name, price, quantity, restaurantId }.
    const [items, setItems] = useState([])

    // Add a product to the cart, or bump its quantity if already there.
    function addItem(product) {
        const id = product._id ?? product.id
        setItems((prev) => {
            const existing = prev.find((it) => it.productId === id)
            if (existing) {
                return prev.map((it) =>
                    it.productId === id ? { ...it, quantity: it.quantity + 1 } : it
                )
            }
            return [
                ...prev,
                {
                    productId: id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    restaurantId: product.restaurantId,
                },
            ]
        })
    }

    // Remove a line item entirely.
    function removeItem(productId) {
        setItems((prev) => prev.filter((it) => it.productId !== productId))
    }

    // Set quantity, or remove the item when it drops to zero
    function setQuantity(productId, quantity) {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        setItems((prev) =>
            prev.map((it) => (it.productId === productId ? { ...it, quantity } : it))
        )
    }

    function clearCart() {
        setItems([])
    }

    // Derived totals — recomputed only when items change.
    const total = useMemo(
        () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
        [items]
    )
    const itemCount = useMemo(
        () => items.reduce((sum, it) => sum + it.quantity, 0),
        [items]
    )

    // Group items by restaurant id
    const itemsByRestaurant = useMemo(() => {
        return items.reduce((groups, it) => {
            const list = groups[it.restaurantId] || []
            list.push(it)
            groups[it.restaurantId] = list
            return groups
        }, {})
    }, [items])

    return (
        <CartContext.Provider
            value={{
                items,
                itemsByRestaurant,
                total,
                itemCount,
                addItem,
                removeItem,
                setQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}
