const Restaurant = require('../models/Restaurant')
const Product = require('../models/Product')

exports.search = (req, res) => {
    const raw = (req.query.query || '').trim().toLowerCase()
    if (!raw) return res.json({ restaurants: [], products: [] })
    const query = raw
    const restaurants = Restaurant.getAll().filter(r =>
        r.name?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query)
    )
    const products = Restaurant.getAll().flatMap(r =>
        Product.getByRestaurant(r.id).filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        )
    )
    res.json({ restaurants, products })
}
