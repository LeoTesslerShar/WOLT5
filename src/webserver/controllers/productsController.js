const Product = require('../models/Product')
const Restaurant = require('../models/Restaurant')
const ex2Client = require('../services/ex2Client')

// GET /api/restaurants/:id/products
exports.getAll = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) 
        return res.status(404).json({ error: 'Restaurant not found' })
    res.json(await Product.find({ restaurantId: req.params.id }))
}

// POST /api/restaurants/:id/products
exports.create = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant)
        return res.status(404).json({ error: 'Restaurant not found' })
    const { name, description, price, category } = req.body
    if (!name || !name.trim()) 
        return res.status(400).json({ error: 'Name is required' })
    if (price !== undefined && (typeof price !== 'number' || !Number.isFinite(price) || price <= 0))
        return res.status(400).json({ error: 'Price must be a positive number' })
    const product = await Product.create({restaurantId: req.params.id, name: name.trim(), description, price, category})
    res.status(201).location(`/api/restaurants/${req.params.id}/products/${product._id}`).end()
}

// GET /api/restaurants/:id/products/:pId
exports.getById = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) 
        return res.status(404).json({ error: 'Restaurant not found' })
    const product = await Product.findById(req.params.pId)
    if (!product || product.restaurantId.toString() !== req.params.id)
        return res.status(404).json({ error: 'Product not found' })
    const userId = req.headers['user-id']
    if (userId) {
        try { await ex2Client.patchUserProducts(parseInt(userId), [product.id]) }
        catch (_) { }
    }
    res.json(product)
}

// PATCH /api/restaurants/:id/products/:pId
exports.update = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) 
        return res.status(404).json({ error: 'Restaurant not found' })
    const product = await Product.findById(req.params.pId)
    if (!product || product.restaurantId.toString() !== req.params.id)
        return res.status(404).json({ error: 'Product not found' })
    const { name, description, price, category } = req.body
    await Product.findByIdAndUpdate(product._id, { name, description, price, category })
    res.status(204).end()
}

// DELETE /api/restaurants/:id/products/:pId
exports.remove = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) 
        return res.status(404).json({ error: 'Restaurant not found' })
    const product = await Product.findById(req.params.pId)
    if (!product || product.restaurantId.toString() !== req.params.id)
        return res.status(404).json({ error: 'Product not found' })
    await Product.findByIdAndDelete(product._id)
    res.status(204).end()
}