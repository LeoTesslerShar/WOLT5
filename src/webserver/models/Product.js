let idCounter = 0 

const products = []

const getByRestaurant = (restaurantId) => products.filter(p => p.restaurantId === restaurantId)

const getById = (id) => products.find(p => p.id === id)

const create = (restaurantId, name, description, price, category) => {
    const product = { id: ++idCounter, restaurantId, name, description, price, category: category || 'General' }
    products.push(product)
    return product
}

const update = (id, fields) => {
    const product = products.find(p => p.id === id)
    if (!product) return null
    Object.assign(product, Object.fromEntries(
        Object.entries(fields).filter(([_, v]) => v !== undefined)
    ))
    return product
}

const remove = (id) => {
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null
    return products.splice(index, 1)[0]
}

const reset = () => products.splice(0, products.length)

module.exports = { getByRestaurant, getById, create, update, remove, reset }