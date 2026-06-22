const express = require('express')
const path = require('path')
const connectDB = require('./db')
const app = express()
const restaurantRoutes = require('./routes/restaurants')
const userRoutes = require('./routes/users')
const tokenRoutes = require('./routes/tokens')
const productsRoutes = require('./routes/products')
const ordersRoutes = require('./routes/orders')
const searchRoutes = require('./routes/search')
const auth = require('./middleware/auth')

require('./seed')

app.use(express.json({ limit: '10mb' }))
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tokens', tokenRoutes)
app.use('/api/restaurants/:id/products', productsRoutes)
app.use('/api/orders', auth, ordersRoutes)
app.use('/api/search', searchRoutes)

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

// Serve the React production build.
// In Docker the build is copied into ./public (see Dockerfile).
const clientBuild = path.join(__dirname, 'public')
app.use(express.static(clientBuild))
// For any non-API URL, return index.html so React Router handles it
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'))
})

if (require.main === module) {
    connectDB().then(() => app.listen(3000))
}

module.exports = app
