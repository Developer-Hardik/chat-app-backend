const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins
        methods: ['GET', 'POST'],
    },
});

const users = new Set(); // Track online users

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for new users joining
    socket.on('join', (username) => {
        users.add(username);
        io.emit('user joined', username); // Broadcast to all users
        io.emit('update users', Array.from(users)); // Send updated user list
    });

    // Listen for chat messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', { username: msg.username, message: msg.message });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const username = Array.from(users).find((user) => user === socket.username);
        if (username) {
            users.delete(username);
            io.emit('user left', username); // Broadcast to all users
            io.emit('update users', Array.from(users)); // Send updated user list
            console.log('A user disconnected:', username);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
