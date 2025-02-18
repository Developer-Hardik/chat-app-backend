// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (replace with your frontend URL in production)
        methods: ['GET', 'POST'],
    },
});

// Store online users
const onlineUsers = new Set();

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user joining the chat
    socket.on('join', (username) => {
        if (username) {
            // Add the user to the online users list
            onlineUsers.add(username);
            socket.username = username;

            // Notify all users that a new user has joined
            io.emit('user joined', username);

            // Send the updated list of online users to all clients
            io.emit('update users', Array.from(onlineUsers));

            console.log(`${username} joined the chat.`);
        }
    });

    // Handle chat messages
    socket.on('chat message', (data) => {
        if (data.username && data.message) {
            // Broadcast the message to all users
            io.emit('chat message', data);
            console.log(`${data.username}: ${data.message}`);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        if (socket.username) {
            // Remove the user from the online users list
            onlineUsers.delete(socket.username);

            // Notify all users that a user has left
            io.emit('user left', socket.username);

            // Send the updated list of online users to all clients
            io.emit('update users', Array.from(onlineUsers));

            console.log(`${socket.username} left the chat.`);
        }
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
