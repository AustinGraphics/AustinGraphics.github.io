const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocketServer({ server });

let messageLog = [];  // Array to store all messages

// Function to calculate the time remaining until the next midnight
function getMillisecondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);  // Set to midnight (00:00:00.000)
    return midnight - now;  // Time remaining until midnight in milliseconds
}

// Function to clear the log at midnight
function clearLogAtMidnight() {
    // Clear the log
    console.log('Clearing message log at midnight...');
    messageLog = [];
    
    // Calculate the time until the next midnight and set a timeout to call this function again
    const timeUntilNextMidnight = getMillisecondsUntilMidnight();
    setTimeout(clearLogAtMidnight, timeUntilNextMidnight);
}

// Start the first clearing at the next midnight
const initialTimeUntilMidnight = getMillisecondsUntilMidnight();
setTimeout(clearLogAtMidnight, initialTimeUntilMidnight);

wss.on('connection', (ws) => {
    console.log('Client connected');

    // When a message is received from a client
    ws.on('message', (message) => {
        console.log('Received:', message);

        // Save the message to the messageLog array
        messageLog.push(message);

        // Send a confirmation back to the client
        ws.send('Message received and logged');
    });

    // When the connection is closed
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Endpoint for the admin to fetch messages
wss.on('request', (req, res) => {
    // Check if the user is the admin (optional: replace this with a more secure check)
    const isAdmin = req.headers['profile'] == 'Austin';  // This is a simple example, you can improve this

    if (isAdmin) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(messageLog));  // Send all logged messages to the admin
    } else {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Unauthorized');
    }
});

server.listen(process.env.PORT || 8000, () => {
    console.log(`WebSocket server running on port ${process.env.PORT || 8000}`);
});