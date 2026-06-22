// Credit-card validation used when placing an order.
// We never store the full card number or the CVV — only the brand and last 4 digits.

// Luhn checksum — the standard sanity check for card numbers.
function luhnValid(digits) {
    let sum = 0
    let alternate = false
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10)
        if (alternate) {
            n *= 2
            if (n > 9) n -= 9
        }
        sum += n
        alternate = !alternate
    }
    return sum % 10 === 0
}

function detectBrand(digits) {
    if (/^4/.test(digits)) return 'Visa'
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard'
    if (/^3[47]/.test(digits)) return 'American Express'
    return 'Card'
}

// expiry must be MM/YY and not in the past
function expiryValid(expiry) {
    const match = /^(\d{2})\/(\d{2})$/.exec(String(expiry).trim())
    if (!match) return false
    const month = parseInt(match[1], 10)
    const year = 2000 + parseInt(match[2], 10)
    if (month < 1 || month > 12) return false
    // valid through the last day of the stated month → expires at the start of the next month
    const expiresAt = new Date(year, month, 1)
    return expiresAt > new Date()
}

// Validates a payment object. Returns { valid, error } on failure,
// or { valid: true, last4, brand } on success.
function validatePayment(payment) {
    if (!payment || typeof payment !== 'object')
        return { valid: false, error: 'Payment details are required' }

    const { cardName, cardNumber, expiry, cvv } = payment

    if (!cardName || !String(cardName).trim())
        return { valid: false, error: 'Cardholder name is required' }

    const digits = String(cardNumber || '').replace(/[\s-]/g, '')
    if (!/^\d{13,19}$/.test(digits))
        return { valid: false, error: 'Card number must be 13–19 digits' }
    if (!luhnValid(digits))
        return { valid: false, error: 'Card number is invalid' }

    if (!expiryValid(expiry))
        return { valid: false, error: 'Card expiry is invalid or in the past' }

    if (!/^\d{3,4}$/.test(String(cvv || '')))
        return { valid: false, error: 'CVV must be 3 or 4 digits' }

    return { valid: true, last4: digits.slice(-4), brand: detectBrand(digits) }
}

module.exports = { validatePayment, luhnValid, detectBrand, expiryValid }
