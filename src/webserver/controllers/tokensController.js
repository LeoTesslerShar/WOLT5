const User = require('../models/User')
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'wolt_dev_secret'

// POST /api/tokens — verify credentials and return userId
exports.login = async (req, res) => {
    const { username, password } = req.body
    if (!username || !password)
        return res.status(400).json({ error: 'Invalid credentials' })

    const user = await User.findOne({ username })
    if (!user)
        return res.status(401).json({ error: 'Username does not exist' })
    if (user.password !== password)
        return res.status(401).json({error: 'Wrong password, try again'})

    const token = jwt.sign({ userId: user._id, username: user.username }, SECRET, { expiresIn: '24h' })
    res.json({
        token,
        userId: user._id,
        displayName: user.displayName,
        image: user.image,
        isOwner: user.isOwner,
    })
}