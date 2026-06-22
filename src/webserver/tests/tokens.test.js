const { test, describe, before, after, beforeEach } = require('node:test')
const assert = require('assert/strict')
const jwt = require('jsonwebtoken')
const app = require('../app')
const User = require('../models/User')
const { makeRequest } = require('./helpers')

const TEST_PORT = 3005
const request = makeRequest(TEST_PORT)
const SECRET = process.env.JWT_SECRET || 'wolt_dev_secret'

const credentials = { username: 'bob', password: 'secret12' }
const registerBody = {
    ...credentials,
    displayName: 'Bob',
    image: 'data:image/png;base64,AAAA',
    lat: 32.0853,
    lng: 34.7818
}

let server

before(() => { server = app.listen(TEST_PORT) })
after(() => server.close())

beforeEach(async () => {
    User.reset()
    await request('POST', '/api/users', registerBody)
})

// ─── happy path ───────────────────────────────────────────────

describe('POST /api/tokens', () => {
    test('valid credentials return a token and userId', async () => {
        const res = await request('POST', '/api/tokens', credentials)
        assert.equal(res.status, 200)
        assert.ok(res.body.token)
        assert.ok(res.body.userId)
    })

    test('the returned token is a valid JWT carrying the userId', async () => {
        const res = await request('POST', '/api/tokens', credentials)
        const decoded = jwt.verify(res.body.token, SECRET)
        assert.equal(decoded.userId, res.body.userId)
        assert.equal(decoded.username, 'bob')
    })

    test('the token actually authorizes a protected route', async () => {
        const res = await request('POST', '/api/tokens', credentials)
        const orders = await request('GET', '/api/orders', null, { Authorization: `Bearer ${res.body.token}` })
        assert.equal(orders.status, 200)
    })
})

// ─── edge cases ───────────────────────────────────────────────

describe('Edge cases — bad credentials', () => {
    test('wrong password returns 401', async () => {
        const res = await request('POST', '/api/tokens', { username: 'bob', password: 'wrongpass1' })
        assert.equal(res.status, 401)
    })

    test('unknown username returns 401', async () => {
        const res = await request('POST', '/api/tokens', { username: 'ghost', password: 'secret12' })
        assert.equal(res.status, 401)
    })

    test('missing username returns 400', async () => {
        const res = await request('POST', '/api/tokens', { password: 'secret12' })
        assert.equal(res.status, 400)
    })

    test('missing password returns 400', async () => {
        const res = await request('POST', '/api/tokens', { username: 'bob' })
        assert.equal(res.status, 400)
    })

    test('empty body returns 400', async () => {
        const res = await request('POST', '/api/tokens', {})
        assert.equal(res.status, 400)
    })
})
