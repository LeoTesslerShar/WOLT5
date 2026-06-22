const { test, describe } = require('node:test')
const assert = require('assert/strict')
const { validatePayment, luhnValid, detectBrand, expiryValid } = require('../utils/payment')

const futureExpiry = () => `12/${String((new Date().getFullYear() + 2) % 100).padStart(2, '0')}`
const validPayment = { cardName: 'Test User', cardNumber: '4242 4242 4242 4242', expiry: futureExpiry(), cvv: '123' }

describe('luhnValid', () => {
    test('accepts a valid card number', () => {
        assert.equal(luhnValid('4242424242424242'), true)
    })
    test('rejects an invalid card number', () => {
        assert.equal(luhnValid('1234567890123456'), false)
    })
})

describe('detectBrand', () => {
    test('detects Visa', () => assert.equal(detectBrand('4242424242424242'), 'Visa'))
    test('detects Mastercard', () => assert.equal(detectBrand('5555555555554444'), 'Mastercard'))
    test('detects American Express', () => assert.equal(detectBrand('378282246310005'), 'American Express'))
    test('falls back to Card for unknown prefixes', () => assert.equal(detectBrand('6011111111111117'), 'Card'))
})

describe('expiryValid', () => {
    test('accepts a future MM/YY', () => assert.equal(expiryValid(futureExpiry()), true))
    test('rejects a past date', () => assert.equal(expiryValid('01/20'), false))
    test('rejects a bad month', () => assert.equal(expiryValid('13/30'), false))
    test('rejects a malformed string', () => assert.equal(expiryValid('2030-12'), false))
})

describe('validatePayment', () => {
    test('accepts a valid card and returns masked details', () => {
        const r = validatePayment(validPayment)
        assert.equal(r.valid, true)
        assert.equal(r.brand, 'Visa')
        assert.equal(r.last4, '4242')
    })
    test('rejects when payment is missing', () => {
        assert.equal(validatePayment(null).valid, false)
    })
    test('rejects an empty cardholder name', () => {
        assert.equal(validatePayment({ ...validPayment, cardName: ' ' }).valid, false)
    })
    test('rejects a Luhn-invalid number', () => {
        assert.equal(validatePayment({ ...validPayment, cardNumber: '1234567890123456' }).valid, false)
    })
    test('rejects a short CVV', () => {
        assert.equal(validatePayment({ ...validPayment, cvv: '1' }).valid, false)
    })
    test('accepts a hyphen/space separated number', () => {
        assert.equal(validatePayment({ ...validPayment, cardNumber: '4242-4242-4242-4242' }).valid, true)
    })
})
