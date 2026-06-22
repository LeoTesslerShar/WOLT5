const Restaurant = require('../models/Restaurant')

exports.getAll = async (req, res) => {
    res.json(await Restaurant.find())
}

exports.getById = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) 
        return res.status(404).json({ error: 'Restaurant not found' })
    res.json(restaurant)
}

exports.create = async (req, res) => {
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
    const restaurant = await Restaurant.create({name: name.trim(), description, cuisine, address, ownerId, lat: latNum, lng: lngNum, phone})
    res.status(201).location(`/api/restaurants/${restaurant._id}`).json({ id: restaurant._id })
}

exports.update = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) 
        return res.status(404).json({ error: 'Restaurant not found' })
    if (restaurant.ownerId && restaurant.ownerId.toString() !== req.user?.userId)
        return res.status(403).json({ error: 'Not authorized' })
    const { name, description, cuisine, address, lat, lng, phone } = req.body
    await Restaurant.findByIdAndUpdate(req.params.id, { name, description, cuisine, address, lat, lng, phone })
    res.status(204).end()
}

exports.remove = async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant) 
        return res.status(404).json({ error: 'Restaurant not found' })
    if (restaurant.ownerId && restaurant.ownerId.toString() !== req.user?.userId)
        return res.status(403).json({ error: 'Not authorized' })
    await Restaurant.findByIdAndDelete(req.params.id)
    res.status(204).end()
}