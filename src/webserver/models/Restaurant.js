const { randomUUID } = require('crypto')

const restaurants = []

const getAll = () => restaurants

const getById = (id) => restaurants.find(r => r.id === id)

const create = (name, description, cuisine, address, ownerId, lat = null, lng = null, phone = null) => {
    const restaurant = { id: randomUUID(), name, description, cuisine, address, ownerId, lat, lng, phone }
    restaurants.push(restaurant)
    return restaurant
}

const update = (id, fields) => {
    const restaurant = restaurants.find(r => r.id === id)
    if (!restaurant) return null
    // only overwrite fields that were actually provided (not undefined)
    Object.assign(restaurant, Object.fromEntries(
        Object.entries(fields).filter(([_, v]) => v !== undefined)
    ))
    return restaurant
}

const remove = (id) => {
    const index = restaurants.findIndex(r => r.id === id)
    if (index === -1) return null
    return restaurants.splice(index, 1)[0]
}

const reset = () => restaurants.splice(0, restaurants.length)

module.exports = { getAll, getById, create, update, remove, reset }