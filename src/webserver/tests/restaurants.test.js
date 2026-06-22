const { test, describe, before, after, beforeEach } = require('node:test')
const assert = require('assert/strict')
const app = require('../app')
const Restaurant = require('../models/Restaurant')
const { makeRequest, authHeader } = require('./helpers')

const TEST_PORT = 3001
const request = makeRequest(TEST_PORT)

// owner of everything created in the happy-path tests
const auth = authHeader(1, 'owner')

let server

before(() => { server = app.listen(TEST_PORT) })
after(() => server.close())
beforeEach(() => Restaurant.reset())

// a valid phone and coordinates are required on creation; tests that don't care use these defaults
const PHONE = '03-0000000'
const COORDS = { lat: 32.0853, lng: 34.7818 }

// helper: create a restaurant as the given owner, return its id
async function createRestaurant(body = { name: 'Test' }, headers = auth) {
    const res = await request('POST', '/api/restaurants', { phone: PHONE, ...COORDS, ...body }, headers)
    return res.headers.location.split('/').pop()
}

// ─── happy path ───────────────────────────────────────────────

describe('GET /api/restaurants', () => {
    test('is public and returns empty array when none exist', async () => {
        const res = await request('GET', '/api/restaurants')
        assert.equal(res.status, 200)
        assert.deepEqual(res.body, [])
    })

    test('returns all restaurants after creation', async () => {
        await request('POST', '/api/restaurants', { name: 'A', phone: PHONE, ...COORDS }, auth)
        await request('POST', '/api/restaurants', { name: 'B', phone: PHONE, ...COORDS }, auth)
        const res = await request('GET', '/api/restaurants')
        assert.equal(res.body.length, 2)
    })
})

describe('POST /api/restaurants', () => {
    test('creates a restaurant and returns 201 with Location header', async () => {
        const res = await request('POST', '/api/restaurants', {
            name: 'Pizza Roma', description: 'Italian food', cuisine: 'Italian', address: 'Tel Aviv', phone: PHONE, ...COORDS
        }, auth)
        assert.equal(res.status, 201)
        assert.match(res.headers.location, /^\/api\/restaurants\/.+/)
    })

    test('stores all provided fields and the owner id', async () => {
        await request('POST', '/api/restaurants', {
            name: 'Burger King', description: 'Fast food', cuisine: 'American', address: 'Haifa', phone: '04-1234567', ...COORDS
        }, auth)
        const r = (await request('GET', '/api/restaurants')).body[0]
        assert.equal(r.name, 'Burger King')
        assert.equal(r.description, 'Fast food')
        assert.equal(r.cuisine, 'American')
        assert.equal(r.address, 'Haifa')
        assert.equal(r.phone, '04-1234567')
        assert.equal(r.ownerId, 1)
    })

    test('stores lat/lng when provided', async () => {
        await request('POST', '/api/restaurants', { name: 'Geo', lat: 32.07, lng: 34.79, phone: PHONE }, auth)
        const r = (await request('GET', '/api/restaurants')).body[0]
        assert.equal(r.lat, 32.07)
        assert.equal(r.lng, 34.79)
    })
})

describe('GET /api/restaurants/:id', () => {
    test('returns the correct restaurant by id', async () => {
        const id = await createRestaurant({ name: 'Taizu' })
        const res = await request('GET', `/api/restaurants/${id}`)
        assert.equal(res.status, 200)
        assert.equal(res.body.name, 'Taizu')
        assert.equal(res.body.id, id)
    })
})

describe('PATCH /api/restaurants/:id', () => {
    test('updates name and returns 204', async () => {
        const id = await createRestaurant({ name: 'Old Name' })
        const patch = await request('PATCH', `/api/restaurants/${id}`, { name: 'New Name' }, auth)
        assert.equal(patch.status, 204)
        const get = await request('GET', `/api/restaurants/${id}`)
        assert.equal(get.body.name, 'New Name')
    })

    test('updates lat/lng', async () => {
        const id = await createRestaurant({ name: 'Moves', lat: 1, lng: 1 })
        await request('PATCH', `/api/restaurants/${id}`, { lat: 5.5, lng: 6.6 }, auth)
        const get = await request('GET', `/api/restaurants/${id}`)
        assert.equal(get.body.lat, 5.5)
        assert.equal(get.body.lng, 6.6)
    })
})

describe('DELETE /api/restaurants/:id', () => {
    test('deletes a restaurant and returns 204', async () => {
        const id = await createRestaurant({ name: 'To Delete' })
        const del = await request('DELETE', `/api/restaurants/${id}`, null, auth)
        assert.equal(del.status, 204)
        const get = await request('GET', `/api/restaurants/${id}`)
        assert.equal(get.status, 404)
    })

    test('deleting one restaurant does not affect others', async () => {
        await createRestaurant({ name: 'Keep Me' })
        const id2 = await createRestaurant({ name: 'Delete Me' })
        await request('DELETE', `/api/restaurants/${id2}`, null, auth)
        const all = await request('GET', '/api/restaurants')
        assert.equal(all.body.length, 1)
        assert.equal(all.body[0].name, 'Keep Me')
    })
})

// ─── auth edge cases ──────────────────────────────────────────

describe('Edge cases — authentication required', () => {
    test('POST without a token returns 401', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'NoAuth' })
        assert.equal(res.status, 401)
    })

    test('POST with a malformed token returns 401', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'Bad' }, { Authorization: 'Bearer not.a.jwt' })
        assert.equal(res.status, 401)
    })

    test('PATCH without a token returns 401', async () => {
        const id = await createRestaurant({ name: 'Guarded' })
        const res = await request('PATCH', `/api/restaurants/${id}`, { name: 'x' })
        assert.equal(res.status, 401)
    })

    test('DELETE without a token returns 401', async () => {
        const id = await createRestaurant({ name: 'Guarded' })
        const res = await request('DELETE', `/api/restaurants/${id}`)
        assert.equal(res.status, 401)
    })
})

describe('Edge cases — ownership', () => {
    test('a different user cannot PATCH the restaurant (403)', async () => {
        const id = await createRestaurant({ name: 'Mine' })
        const res = await request('PATCH', `/api/restaurants/${id}`, { name: 'Hijacked' }, authHeader(2, 'intruder'))
        assert.equal(res.status, 403)
    })

    test('a different user cannot DELETE the restaurant (403)', async () => {
        const id = await createRestaurant({ name: 'Mine' })
        const res = await request('DELETE', `/api/restaurants/${id}`, null, authHeader(2, 'intruder'))
        assert.equal(res.status, 403)
    })
})

// ─── validation / data edge cases ─────────────────────────────

describe('Edge cases — POST validation', () => {
    test('missing name returns 400', async () => {
        const res = await request('POST', '/api/restaurants', {}, auth)
        assert.equal(res.status, 400)
    })

    test('empty string name returns 400', async () => {
        const res = await request('POST', '/api/restaurants', { name: '' }, auth)
        assert.equal(res.status, 400)
    })

    test('whitespace-only name returns 400', async () => {
        const res = await request('POST', '/api/restaurants', { name: '   ' }, auth)
        assert.equal(res.status, 400)
    })

    test('missing phone returns 400', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'No Phone' }, auth)
        assert.equal(res.status, 400)
    })

    test('whitespace-only phone returns 400', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'Blank Phone', phone: '   ' }, auth)
        assert.equal(res.status, 400)
    })

    test('missing coordinates returns 400', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'No Geo', phone: PHONE }, auth)
        assert.equal(res.status, 400)
    })

    test('out-of-range latitude returns 400', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'Bad Geo', phone: PHONE, lat: 200, lng: 34 }, auth)
        assert.equal(res.status, 400)
    })

    test('non-numeric longitude returns 400', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'Bad Geo', phone: PHONE, lat: 32, lng: 'west' }, auth)
        assert.equal(res.status, 400)
    })

    test('name is trimmed before saving', async () => {
        await request('POST', '/api/restaurants', { name: '  Trimmed  ', phone: PHONE, ...COORDS }, auth)
        const all = await request('GET', '/api/restaurants')
        assert.equal(all.body[0].name, 'Trimmed')
    })

    test('special characters and Hebrew in name are accepted', async () => {
        const res = await request('POST', '/api/restaurants', { name: 'מסעדת "השף" & Co.', phone: PHONE, ...COORDS }, auth)
        assert.equal(res.status, 201)
    })

    test('two restaurants with the same name are both created', async () => {
        await request('POST', '/api/restaurants', { name: 'Clone', phone: PHONE, ...COORDS }, auth)
        await request('POST', '/api/restaurants', { name: 'Clone', phone: PHONE, ...COORDS }, auth)
        const all = await request('GET', '/api/restaurants')
        assert.equal(all.body.length, 2)
    })
})

describe('Edge cases — GET /:id', () => {
    test('non-existent id returns 404', async () => {
        const res = await request('GET', '/api/restaurants/does-not-exist')
        assert.equal(res.status, 404)
    })
})

describe('Edge cases — PATCH /:id', () => {
    test('non-existent id returns 404', async () => {
        const res = await request('PATCH', '/api/restaurants/does-not-exist', { name: 'x' }, auth)
        assert.equal(res.status, 404)
    })

    test('partial update preserves unchanged fields', async () => {
        const id = await createRestaurant({ name: 'Original', cuisine: 'Italian', address: 'Tel Aviv' })
        await request('PATCH', `/api/restaurants/${id}`, { name: 'Updated' }, auth)
        const get = await request('GET', `/api/restaurants/${id}`)
        assert.equal(get.body.name, 'Updated')
        assert.equal(get.body.cuisine, 'Italian')
        assert.equal(get.body.address, 'Tel Aviv')
    })

    test('empty body does not corrupt existing data', async () => {
        const id = await createRestaurant({ name: 'Stable' })
        await request('PATCH', `/api/restaurants/${id}`, {}, auth)
        const get = await request('GET', `/api/restaurants/${id}`)
        assert.equal(get.body.name, 'Stable')
    })
})

describe('Edge cases — DELETE /:id', () => {
    test('non-existent id returns 404', async () => {
        const res = await request('DELETE', '/api/restaurants/does-not-exist', null, auth)
        assert.equal(res.status, 404)
    })

    test('double delete returns 404 on second attempt', async () => {
        const id = await createRestaurant({ name: 'One Time' })
        await request('DELETE', `/api/restaurants/${id}`, null, auth)
        const second = await request('DELETE', `/api/restaurants/${id}`, null, auth)
        assert.equal(second.status, 404)
    })
})
