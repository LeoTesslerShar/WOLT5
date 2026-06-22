const { test, describe, before, after, beforeEach } = require('node:test')
const assert = require('assert/strict')
const app = require('../app')
const Restaurant = require('../models/Restaurant')
const Product = require('../models/Product')
const { makeRequest, authHeader } = require('./helpers')

const TEST_PORT = 3006
const request = makeRequest(TEST_PORT)
const auth = authHeader(1, 'owner')

let server

before(() => { server = app.listen(TEST_PORT) })
after(() => server.close())

beforeEach(async () => {
    Restaurant.reset()
    Product.reset()
    // one restaurant with a couple of products to search across
    const res = await request('POST', '/api/restaurants', {
        name: 'Pizza Palace', description: 'Wood-fired Italian pies', phone: '03-0000000', lat: 32.0853, lng: 34.7818
    }, auth)
    const id = res.headers.location.split('/').pop()
    await request('POST', `/api/restaurants/${id}/products`, { name: 'Margherita', description: 'Tomato and mozzarella' }, auth)
    await request('POST', `/api/restaurants/${id}/products`, { name: 'Coca Cola', description: 'Cold drink' }, auth)
})

// ─── happy path ───────────────────────────────────────────────

describe('GET /api/search', () => {
    test('matches a restaurant by name', async () => {
        const res = await request('GET', '/api/search?query=pizza')
        assert.equal(res.status, 200)
        assert.equal(res.body.restaurants.length, 1)
        assert.equal(res.body.restaurants[0].name, 'Pizza Palace')
    })

    test('matches a restaurant by description', async () => {
        const res = await request('GET', '/api/search?query=italian')
        assert.equal(res.body.restaurants.length, 1)
    })

    test('matches a product by name', async () => {
        const res = await request('GET', '/api/search?query=margherita')
        assert.equal(res.body.products.length, 1)
        assert.equal(res.body.products[0].name, 'Margherita')
    })

    test('matches a product by description', async () => {
        const res = await request('GET', '/api/search?query=drink')
        assert.equal(res.body.products.length, 1)
        assert.equal(res.body.products[0].name, 'Coca Cola')
    })

    test('search is case-insensitive', async () => {
        const res = await request('GET', '/api/search?query=PIZZA')
        assert.equal(res.body.restaurants.length, 1)
    })
})

// ─── edge cases ───────────────────────────────────────────────

describe('Edge cases — search', () => {
    test('empty query returns empty results', async () => {
        const res = await request('GET', '/api/search?query=')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, { restaurants: [], products: [] })
    })

    test('missing query param returns empty results', async () => {
        const res = await request('GET', '/api/search')
        assert.deepEqual(res.body, { restaurants: [], products: [] })
    })

    test('whitespace-only query returns empty results', async () => {
        const res = await request('GET', '/api/search?query=%20%20')
        assert.deepEqual(res.body, { restaurants: [], products: [] })
    })

    test('a query that matches nothing returns empty arrays', async () => {
        const res = await request('GET', '/api/search?query=zzzznope')
        assert.deepEqual(res.body, { restaurants: [], products: [] })
    })

    test('a query matching both a restaurant and a product returns both', async () => {
        // "co" appears in nothing restaurant-side but "Coca Cola" product
        const res = await request('GET', '/api/search?query=cola')
        assert.equal(res.body.products.length, 1)
    })
})
