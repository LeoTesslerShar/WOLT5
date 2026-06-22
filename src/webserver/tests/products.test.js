const { test, describe, before, after, beforeEach } = require('node:test')
const assert = require('assert/strict')
const app = require('../app')
const Restaurant = require('../models/Restaurant')
const Product = require('../models/Product')
const { makeRequest, authHeader } = require('./helpers')

const TEST_PORT = 3002
const request = makeRequest(TEST_PORT)
const auth = authHeader(1, 'owner')

let server
let restaurantId

before(() => { server = app.listen(TEST_PORT) })
after(() => server.close())

beforeEach(async () => {
    Restaurant.reset()
    Product.reset()
    const res = await request('POST', '/api/restaurants', { name: 'Test Restaurant', phone: '03-0000000', lat: 32.0853, lng: 34.7818 }, auth)
    restaurantId = res.headers.location.split('/').pop()
})

// ─── happy path ───────────────────────────────────────────────

describe('GET /api/restaurants/:id/products', () => {
    test('returns empty array when no products exist', async () => {
        const res = await request('GET', `/api/restaurants/${restaurantId}/products`)
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, [])
    })

    test('returns all products after creation', async () => {
        await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Pizza' }, auth)
        await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Pasta' }, auth)
        const res = await request('GET', `/api/restaurants/${restaurantId}/products`)
        assert.equal(res.body.length, 2)
    })
})

describe('POST /api/restaurants/:id/products', () => {
    test('creates a product and returns 201 with Location header', async () => {
        const res = await request('POST', `/api/restaurants/${restaurantId}/products`, {
            name: 'Margherita', description: 'Classic pizza', price: 45
        }, auth)
        assert.equal(res.status, 201)
        assert.match(res.headers.location, /^\/api\/restaurants\/.+\/products\/\d+/)
    })

    test('stores all provided fields', async () => {
        await request('POST', `/api/restaurants/${restaurantId}/products`, {
            name: 'Sushi', description: 'Fresh fish', price: 60, category: 'Main'
        }, auth)
        const p = (await request('GET', `/api/restaurants/${restaurantId}/products`)).body[0]
        assert.equal(p.name, 'Sushi')
        assert.equal(p.description, 'Fresh fish')
        assert.equal(p.price, 60)
        assert.equal(p.category, 'Main')
    })

    test('category defaults to "General" when omitted', async () => {
        await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Plain' }, auth)
        const p = (await request('GET', `/api/restaurants/${restaurantId}/products`)).body[0]
        assert.equal(p.category, 'General')
    })

    test('name is trimmed before saving', async () => {
        await request('POST', `/api/restaurants/${restaurantId}/products`, { name: '  Spaced  ' }, auth)
        const p = (await request('GET', `/api/restaurants/${restaurantId}/products`)).body[0]
        assert.equal(p.name, 'Spaced')
    })

    test('requires authentication', async () => {
        const res = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'NoAuth' })
        assert.equal(res.status, 401)
    })
})

describe('GET /api/restaurants/:id/products/:pId', () => {
    test('returns the correct product by id', async () => {
        const post = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Falafel' }, auth)
        const pId = post.headers.location.split('/').pop()
        const res = await request('GET', `/api/restaurants/${restaurantId}/products/${pId}`)
        assert.equal(res.status, 200)
        assert.equal(res.body.name, 'Falafel')
    })
})

describe('PATCH /api/restaurants/:id/products/:pId', () => {
    test('updates name and returns 204', async () => {
        const post = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Old Name' }, auth)
        const pId = post.headers.location.split('/').pop()
        const patch = await request('PATCH', `/api/restaurants/${restaurantId}/products/${pId}`, { name: 'New Name' }, auth)
        assert.equal(patch.status, 204)
        const get = await request('GET', `/api/restaurants/${restaurantId}/products/${pId}`)
        assert.equal(get.body.name, 'New Name')
    })

    test('partial update preserves unchanged fields', async () => {
        const post = await request('POST', `/api/restaurants/${restaurantId}/products`, {
            name: 'Original', description: 'Keep this', price: 30
        }, auth)
        const pId = post.headers.location.split('/').pop()
        await request('PATCH', `/api/restaurants/${restaurantId}/products/${pId}`, { price: 50 }, auth)
        const get = await request('GET', `/api/restaurants/${restaurantId}/products/${pId}`)
        assert.equal(get.body.name, 'Original')
        assert.equal(get.body.description, 'Keep this')
        assert.equal(get.body.price, 50)
    })
})

describe('DELETE /api/restaurants/:id/products/:pId', () => {
    test('deletes a product and returns 204', async () => {
        const post = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'To Delete' }, auth)
        const pId = post.headers.location.split('/').pop()
        const del = await request('DELETE', `/api/restaurants/${restaurantId}/products/${pId}`, null, auth)
        assert.equal(del.status, 204)
        const get = await request('GET', `/api/restaurants/${restaurantId}/products/${pId}`)
        assert.equal(get.status, 404)
    })
})

// ─── edge cases ───────────────────────────────────────────────

describe('Edge cases — wrong restaurant id', () => {
    test('GET products for non-existent restaurant returns 404', async () => {
        const res = await request('GET', '/api/restaurants/does-not-exist/products')
        assert.equal(res.status, 404)
    })

    test('POST product to non-existent restaurant returns 404', async () => {
        const res = await request('POST', '/api/restaurants/does-not-exist/products', { name: 'x' }, auth)
        assert.equal(res.status, 404)
    })
})

describe('Edge cases — POST validation', () => {
    test('missing name returns 400', async () => {
        const res = await request('POST', `/api/restaurants/${restaurantId}/products`, {}, auth)
        assert.equal(res.status, 400)
    })

    test('empty string name returns 400', async () => {
        const res = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: '' }, auth)
        assert.equal(res.status, 400)
    })

    test('whitespace-only name returns 400', async () => {
        const res = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: '   ' }, auth)
        assert.equal(res.status, 400)
    })

    test('negative price returns 400', async () => {
        const res = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Bad', price: -5 }, auth)
        assert.equal(res.status, 400)
    })

    test('non-numeric price returns 400', async () => {
        const res = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Bad', price: 'free' }, auth)
        assert.equal(res.status, 400)
    })
})

describe('Edge cases — wrong product id', () => {
    test('GET non-existent product returns 404', async () => {
        const res = await request('GET', `/api/restaurants/${restaurantId}/products/99999`)
        assert.equal(res.status, 404)
    })

    test('PATCH non-existent product returns 404', async () => {
        const res = await request('PATCH', `/api/restaurants/${restaurantId}/products/99999`, { name: 'x' }, auth)
        assert.equal(res.status, 404)
    })

    test('DELETE non-existent product returns 404', async () => {
        const res = await request('DELETE', `/api/restaurants/${restaurantId}/products/99999`, null, auth)
        assert.equal(res.status, 404)
    })

    test('non-numeric product id returns 404', async () => {
        const res = await request('GET', `/api/restaurants/${restaurantId}/products/abc`)
        assert.equal(res.status, 404)
    })
})

describe('Edge cases — product belongs to a different restaurant', () => {
    test('cannot access a product via the wrong restaurant id', async () => {
        const other = await request('POST', '/api/restaurants', { name: 'Other Restaurant', phone: '03-0000000', lat: 32.0853, lng: 34.7818 }, auth)
        const otherId = other.headers.location.split('/').pop()
        const post = await request('POST', `/api/restaurants/${restaurantId}/products`, { name: 'Mine' }, auth)
        const pId = post.headers.location.split('/').pop()
        const res = await request('GET', `/api/restaurants/${otherId}/products/${pId}`)
        assert.equal(res.status, 404)
    })
})
