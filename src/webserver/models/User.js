const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:    { type: String, required: true, unique: true },
    password:    { type: String, required: true },
    displayName: { type: String, required: true },
    image:       { type: String, required: true },
    isOwner:     { type: Boolean, default: false },
    lat:         { type: Number, required: true },
    lng:         { type: Number, required: true },
})

module.exports = mongoose.model('User', UserSchema)