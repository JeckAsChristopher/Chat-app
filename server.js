const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const useragent = require('express-useragent'); // Express UserAgent package
const UAParser = require('ua-parser-js'); // Import ua-parser-js package

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(useragent.express()); // Use the middleware to parse user agent

// Store chat messages in memory
let chatHistory = [];

// Serve the frontend (index.html) when accessing the root
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send the current chat history to the newly connected client
    socket.emit('chat-history', chatHistory);

    // Listen for messages from the client
    socket.on('message', (msg, userAgent) => {
        console.log('Message received: ' + msg);

        // Use ua-parser-js to parse the user agent string
        const parser = new UAParser();
        parser.setUA(userAgent);
        const result = parser.getResult();

        // Extract device details
        const deviceType = result.device.type || 'Unknown Device';
        const brand = result.device.vendor || 'Unknown Brand';
        const model = result.device.model || 'Unknown Model';
        
        // Detect if the user is using a mobile device
        const isMobile = result.device.type === 'mobile' || result.device.type === 'tablet';

        // If it's a mobile device, prepend the brand and model to the message
        const displayMessage = isMobile 
            ? `Cellphone (${brand} ${model}): ${msg}` 
            : msg;

        // Add the message to the chat history
        chatHistory.push(displayMessage);

        // Send the message to all connected clients
        io.emit('message', displayMessage);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
