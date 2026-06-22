const { test, describe, before, after, beforeEach } = require('node:test')
const assert = require('assert/strict')
const app = require('../app')
const User = require('../models/User')
const { makeRequest } = require('./helpers')

const TEST_PORT = 3004
const request = makeRequest(TEST_PORT)

// a valid registration body — password has 8+ chars and a number, coordinates are required
const validUser = {
    username: 'alice',
    password: 'pass1234',
    displayName: 'Alice',
    image: 'data:image/png;base64,AAAA',
    lat: 32.0853,
    lng: 34.7818
}

let server

before(() => { server = app.listen(TEST_PORT) })
after(() => server.close())
beforeEach(() => User.reset())

// ─── happy path ───────────────────────────────────────────────

describe('POST /api/users', () => {
    test('registers a user and returns 201 with Location header', async () => {
        const res = await request('POST', '/api/users', validUser)
        assert.equal(res.status, 201)
        assert.match(res.headers.location, /^\/api\/users\/\d+/)
    })

    test('registered user can be fetched by id', async () => {
        const post = await request('POST', '/api/users', validUser)
        const id = post.headers.location.split('/').pop()
        const res = await request('GET', `/api/users/${id}`)
        assert.equal(res.status, 200)
        assert.equal(res.body.username, 'alice')
        assert.equal(res.body.displayName, 'Alice')
    })

    test('the password is never returned by GET', async () => {
        const post = await request('POST', '/api/users', validUser)
        const id = post.headers.location.split('/').pop()
        const res = await request('GET', `/api/users/${id}`)
        assert.equal(res.body.password, undefined)
    })

    test('isOwner is stored when set', async () => {
        const post = await request('POST', '/api/users', { ...validUser, isOwner: true })
        const id = post.headers.location.split('/').pop()
        const res = await request('GET', `/api/users/${id}`)
        assert.equal(res.body.isOwner, true)
    })

    test('coordinates are stored', async () => {
        const post = await request('POST', '/api/users', validUser)
        const id = post.headers.location.split('/').pop()
        const res = await request('GET', `/api/users/${id}`)
        assert.equal(res.body.lat, 32.0853)
        assert.equal(res.body.lng, 34.7818)
    })
})

// ─── validation edge cases ────────────────────────────────────

describe('Edge cases — required fields', () => {
    test('missing username returns 400', async () => {
        const { username, ...rest } = validUser
        const res = await request('POST', '/api/users', rest)
        assert.equal(res.status, 400)
    })

    test('missing password returns 400', async () => {
        const { password, ...rest } = validUser
        const res = await request('POST', '/api/users', rest)
        assert.equal(res.status, 400)
    })

    test('missing displayName returns 400', async () => {
        const { displayName, ...rest } = validUser
        const res = await request('POST', '/api/users', rest)
        assert.equal(res.status, 400)
    })

    test('missing image returns 400', async () => {
        const { image, ...rest } = validUser
        const res = await request('POST', '/api/users', rest)
        assert.equal(res.status, 400)
    })

    test('missing latitude returns 400', async () => {
        const { lat, ...rest } = validUser
        const res = await request('POST', '/api/users', rest)
        assert.equal(res.status, 400)
    })

    test('missing longitude returns 400', async () => {
        const { lng, ...rest } = validUser
        const res = await request('POST', '/api/users', rest)
        assert.equal(res.status, 400)
    })

    test('out-of-range latitude returns 400', async () => {
        const res = await request('POST', '/api/users', { ...validUser, lat: 200 })
        assert.equal(res.status, 400)
    })

    test('non-numeric longitude returns 400', async () => {
        const res = await request('POST', '/api/users', { ...validUser, lng: 'east' })
        assert.equal(res.status, 400)
    })
})

describe('Edge cases — password rules', () => {
    test('password shorter than 8 chars returns 400', async () => {
        const res = await request('POST', '/api/users', { ...validUser, password: 'pas1' })
        assert.equal(res.status, 400)
    })

    test('password without a number returns 400', async () => {
        const res = await request('POST', '/api/users', { ...validUser, password: 'password' })
        assert.equal(res.status, 400)
    })

    test('exactly 8 chars with a number is accepted', async () => {
        const res = await request('POST', '/api/users', { ...validUser, password: 'abcdefg1' })
        assert.equal(res.status, 201)
    })
})

describe('Edge cases — duplicate username', () => {
    test('registering the same username twice returns 409', async () => {
        await request('POST', '/api/users', validUser)
        const res = await request('POST', '/api/users', validUser)
        assert.equal(res.status, 409)
    })
})

describe('Edge cases — GET /api/users/:id', () => {
    test('non-existent id returns 404', async () => {
        const res = await request('GET', '/api/users/99999')
        assert.equal(res.status, 404)
    })

    test('non-numeric id returns 404', async () => {
        const res = await request('GET', '/api/users/abc')
        assert.equal(res.status, 404)
    })
})
