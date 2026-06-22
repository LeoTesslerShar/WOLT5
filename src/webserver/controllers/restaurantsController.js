const Restaurant = require('../models/Restaurant')

exports.getAll = (req, res) => {
    res.json(Restaurant.getAll())
}

exports.getById = (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    res.json(restaurant)
}

exports.create = (req, res) => {
    const { name, description, cuisine, address, lat, lng, phone } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' })
    if (!phone || !phone.trim()) return res.status(400).json({ error: 'Phone number is required' })

    // a restaurant must have a real geolocation so we can compute delivery distance
    const latNum = Number(lat)
    if (lat === undefined || lat === null || lat === '' || Number.isNaN(latNum) || latNum < -90 || latNum > 90)
        return res.status(400).json({ error: 'A valid latitude (-90 to 90) is required' })
    const lngNum = Number(lng)
    if (lng === undefined || lng === null || lng === '' || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180)
        return res.status(400).json({ error: 'A valid longitude (-180 to 180) is required' })

    const ownerId = req.user?.userId
    const restaurant = Restaurant.create(name.trim(), description, cuisine, address, ownerId, latNum, lngNum, phone)
    res.status(201).location(`/api/restaurants/${restaurant.id}`).json({ id: restaurant.id })
}

exports.update = (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    if (restaurant.ownerId && restaurant.ownerId !== req.user?.userId)
        return res.status(403).json({ error: 'Not authorized' })
    const { name, description, cuisine, address, lat, lng, phone } = req.body
    Restaurant.update(req.params.id, { name, description, cuisine, address, lat, lng, phone })
    res.status(204).end()
}

exports.remove = (req, res) => {
    const restaurant = Restaurant.getById(req.params.id)
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
    if (restaurant.ownerId && restaurant.ownerId !== req.user?.userId)
        return res.status(403).json({ error: 'Not authorized' })
    Restaurant.remove(req.params.id)
    res.status(204).end()
}