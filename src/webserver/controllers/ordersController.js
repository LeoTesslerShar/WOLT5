const Order = require('../models/Order')
const Restaurant = require('../models/Restaurant')
const User = require('../models/User')
const { validatePayment } = require('../utils/payment')
const { estimateDelivery } = require('../utils/delivery')

const CANCEL_WINDOW_MS = 5 * 60 * 1000

exports.getByUser = async (req, res) => {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const user = await User.findById(userId)
    const orders = await Order.find({ userId })
    const result = await Promise.all(orders.map(async order => {
        const restaurant = await Restaurant.findById(order.restaurantId)
        const eta = estimateDelivery(restaurant, user)
        return {
            ...order.toObject({ virtuals: true }),
            restaurantName: restaurant?.name || null,
            restaurantPhone: restaurant?.phone || null,
            etaMinutes: eta.totalMinutes,
            etaTravelMinutes: eta.travelMinutes,
            etaDistanceKm: eta.distanceKm
        }
    }))
    res.json(result)
}

// GET /api/restaurants/:id/orders — orders for a restaurant the owner manages
exports.getByRestaurant = async (req, res) => {
    const userId = req.user?.userId
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    if (restaurant.ownerId?.toString() !== userId)
        return res.status(403).json({ error: 'Not authorized' })
    const orders = await Order.find({ restaurantId: req.params.id })
    res.json(orders)
}

exports.getById = async (req, res) => {
    const userId = req.user?.userId
    const order = await Order.findById(req.params.id)
    if (!order || order.userId.toString() !== userId)
        return res.status(404).json({ error: 'Order not found' })
    res.json(order)
}

exports.create = async (req, res) => {
    const userId = req.user?.userId
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })
    const { restaurantId, products, payment } = req.body
    if (!restaurantId) return res.status(400).json({ error: 'restaurantId is required' })
    if (!products || !Array.isArray(products) || products.length === 0)
        return res.status(400).json({ error: 'products must be a non-empty array' })

    const result = validatePayment(payment)
    if (!result.valid) return res.status(400).json({ error: result.error })

    const order = await Order.create({
        userId,
        restaurantId,
        products,
        payment: { last4: result.last4, brand: result.brand },
        paid: true
    })
    res.status(201).location(`/api/orders/${order._id}`).end()
}

exports.update = async (req, res) => {
    const userId = req.user?.userId
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    // the customer who placed the order, or the owner of its restaurant, may update it
    const isCustomer = order.userId.toString() === userId
    const restaurant = await Restaurant.findById(order.restaurantId)
    const isOwner = restaurant?.ownerId?.toString() === userId
    if (!isCustomer && !isOwner)
        return res.status(404).json({ error: 'Order not found' })

    const { status } = req.body
    // the 5-minute cancellation window only applies to the customer cancelling
    if (status === 'cancelled' && isCustomer) {
        const ageMs = Date.now() - new Date(order.createdAt).getTime()
        if (ageMs > CANCEL_WINDOW_MS)
            return res.status(403).json({ error: 'Cancellation window has passed' })
        if (order.status === 'cancelled')
            return res.status(409).json({ error: 'Order is already cancelled' })
    }
    await Order.findByIdAndUpdate(req.params.id, { status })
    res.status(204).end()
}

exports.remove = async (req, res) => {
    const userId = req.user?.userId
    const order = await Order.findById(req.params.id)
    if (!order || order.userId.toString() !== userId)
        return res.status(404).json({ error: 'Order not found' })
    await Order.findByIdAndDelete(req.params.id)
    res.status(204).end()
}
