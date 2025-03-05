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

// Map to track name to socket ID
const nameToSocketId: Record<string, string> = {};
const socketIdToName: Record<string, string> = {};

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle player:join
  socket.on("player:join", (data) => {
    const { name, position } = data;

    // Check if name is already taken by another active connection
    const existingSocketId = nameToSocketId[name];
    if (
      existingSocketId &&
      existingSocketId !== socket.id &&
      gameState.players[existingSocketId]
    ) {
      // Name is already in use by an active player
      socket.emit("player:join:error", { message: "Name already in use" });
      return;
    }

    // Check if this player is reconnecting with the same name
    if (existingSocketId && existingSocketId !== socket.id) {
      // Remove the old socket ID mapping
      delete socketIdToName[existingSocketId];
    }

    // Update name mappings
    nameToSocketId[name] = socket.id;
    socketIdToName[socket.id] = name;

    // Create new player
    const player = {
      id: name, // Use name as ID instead of socket.id
      name,
      position,
      rotation: { x: 0, y: 0 },
    };

    // Add player to game state
    gameState.players[name] = player;

    // Broadcast to other players
    socket.broadcast.emit("player:join", player);

    // Send current state to new player
    socket.emit("state:sync", gameState);

    console.log(`Player joined: ${name} (${socket.id})`);
  });

  // Handle player:move
  socket.on("player:move", (data) => {
    const { position, rotation } = data;
    const playerName = socketIdToName[socket.id];

    // Update player position if player exists
    if (playerName && gameState.players[playerName]) {
      gameState.players[playerName].position = position;
      gameState.players[playerName].rotation = rotation;

      // Broadcast to other players
      socket.broadcast.emit("player:move", {
        id: playerName, // Use name as ID
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
    const currentPlayerName = socketIdToName[socket.id];

    // Validate that the player is the one making the request or has the same name
    if (playerId !== currentPlayerName && playerId !== socket.id) {
      console.warn(
        `Player ${currentPlayerName} tried to add a cube for ${playerId}`
      );
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
      // Add the cube to the game state with player name as ID
      const newCube = {
        position,
        playerId: currentPlayerName, // Use name as ID
        playerName,
      };

      gameState.cubes.push(newCube);

      // Broadcast to all other players
      socket.broadcast.emit("cube:add", newCube);

      console.log(
        `Player ${playerName} (${socket.id}) added a cube at`,
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
    const currentPlayerName = socketIdToName[socket.id];

    // Find the cube at this position
    const cubeIndex = gameState.cubes.findIndex(
      (cube) =>
        cube.position.x === position.x &&
        cube.position.y === position.y &&
        cube.position.z === position.z
    );

    // Check if the cube exists and belongs to the player (by name)
    if (cubeIndex !== -1) {
      const cube = gameState.cubes[cubeIndex];

      // Allow removal if the cube belongs to this player name or socket ID
      if (cube.playerId === currentPlayerName || cube.playerId === playerId) {
        // Remove the cube from the game state
        gameState.cubes.splice(cubeIndex, 1);

        // Broadcast to all other players
        console.log("Broadcasting cube:remove to other players");
        socket.broadcast.emit("cube:remove", { position });

        console.log(
          `Player ${currentPlayerName} (${socket.id}) removed a cube at`,
          position
        );
        console.log("Current cube count:", gameState.cubes.length);
      } else {
        console.warn(
          `Player ${currentPlayerName} tried to remove a cube that belongs to ${cube.playerId}`
        );
      }
    } else {
      console.log("No cube found at position:", position);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const playerName = socketIdToName[socket.id];

    // Get player info before removal
    const player = playerName ? gameState.players[playerName] : null;

    // Remove player from game state
    if (player) {
      delete gameState.players[playerName];
      delete socketIdToName[socket.id];
      // Don't delete from nameToSocketId to allow reconnection with same name

      // Broadcast to other players
      io.emit("player:leave", { id: playerName });

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
