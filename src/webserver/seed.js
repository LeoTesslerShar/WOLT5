const mongoose = require('mongoose')
const Restaurant = require('./models/Restaurant')
const Product = require('./models/Product')

async function seed() {
    const count = await Restaurant.countDocuments()
    if (count > 0) return // already seeded

    const r1 = await Restaurant.create({ name: 'השוורמה של מומי', description: 'שוורמה אמיתית מהדרום', cuisine: 'Israeli', address: 'אילת', lat: 29.56, lng: 34.95, phone: '08-6371234' })
    await Product.insertMany([
        { restaurantId: r1._id, name: 'שוורמה עוף', description: 'בפיתה עם טחינה וחומוס', price: 38, category: 'Main' },
        { restaurantId: r1._id, name: 'שוורמה טלה', description: 'בלחמניה עם ירקות', price: 45, category: 'Main' },
        { restaurantId: r1._id, name: 'פלאפל', description: 'כדורי פלאפל פריכים', price: 22, category: 'Side' },
        { restaurantId: r1._id, name: 'קולה', description: 'שתייה קרה 0.5 ל', price: 10, category: 'Drink' },
    ])

    const r2 = await Restaurant.create({ name: 'לחם חביתה', description: 'ארוחות בוקר וחביתות כל היום', cuisine: 'Israeli', address: 'נתניה', lat: 32.33, lng: 34.86, phone: '09-8624571' })
    await Product.insertMany([
        { restaurantId: r2._id, name: 'חביתה אמריקאית', description: 'עם גבינה צהובה ועגבניות', price: 42, category: 'Breakfast' },
        { restaurantId: r2._id, name: 'טוסט שלוש גבינות', description: 'אמנטל, גאודה ובולגרית', price: 35, category: 'Breakfast' },
        { restaurantId: r2._id, name: 'שייק תות', description: 'טרי עם חלב', price: 28, category: 'Drink' },
        { restaurantId: r2._id, name: 'סלט ירקות', description: 'ירקות עונתיים קצוצים', price: 25, category: 'Side' },
    ])

    const r3 = await Restaurant.create({ name: "צ'יקו מיקו קוראסון", description: 'אוכל מקסיקני אותנטי', cuisine: 'Mexican', address: 'תל אביב', lat: 32.07, lng: 34.79, phone: '03-5290183' })
    await Product.insertMany([
        { restaurantId: r3._id, name: 'בוריטו עוף', description: 'עם אורז, שעועית וגואקמולה', price: 55, category: 'Main' },
        { restaurantId: r3._id, name: 'טאקו בקר', description: '3 טאקו עם בשר טחון', price: 48, category: 'Main' },
        { restaurantId: r3._id, name: "נאצ'וס", description: "עם סלסה וצ'יז דיפ", price: 32, category: 'Starter' },
        { restaurantId: r3._id, name: 'מרגריטה', description: 'לימון ומלח', price: 38, category: 'Drink' },
    ])

    const r4 = await Restaurant.create({ name: "הסנדוויץ' של ברכה", description: "סנדוויצ'ים ביתיים מהלב", cuisine: 'Israeli', address: 'חיפה', lat: 32.79, lng: 34.99, phone: '04-8123976' })
    await Product.insertMany([
        { restaurantId: r4._id, name: "סנדוויץ' טונה", description: 'טונה עם מיונז וחסה', price: 28, category: 'Main' },
        { restaurantId: r4._id, name: "סנדוויץ' ביצה", description: 'ביצה קשה עם חמוצים', price: 24, category: 'Main' },
        { restaurantId: r4._id, name: "סנדוויץ' גבינות", description: "קוטג' ובולגרית עם עגבנייה", price: 26, category: 'Main' },
        { restaurantId: r4._id, name: 'מיץ תפוזים', description: 'סחוט טרי', price: 18, category: 'Drink' },
    ])

    console.log('Database seeded with sample restaurants and products')
}

module.exports = seed
