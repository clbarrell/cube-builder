import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS for development
app.use(cors());

// Initialize Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your domain
    methods: ["GET", "POST"],
  },
});

// Serve static files in production
app.use(express.static(path.join(__dirname, "dist")));

// Game state
const gameState = {
  players: {},
  cubes: [],
};

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle player:join
  socket.on("player:join", (data) => {
    const { name, position } = data;

    // Create new player
    const player = {
      id: socket.id,
      name,
      position,
      rotation: { x: 0, y: 0 },
    };

    // Add player to game state
    gameState.players[socket.id] = player;

    // Broadcast to other players
    socket.broadcast.emit("player:join", player);

    // Send current state to new player
    socket.emit("state:sync", gameState);

    console.log(`Player joined: ${name} (${socket.id})`);
  });

  // Handle player:move
  socket.on("player:move", (data) => {
    const { position, rotation } = data;

    // Update player position if player exists
    if (gameState.players[socket.id]) {
      gameState.players[socket.id].position = position;
      gameState.players[socket.id].rotation = rotation;

      // Broadcast to other players
      socket.broadcast.emit("player:move", {
        id: socket.id,
        position,
        rotation,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Get player info before removal
    const player = gameState.players[socket.id];

    // Remove player from game state
    if (player) {
      delete gameState.players[socket.id];

      // Broadcast to other players
      io.emit("player:leave", { id: socket.id });

      console.log(`Player left: ${player.name} (${socket.id})`);
    } else {
      console.log("Client disconnected:", socket.id);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
