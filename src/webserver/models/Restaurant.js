const mongoose = require('mongoose')

const RestaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description:  { type: String, required: true },
    cuisine: { type: String, required: true },
    address:  { type: String, required: true },
    ownerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lat:  { type: Number, required: true },
    lng:  { type: Number, required: true },
    phone:  { type: String, required: true },
})

module.exports = mongoose.model('Restaurant', RestaurantSchema)