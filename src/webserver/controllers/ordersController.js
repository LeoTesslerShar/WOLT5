const Order = require('../models/Order')
const Restaurant = require('../models/Restaurant')
const User = require('../models/User')
const { validatePayment } = require('../utils/payment')
const { estimateDelivery } = require('../utils/delivery')

const CANCEL_WINDOW_MS = 5 * 60 * 1000

exports.getByUser = (req, res) => {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const user = User.getUser(userId)
    const orders = Order.getByUser(userId).map(order => {
        const restaurant = Restaurant.getById(order.restaurantId)
        const eta = estimateDelivery(restaurant, user)
        return {
            ...order,
            restaurantName: restaurant?.name || null,
            restaurantPhone: restaurant?.phone || null,
            etaMinutes: eta.totalMinutes,
            etaTravelMinutes: eta.travelMinutes,
            etaDistanceKm: eta.distanceKm
        }
    })
    res.json(orders)
}

exports.getById = (req, res) => {
    const userId = req.user?.userId
    const order = Order.getById(req.params.id)
    if (!order || order.userId !== userId)
        return res.status(404).json({ error: 'Order not found' })
    res.json(order)
}

exports.create = (req, res) => {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const { restaurantId, products, payment } = req.body
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' })
    if (!products || !Array.isArray(products) || products.length === 0)
        return res.status(400).json({ error: 'products must be a non-empty array' })

    // payment is required to place an order — validate the card form (no real charge)
    const result = validatePayment(payment)
    if (!result.valid) return res.status(400).json({ error: result.error })

    const order = Order.create(userId, restaurantId, products, {
        last4: result.last4,
        brand: result.brand
    })
    res.status(201).location(`/api/orders/${order.id}`).end()
}

exports.update = (req, res) => {
    const userId = req.user?.userId
    const order = Order.getById(req.params.id)
    if (!order || order.userId !== userId)
        return res.status(404).json({ error: 'Order not found' })
    const { status } = req.body
    if (status === 'cancelled') {
        const ageMs = Date.now() - new Date(order.createdAt).getTime()
        if (ageMs > CANCEL_WINDOW_MS)
            return res.status(403).json({ error: 'Cancellation window has passed' })
        if (order.status === 'cancelled')
            return res.status(409).json({ error: 'Order is already cancelled' })
    }
    Order.update(req.params.id, { status })
    res.status(204).end()
}

exports.remove = (req, res) => {
    const userId = req.user?.userId
    const order = Order.getById(req.params.id)
    if (!order || order.userId !== userId)
        return res.status(404).json({ error: 'Order not found' })
    Order.remove(req.params.id)
    res.status(204).end()
}