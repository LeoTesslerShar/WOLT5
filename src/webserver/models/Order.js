const { randomUUID } = require('crypto')

const orders = []

const getByUser = (userId) => orders.filter(o => o.userId === userId)

const getById = (id) => orders.find(o => o.id === id)

const create = (userId, restaurantId, products, payment = null) => {
    const order = {
        id: randomUUID(),
        userId,
        restaurantId,
        products,
        status: 'pending',
        // only the masked card is kept ({ brand, last4 }) — never the full number or CVV
        payment,
        paid: !!payment,
        createdAt: new Date().toISOString()
    }
    orders.push(order)
    return order
}

const update = (id, fields) => {
    const order = orders.find(o => o.id === id)
    if (!order) return null
    Object.assign(order, Object.fromEntries(
        Object.entries(fields).filter(([_, v]) => v !== undefined))
    )
    return order
}

const remove = (id) => {
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) return null
    return orders.splice(index,1)[0]
}

const reset = () => orders.splice(0, orders.length)

module.exports = { getByUser, getById, create, update, remove, reset }