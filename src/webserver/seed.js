const User       = require('./models/User')
const Restaurant = require('./models/Restaurant')
const Product    = require('./models/Product')

async function seed() {
    const count = await Restaurant.countDocuments()
    if (count > 0) return // already seeded

    // seed owner — all seed restaurants belong to this account
    let owner = await User.findOne({ username: 'admin' })
    if (!owner) {
        owner = await User.create({
            username: 'admin',
            password: 'admin123',
            displayName: 'Admin',
            image: 'https://ui-avatars.com/api/?name=Admin',
            isOwner: true,
            lat: 32.07,
            lng: 34.79,
        })
    }
    const oid = owner._id

    const r1 = await Restaurant.create({ ownerId: oid, name: 'Shawarma Momi', description: 'Authentic shawarma from the south', cuisine: 'Israeli', address: 'Eilat', lat: 29.56, lng: 34.95, phone: '08-6371234' })
    await Product.insertMany([
        { restaurantId: r1._id, name: 'Chicken Shawarma', description: 'In pita with tahini and hummus', price: 38, category: 'Main' },
        { restaurantId: r1._id, name: 'Lamb Shawarma',    description: 'In a bun with vegetables',      price: 45, category: 'Main' },
        { restaurantId: r1._id, name: 'Falafel',          description: 'Crispy falafel balls',           price: 22, category: 'Side' },
        { restaurantId: r1._id, name: 'Cola',             description: 'Cold drink 0.5L',                price: 10, category: 'Drink' },
    ])

    const r2 = await Restaurant.create({ ownerId: oid, name: 'Bread & Omelette', description: 'Breakfast and omelettes all day', cuisine: 'Israeli', address: 'Netanya', lat: 32.33, lng: 34.86, phone: '09-8624571' })
    await Product.insertMany([
        { restaurantId: r2._id, name: 'American Omelette', description: 'With yellow cheese and tomatoes', price: 42, category: 'Breakfast' },
        { restaurantId: r2._id, name: 'Three Cheese Toast', description: 'Emmental, Gouda and Bulgarian',  price: 35, category: 'Breakfast' },
        { restaurantId: r2._id, name: 'Strawberry Shake',  description: 'Fresh with milk',                 price: 28, category: 'Drink' },
        { restaurantId: r2._id, name: 'Vegetable Salad',   description: 'Seasonal chopped vegetables',     price: 25, category: 'Side' },
    ])

    const r3 = await Restaurant.create({ ownerId: oid, name: 'Chiko Miko Kurason', description: 'Authentic Latin street food in the heart of Tel Aviv', cuisine: 'Latin', address: 'Tel Aviv', lat: 34, lng: 33, phone: '03-5290183' })
    await Product.insertMany([
        { restaurantId: r3._id, name: 'Kurason',                description: 'Our signature dish — slow-cooked meat with house spices',         price: 55, category: 'Main' },
        { restaurantId: r3._id, name: 'Jurason with Chocolate', description: 'Crispy jurason drizzled with rich dark chocolate sauce',           price: 42, category: 'Dessert' },
    ])

    const r4 = await Restaurant.create({ ownerId: oid, name: 'BBB', description: 'Best burgers in Petah Tikva, grilled fresh to order', cuisine: 'American', address: 'Petah Tikva', lat: 32, lng: 40, phone: '03-9241567' })
    await Product.insertMany([
        { restaurantId: r4._id, name: 'Burger',        description: 'Classic beef patty with lettuce, tomato and BBB sauce', price: 52, category: 'Main' },
        { restaurantId: r4._id, name: 'Cheese Burger', description: 'Beef patty with melted cheddar, pickles and mustard',   price: 58, category: 'Main' },
    ])

    console.log('Database seeded with sample restaurants and products')
}

module.exports = seed