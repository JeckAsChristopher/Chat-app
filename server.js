const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());

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
    socket.on('message', (msg) => {
        console.log('Message received: ' + msg);
        // Add the message to the chat history
        chatHistory.push(msg);

        // Send the message to all connected clients
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});