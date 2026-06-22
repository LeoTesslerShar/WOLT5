const Product = require('../models/Product')
const Restaurant = require('../models/Restaurant')
const ex2Client = require('../services/ex2Client')

// GET /api/restaurants/:id/products
exports.getAll = (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    res.json(Product.getByRestaurant(req.params.id))
}

// POST /api/restaurants/:id/products
exports.create = (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    const { name, description, price, category } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })
    // reject clearly-invalid prices when supplied (the client always sends a positive number)
    if (price !== undefined && (typeof price !== 'number' || !Number.isFinite(price) || price <= 0))
        return res.status(400).json({ error: 'Price must be a positive number' })
    const product = Product.create(req.params.id, name.trim(), description, price, category)
    res.status(201).location(`/api/restaurants/${req.params.id}/products/${product.id}`).end()
}

// GET /api/restaurants/:id/products/:pId  — also records view in Ex2
exports.getById = async (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    const product = Product.getById(parseInt(req.params.pId))
    if (!product || product.restaurantId !== req.params.id)
        return res.status(404).json({ error: 'Product not found' })
    const userId = req.headers['user-id']
    if (userId) {
        try { await ex2Client.patchUserProducts(parseInt(userId), [product.id]) }
        catch (_) { /* Ex2 unavailable — don't fail the request */ }
    }
    res.json(product)
}

// PATCH /api/restaurants/:id/products/:pId
exports.update = (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    const product = Product.getById(parseInt(req.params.pId))
    if (!product || product.restaurantId !== req.params.id)
        return res.status(404).json({ error: 'Product not found' })
    const { name, description, price, category } = req.body
    Product.update(product.id, { name, description, price, category })
    res.status(204).end()
}

// DELETE /api/restaurants/:id/products/:pId
exports.remove = (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    const product = Product.getById(parseInt(req.params.pId))
    if (!product || product.restaurantId !== req.params.id)
        return res.status(404).json({ error: 'Product not found' })
    Product.remove(product.id)
    res.status(204).end()
}