const net = require('net');

// Ex2 server connection config — set via docker-compose environment variables
// Falls back to localhost:8080 for manual (non-Docker) runs
const EX2_HOST = process.env.EX2_HOST || 'localhost';
const EX2_PORT = parseInt(process.env.EX2_PORT) || 8080;

/**
 * Sends a command to the Ex2 C++ server over TCP and returns the response.
 *
 * Ex2 protocol:
 *   - First line: command name (POST / GET / PATCH / DELETE)
 *   - Second line: arguments (userId and optional productIds separated by spaces)
 *   - Server replies with a status line (e.g. "200 OK", "201 Created", "404 Not Found")
 *
 * A new TCP connection is opened per call and closed after the response is received.
 *
 * @param {string} command - Ex2 command (POST, GET, PATCH, DELETE)
 * @param {string} args    - Arguments line (e.g. "42 1 2 3")
 * @returns {Promise<string>} - Raw response string from Ex2
 */
function sendToEx2(command, args) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let response = '';

        // connect to Ex2 server
        client.connect(EX2_PORT, EX2_HOST, () => {
            // send command on first line, arguments on second line
            client.write(`${command}\n${args}\n`);
        });

        // accumulate response chunks (TCP may split data across multiple events)
        client.on('data', (data) => {
            response += data.toString();
            client.destroy(); // close connection after first response
        });

        client.on('close', () => resolve(response.trim()));

        client.on('error', (err) => {
            reject(new Error(`Ex2 server connection failed: ${err.message}`));
        });
    });
}

/**
 * Adds a new user with their initial product list to Ex2.
 * Called when a user views products for the first time.
 *
 * @param {number} userId
 * @param {number[]} productIds
 */
async function addUserProducts(userId, productIds) {
    const args = `${userId} ${productIds.join(' ')}`;
    return await sendToEx2('POST', args);
}

/**
 * Records that a user viewed a product — updates Ex2 recommendation data.
 * Called on GET /api/restaurants/:id/products/:pId.
 *
 * @param {number} userId
 * @param {number[]} productIds
 */
async function patchUserProducts(userId, productIds) {
    const args = `${userId} ${productIds.join(' ')}`;
    return await sendToEx2('PATCH', args);
}

/**
 * Gets product recommendations for a user from Ex2.
 *
 * @param {number} userId
 * @returns {Promise<string>} - recommended product ids as space-separated string
 */
async function getRecommendations(userId) {
    return await sendToEx2('GET', `${userId}`);
}

/**
 * Deletes a user's data from Ex2.
 *
 * @param {number} userId
 */
async function deleteUser(userId) {
    return await sendToEx2('DELETE', `${userId}`);
}

module.exports = { addUserProducts, patchUserProducts, getRecommendations, deleteUser };
