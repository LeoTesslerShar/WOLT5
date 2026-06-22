const User = require('../models/User')
const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'wolt_dev_secret'

// POST /api/tokens — verify credentials and return userId
exports.login = (req, res) => {
    const { username, password } = req.body
    if (!username || !password)
        return res.status(400).json({ error: 'Invalid credentials' })

    const user = User.loginCheck(username, password)
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET, { expiresIn: '24h' })
    res.json({ token, userId: user.id })
}
