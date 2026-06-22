const http = require('http')
const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'wolt_dev_secret'

// Returns a request() bound to a given port.
// request(method, path, body?, headers?) → Promise<{ status, headers, body }>
function makeRequest(port) {
    return function request(method, path, body, headers = {}) {
        return new Promise((resolve, reject) => {
            const payload = body ? JSON.stringify(body) : null
            const req = http.request({
                hostname: 'localhost',
                port,
                path,
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
                    ...headers
                }
            }, (res) => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data ? JSON.parse(data) : null
                }))
            })
            req.on('error', reject)
            if (payload) req.write(payload)
            req.end()
        })
    }
}

// Sign a JWT the same way tokensController does, so protected routes accept it.
const makeToken = (userId = 1, username = 'tester') =>
    jwt.sign({ userId, username }, SECRET, { expiresIn: '1h' })

// Convenience: an Authorization header for a given user.
const authHeader = (userId = 1, username = 'tester') =>
    ({ Authorization: `Bearer ${makeToken(userId, username)}` })

module.exports = { makeRequest, makeToken, authHeader }
