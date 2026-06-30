const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wolt'

async function connectDB() {
    let retries = 10
    while (retries > 0) {
        try {
            await mongoose.connect(MONGO_URI)
            console.log('MongoDB connected:', MONGO_URI)
            return
        } catch (err) {
            retries--
            console.warn(`MongoDB connection failed, retrying... (${retries} left)`)
            await new Promise(r => setTimeout(r, 3000))
        }
    }
    throw new Error('Could not connect to MongoDB after multiple retries')
}

module.exports = connectDB
