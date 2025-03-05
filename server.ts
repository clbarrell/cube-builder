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

// Define types for game state
interface Player {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
  };
}

interface Cube {
  position: {
    x: number;
    y: number;
    z: number;
  };
  playerId: string;
  playerName: string;
}

interface GameState {
  players: Record<string, Player>;
  cubes: Cube[];
}

// Game state
const gameState: GameState = {
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

  // Handle cube:add
  socket.on("cube:add", (data) => {
    // Check if data is valid
    if (!data || !data.position || !data.playerId || !data.playerName) {
      console.error("Invalid cube:add data:", data);
      return;
    }

    const { position, playerId, playerName } = data;

    // Validate that the player is the one making the request
    if (playerId !== socket.id) {
      console.warn(`Player ${socket.id} tried to add a cube for ${playerId}`);
      return;
    }

    // Check if a cube already exists at this position
    const cubeExists = gameState.cubes.some(
      (cube) =>
        cube.position.x === position.x &&
        cube.position.y === position.y &&
        cube.position.z === position.z
    );

    if (!cubeExists) {
      // Add the cube to the game state
      const newCube = {
        position,
        playerId,
        playerName,
      };

      gameState.cubes.push(newCube);

      // Broadcast to all other players
      socket.broadcast.emit("cube:add", newCube);

      console.log(
        `Player ${playerName} (${playerId}) added a cube at`,
        position,
        "total:",
        gameState.cubes.length
      );
    } else {
      console.log("Cube already exists at position:", position);
    }
  });

  // Handle cube:remove
  socket.on("cube:remove", (data) => {
    console.log("Received cube:remove event with data:", data);

    // Check if data is valid
    if (!data || !data.position || !data.playerId) {
      console.error("Invalid cube:remove data:", data);
      return;
    }

    const { position, playerId } = data;

    // Validate that the player is the one making the request
    if (playerId !== socket.id) {
      console.warn(
        `Player ${socket.id} tried to remove a cube for ${playerId}`
      );
      return;
    }

    // Find the cube at this position
    const cubeIndex = gameState.cubes.findIndex(
      (cube) =>
        cube.position.x === position.x &&
        cube.position.y === position.y &&
        cube.position.z === position.z
    );

    // Check if the cube exists and belongs to the player
    if (cubeIndex !== -1) {
      const cube = gameState.cubes[cubeIndex];

      if (cube.playerId === playerId) {
        // Remove the cube from the game state
        gameState.cubes.splice(cubeIndex, 1);

        // Broadcast to all other players
        console.log("Broadcasting cube:remove to other players");
        socket.broadcast.emit("cube:remove", { position });

        console.log(
          `Player ${cube.playerName} (${playerId}) removed a cube at`,
          position
        );
        console.log("Current cube count:", gameState.cubes.length);
      } else {
        console.warn(
          `Player ${socket.id} tried to remove a cube that belongs to ${cube.playerId}`
        );
      }
    } else {
      console.log("No cube found at position:", position);
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
  console.log(
    `Connect from other devices using your local network IP address and port ${PORT}`
  );
});
