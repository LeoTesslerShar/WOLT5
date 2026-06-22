const Restaurant = require('../models/Restaurant')
const Product = require('../models/Product')

exports.search = async (req, res) => {
    const raw = (req.query.query || '').trim()
    if (!raw) return res.json({ restaurants: [], products: [] })

    const regex = new RegExp(raw, 'i')
    const [restaurants, products] = await Promise.all([
        Restaurant.find({ $or: [{ name: regex }, { description: regex }] }),
        Product.find({ $or: [{ name: regex }, { description: regex }] })
    ])
    res.json({ restaurants, products })
}
