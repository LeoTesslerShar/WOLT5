let idCounter = 0
const users = [] // in-memory store, resets on server restart

// returns user by id without exposing password
const getUser = (id) => {
    const user = users.find(a => a.id === id)
    if (!user) return null
    const { password, ...rest } = user
    return rest
}

// stores new user with auto-incremented id
const createUser = (username, password, displayName, image, isOwner = false, lat = null, lng = null) => {
    const newUser = { id: ++idCounter, username, password, displayName, image, isOwner, lat, lng }
    users.push(newUser)
    return newUser
}

// returns user object if credentials match, undefined otherwise
const loginCheck = (username, password) => users.find(u => u.username === username && u.password === password)

const findByUsername = (username) => users.find(u => u.username === username)

// clear all users — used by tests to start from a clean state
const reset = () => {
    users.splice(0, users.length)
    idCounter = 0
}

module.exports = {
    getUser,
    createUser,
    loginCheck,
    findByUsername,
    reset
}
