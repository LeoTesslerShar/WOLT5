const { test, describe, before, after, beforeEach } = require('node:test')
const assert = require('assert/strict')
const app = require('../app')
const Order = require('../models/Order')
const { makeRequest, authHeader } = require('./helpers')

const TEST_PORT = 3003
const request = makeRequest(TEST_PORT)

const USER_ID = 1
const OTHER_USER_ID = 2
const user = authHeader(USER_ID, 'user')
const other = authHeader(OTHER_USER_ID, 'other')

// a card with an expiry two years out, so the suite never time-bombs
const futureExpiry = () => `12/${String((new Date().getFullYear() + 2) % 100).padStart(2, '0')}`
const validPayment = { cardName: 'Test User', cardNumber: '4242 4242 4242 4242', expiry: futureExpiry(), cvv: '123' }

const sampleOrder = { restaurantId: 'rest-abc', products: [1, 2, 3], payment: validPayment }

let server

before(() => { server = app.listen(TEST_PORT) })
after(() => server.close())
beforeEach(() => Order.reset())

async function createOrder(headers = user) {
    const res = await request('POST', '/api/orders', sampleOrder, headers)
    return res.headers.location.split('/').pop()
}

// ─── happy path ───────────────────────────────────────────────

describe('GET /api/orders', () => {
    test('returns empty array when the user has no orders', async () => {
        const res = await request('GET', '/api/orders', null, user)
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, [])
    })

    test('returns only orders belonging to the requesting user', async () => {
        await request('POST', '/api/orders', sampleOrder, user)
        await request('POST', '/api/orders', sampleOrder, other)
        const res = await request('GET', '/api/orders', null, user)
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].userId, USER_ID)
    })
})

describe('POST /api/orders', () => {
    test('creates an order and returns 201 with Location header', async () => {
        const res = await request('POST', '/api/orders', sampleOrder, user)
        assert.equal(res.status, 201)
        assert.match(res.headers.location, /^\/api\/orders\/.+/)
    })

    test('created order has correct fields and defaults', async () => {
        const id = await createOrder()
        const res = await request('GET', `/api/orders/${id}`, null, user)
        assert.equal(res.body.userId, USER_ID)
        assert.equal(res.body.restaurantId, sampleOrder.restaurantId)
        assert.deepEqual(res.body.products, sampleOrder.products)
        assert.equal(res.body.status, 'pending')
        assert.ok(res.body.createdAt)
    })
})

describe('GET /api/orders/:id', () => {
    test('returns the correct order by id', async () => {
        const id = await createOrder()
        const res = await request('GET', `/api/orders/${id}`, null, user)
        assert.equal(res.status, 200)
        assert.equal(res.body.id, id)
    })
})

describe('PATCH /api/orders/:id', () => {
    test('updates status and returns 204', async () => {
        const id = await createOrder()
        const patch = await request('PATCH', `/api/orders/${id}`, { status: 'delivered' }, user)
        assert.equal(patch.status, 204)
        const get = await request('GET', `/api/orders/${id}`, null, user)
        assert.equal(get.body.status, 'delivered')
    })

    test('partial update preserves unchanged fields', async () => {
        const id = await createOrder()
        await request('PATCH', `/api/orders/${id}`, { status: 'confirmed' }, user)
        const get = await request('GET', `/api/orders/${id}`, null, user)
        assert.deepEqual(get.body.products, sampleOrder.products)
        assert.equal(get.body.restaurantId, sampleOrder.restaurantId)
    })

    test('product list cannot be changed via PATCH (products field is ignored)', async () => {
        const id = await createOrder()
        await request('PATCH', `/api/orders/${id}`, { products: [1, 2] }, user)
        const get = await request('GET', `/api/orders/${id}`, null, user)
        assert.deepEqual(get.body.products, sampleOrder.products)
    })

    test('a fresh order can be cancelled within the window', async () => {
        const id = await createOrder()
        const patch = await request('PATCH', `/api/orders/${id}`, { status: 'cancelled' }, user)
        assert.equal(patch.status, 204)
        const get = await request('GET', `/api/orders/${id}`, null, user)
        assert.equal(get.body.status, 'cancelled')
    })

    test('cancelling an already-cancelled order returns 409', async () => {
        const id = await createOrder()
        await request('PATCH', `/api/orders/${id}`, { status: 'cancelled' }, user)
        const again = await request('PATCH', `/api/orders/${id}`, { status: 'cancelled' }, user)
        assert.equal(again.status, 409)
    })
})

describe('DELETE /api/orders/:id', () => {
    test('deletes an order and returns 204', async () => {
        const id = await createOrder()
        const del = await request('DELETE', `/api/orders/${id}`, null, user)
        assert.equal(del.status, 204)
        const get = await request('GET', `/api/orders/${id}`, null, user)
        assert.equal(get.status, 404)
    })
})

// ─── auth edge cases ──────────────────────────────────────────

describe('Edge cases — authentication required', () => {
    test('GET /api/orders without a token returns 401', async () => {
        const res = await request('GET', '/api/orders')
        assert.equal(res.status, 401)
    })

    test('POST /api/orders without a token returns 401', async () => {
        const res = await request('POST', '/api/orders', sampleOrder)
        assert.equal(res.status, 401)
    })

    test('a malformed token returns 401', async () => {
        const res = await request('GET', '/api/orders', null, { Authorization: 'Bearer garbage' })
        assert.equal(res.status, 401)
    })
})

// ─── validation edge cases ────────────────────────────────────

describe('Edge cases — POST validation', () => {
    test('missing restaurantId returns 400', async () => {
        const res = await request('POST', '/api/orders', { products: [1] }, user)
        assert.equal(res.status, 400)
    })

    test('missing products returns 400', async () => {
        const res = await request('POST', '/api/orders', { restaurantId: 'abc' }, user)
        assert.equal(res.status, 400)
    })

    test('empty products array returns 400', async () => {
        const res = await request('POST', '/api/orders', { restaurantId: 'abc', products: [] }, user)
        assert.equal(res.status, 400)
    })

    test('products that is not an array returns 400', async () => {
        const res = await request('POST', '/api/orders', { restaurantId: 'abc', products: 'nope' }, user)
        assert.equal(res.status, 400)
    })
})

// ─── payment validation ───────────────────────────────────────

describe('Edge cases — payment validation', () => {
    const base = { restaurantId: 'rest-abc', products: [1] }

    test('missing payment returns 400', async () => {
        const res = await request('POST', '/api/orders', base, user)
        assert.equal(res.status, 400)
    })

    test('missing cardholder name returns 400', async () => {
        const payment = { ...validPayment, cardName: '' }
        const res = await request('POST', '/api/orders', { ...base, payment }, user)
        assert.equal(res.status, 400)
    })

    test('a card number that is too short returns 400', async () => {
        const payment = { ...validPayment, cardNumber: '4242' }
        const res = await request('POST', '/api/orders', { ...base, payment }, user)
        assert.equal(res.status, 400)
    })

    test('a card number that fails the Luhn check returns 400', async () => {
        const payment = { ...validPayment, cardNumber: '1234 5678 9012 3456' }
        const res = await request('POST', '/api/orders', { ...base, payment }, user)
        assert.equal(res.status, 400)
    })

    test('a non-numeric card number returns 400', async () => {
        const payment = { ...validPayment, cardNumber: 'not-a-card' }
        const res = await request('POST', '/api/orders', { ...base, payment }, user)
        assert.equal(res.status, 400)
    })

    test('an expired card returns 400', async () => {
        const payment = { ...validPayment, expiry: '01/20' }
        const res = await request('POST', '/api/orders', { ...base, payment }, user)
        assert.equal(res.status, 400)
    })

    test('a malformed expiry returns 400', async () => {
        const payment = { ...validPayment, expiry: '13/2030' }
        const res = await request('POST', '/api/orders', { ...base, payment }, user)
        assert.equal(res.status, 400)
    })

    test('a CVV that is not 3–4 digits returns 400', async () => {
        const payment = { ...validPayment, cvv: '12' }
        const res = await request('POST', '/api/orders', { ...base, payment }, user)
        assert.equal(res.status, 400)
    })

    test('a valid card stores only the masked card (brand + last4)', async () => {
        const id = await createOrder()
        const res = await request('GET', `/api/orders/${id}`, null, user)
        assert.equal(res.body.paid, true)
        assert.equal(res.body.payment.brand, 'Visa')
        assert.equal(res.body.payment.last4, '4242')
        // the full number and CVV must never be persisted
        assert.equal(res.body.payment.cardNumber, undefined)
        assert.equal(res.body.payment.cvv, undefined)
    })
})

// ─── access control ───────────────────────────────────────────

describe('Edge cases — access control', () => {
    test('a user cannot GET another user\'s order', async () => {
        const id = await createOrder()
        const res = await request('GET', `/api/orders/${id}`, null, other)
        assert.equal(res.status, 404)
    })

    test('a user cannot PATCH another user\'s order', async () => {
        const id = await createOrder()
        const res = await request('PATCH', `/api/orders/${id}`, { status: 'delivered' }, other)
        assert.equal(res.status, 404)
    })

    test('a user cannot DELETE another user\'s order', async () => {
        const id = await createOrder()
        const res = await request('DELETE', `/api/orders/${id}`, null, other)
        assert.equal(res.status, 404)
    })

    test('non-existent order id returns 404', async () => {
        const res = await request('GET', '/api/orders/does-not-exist', null, user)
        assert.equal(res.status, 404)
    })
})
