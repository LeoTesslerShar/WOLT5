const User = require('../models/User')
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/

// GET /api/users/:id — return user details excluding password
exports.getUserById = (req, res) => {
    const user = User.getUser(parseInt(req.params.id))
    if (!user)
        return res.status(404).json({ error: 'User not found' })
    res.json(user)
}

// POST /api/users — register a new user
exports.createUser = (req, res) => {
    const { username, password, displayName, image, isOwner, lat, lng } = req.body
    if (!username || !password || !displayName || !image)
        return res.status(400).json({ error: 'username, password, displayName and image required' })

    if (!PASSWORD_REGEX.test(password))
        return res.status(400).json({error: 'Password must be at least 8 characters and contain at least one number'})

    // coordinates are required so we can estimate delivery times
    const latNum = Number(lat)
    if (lat === undefined || lat === null || lat === '' || Number.isNaN(latNum) || latNum < -90 || latNum > 90)
        return res.status(400).json({ error: 'A valid latitude (-90 to 90) is required' })
    const lngNum = Number(lng)
    if (lng === undefined || lng === null || lng === '' || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180)
        return res.status(400).json({ error: 'A valid longitude (-180 to 180) is required' })

    if (User.findByUsername(username))
        return res.status(409).json({error: 'Username already taken'})

    const newUser = User.createUser(username, password, displayName, image, !!isOwner, latNum, lngNum)
    res.status(201).location(`/api/users/${newUser.id}`).end()
}
