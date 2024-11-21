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
    message = message.toString();
    console.log('Received:', message);

    // Save the message to the messageLog array
    messageLog.push(message);

    // Send a confirmation back to the client
    ws.send('Message received and logged');

    ws.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        ws.send('(LOG)' + JSON.stringify({ logs: messageLog }));
      }
    });
  });

  // When the connection is closed
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(process.env.PORT || 8000, () => {
  console.log(`WebSocket server running on port ${process.env.PORT || 8000}`);
});