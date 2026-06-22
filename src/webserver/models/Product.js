const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name:  { type: String, required: true },
    description: { type: String, required: true },
    category:  { type: String, required: true },
    price:  { type: Number, required: true },
})

module.exports = mongoose.model('Product', ProductSchema)