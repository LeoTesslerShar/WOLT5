const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number }
    }],
    status: { type: String, default: 'pending' },
    payment: {
        brand: { type: String },
        last4: { type: String }
    },
    paid: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Order', OrderSchema)
