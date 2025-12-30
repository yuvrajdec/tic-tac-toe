const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = [];

        if (rooms[roomId].length >= 2) {
            socket.emit("room-full");
            return;
        }

        rooms[roomId].push(socket.id);

        const player = rooms[roomId].length === 1 ? "X" : "O";
        socket.emit("player-assign", player);

        console.log(`Player ${player} joined ${roomId}`);
    });

    socket.on("move", ({ roomId, index, symbol }) => {
    // emit exact same symbol to the other client
    socket.to(roomId).emit("move", { index, symbol });
});


    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
            if (rooms[roomId].length === 0) delete rooms[roomId];
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port", PORT);
});

