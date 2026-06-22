const jwt = require('jsonwebtoken')
const SECRET = process.env.JWT_SECRET || 'wolt_dev_secret'

module.exports = (req, res, next) => {
    const header = req.headers['authorization']
    if (!header || !header.startsWith('Bearer '))
        return res.status(401).json({error: 'No token provided'})
    const token = header.slice(7)
    try {
        req.user = jwt.verify(token, SECRET)
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}
