import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Constants
const MAX_CUBES = 1000;

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
    origin:
      process.env.NODE_ENV === "production"
        ? "https://cube-builder.onrender.com"
        : "*", // Use wildcard in dev, restrict in production
    methods: ["GET", "POST"],
  },
});

express.static.mime.define({
  "application/javascript": ["js", "mjs"],
  "text/css": ["css"],
  "text/html": ["html", "htm"],
});

console.log("NODE ENV", process.env.NODE_ENV);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${new Date().toISOString()}]`, ...args);
  }
};

// Set correct MIME types for JavaScript modules
app.use((req, res, next) => {
  log(`Request for: ${req.url}`);
  if (
    req.url.endsWith(".js") ||
    req.url.includes("?v=") ||
    req.url.includes("?module") ||
    req.url.includes("?import")
  ) {
    res.type("application/javascript");
  } else if (req.url.endsWith(".mjs")) {
    res.type("application/javascript");
  } else if (req.url.endsWith(".css")) {
    res.type("text/css");
  }
  next();
});

// Serve static files from the Vite build output directory
app.use(express.static(path.join(__dirname, "../dist")));

// Fallback route for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

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

// Define game phases
enum GamePhase {
  LOBBY = "LOBBY",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface GameState {
  players: Record<string, Player>;
  cubes: Cube[];
  gamePhase: GamePhase;
  timer: {
    startTime: number | null;
    duration: number | null;
    endTime: number | null;
  };
}

// Game state
const gameState: GameState = {
  players: {},
  cubes: [],
  gamePhase: GamePhase.LOBBY,
  timer: {
    startTime: null,
    duration: null,
    endTime: null,
  },
};

// Map to track name to socket ID
const nameToSocketId: Record<string, string> = {};
const socketIdToName: Record<string, string> = {};

// Timer interval reference
let timerInterval: NodeJS.Timeout | null = null;

// Add a position map to track cube positions for O(1) lookups
const cubePositionMap: Record<string, number> = {};

// Helper function to create position key
function getPositionKey(position: { x: number; y: number; z: number }): string {
  return `${position.x},${position.y},${position.z}`;
}

// Command response interface
interface CommandResponse {
  success: boolean;
  message: string;
}

// Socket.io event handlers
io.on("connection", (socket) => {
  log("New client connected:", socket.id);

  // Handle player:join
  socket.on("player:join", (data) => {
    const { name, position } = data;
    let uniqueName = name;
    let counter = 1;

    // Check if this is a reconnection with the same name
    const isReconnecting =
      nameToSocketId[name] === socket.id || !gameState.players[name];

    // If not reconnecting, check for name conflicts
    if (!isReconnecting) {
      // Check if name is already taken by another active player
      while (gameState.players[uniqueName]) {
        uniqueName = `${name}${counter}`;
        counter++;
      }
    }

    // Update name mappings
    nameToSocketId[uniqueName] = socket.id;
    socketIdToName[socket.id] = uniqueName;

    // Create new player
    const player = {
      id: uniqueName, // Use name as player ID
      name: uniqueName,
      position,
      rotation: { x: 0, y: 0 },
    };

    // Add player to game state
    gameState.players[uniqueName] = player;

    // Broadcast to other players
    socket.broadcast.emit("player:join", player);

    // Send current state to new player
    socket.emit("state:sync", gameState);

    // Inform client if name was modified
    if (uniqueName !== name) {
      socket.emit("player:name:modified", {
        original: name,
        modified: uniqueName,
      });
    }

    log(`Player joined: ${uniqueName} (${socket.id})`);
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
        id: playerName, // Use player name as ID
        position,
        rotation,
      });
    }
  });

  // Handle cube:add
  socket.on("cube:add", (data) => {
    // Check if data is valid
    if (!data || !data.position || !data.playerName) {
      console.error("Invalid cube:add data:", data);
      return;
    }

    // Check if game is in active state
    if (gameState.gamePhase !== GamePhase.ACTIVE) {
      socket.emit("server:command:error", {
        message: "Cannot add cubes outside of active game",
      });
      return;
    }

    const { position, playerName } = data;
    const currentPlayerName = socketIdToName[socket.id];

    // Validate that the player is the one making the request
    if (playerName !== currentPlayerName) {
      console.warn(
        `Player ${currentPlayerName} tried to add a cube for ${playerName}`
      );
      return;
    }

    // Check if a cube already exists at this position using the hash map - O(1) lookup
    const posKey = getPositionKey(position);
    const cubeExists = cubePositionMap[posKey] !== undefined;

    if (!cubeExists) {
      // Add the cube to the game state with player name as ID
      const newCube = {
        position,
        playerId: currentPlayerName, // Use player name as ID
        playerName: currentPlayerName,
      };

      // Check if we've reached the MAX_CUBES limit
      if (gameState.cubes.length >= MAX_CUBES) {
        // Remove the oldest cube (first in the array)
        const oldestCube = gameState.cubes.shift();

        // Notify all clients about the removed cube
        if (oldestCube) {
          // Remove the oldest cube from the position map
          delete cubePositionMap[getPositionKey(oldestCube.position)];

          // Update all indices in the position map since we removed the first element
          Object.keys(cubePositionMap).forEach((key) => {
            cubePositionMap[key]--;
          });

          io.emit("cube:remove", { position: oldestCube.position });
          log(
            `Removed oldest cube at position ${JSON.stringify(
              oldestCube.position
            )} due to ${MAX_CUBES} cube limit`
          );
        }
      }

      // Add the new cube
      gameState.cubes.push(newCube);

      // Store the cube's index in the position map
      cubePositionMap[posKey] = gameState.cubes.length - 1;

      // Broadcast to all other players
      socket.broadcast.emit("cube:add", newCube);

      log(
        `Player ${currentPlayerName} (${socket.id}) added a cube at`,
        position,
        "total:",
        gameState.cubes.length
      );
    } else {
      log("Cube already exists at position:", position);
    }
  });

  // Handle cube:remove
  socket.on("cube:remove", (data) => {
    log("Received cube:remove event with data:", data);

    // Check if data is valid
    if (!data || !data.position) {
      console.error("Invalid cube:remove data:", data);
      return;
    }

    // Check if game is in active state
    if (gameState.gamePhase !== GamePhase.ACTIVE) {
      socket.emit("server:command:error", {
        message: "Cannot remove cubes outside of active game",
      });
      return;
    }

    const { position } = data;
    const currentPlayerName = socketIdToName[socket.id];

    // Find the cube at this position using the hash map - O(1) lookup
    const posKey = getPositionKey(position);
    const cubeIndex = cubePositionMap[posKey];

    // Check if the cube exists and belongs to the player (by name)
    if (cubeIndex !== undefined) {
      const cube = gameState.cubes[cubeIndex];

      // Allow removal if the cube belongs to this player name
      if (cube.playerId === currentPlayerName) {
        // Remove the cube from the game state
        gameState.cubes.splice(cubeIndex, 1);

        // Remove from position map
        delete cubePositionMap[posKey];

        // Update indices for all cubes that came after the removed one
        Object.keys(cubePositionMap).forEach((key) => {
          if (cubePositionMap[key] > cubeIndex) {
            cubePositionMap[key]--;
          }
        });

        // Broadcast to all other players
        log("Broadcasting cube:remove to other players");
        socket.broadcast.emit("cube:remove", { position });

        log(
          `Player ${currentPlayerName} (${socket.id}) removed a cube at`,
          position
        );
        log("Current cube count:", gameState.cubes.length);
      } else {
        console.warn(
          `Player ${currentPlayerName} tried to remove a cube that belongs to ${cube.playerId}`
        );
      }
    } else {
      log("No cube found at position:", position);
    }
  });

  // Handle server commands
  socket.on("server:command", (data) => {
    if (!data || !data.command) {
      socket.emit("server:command:error", {
        message: "Invalid command format",
      });
      return;
    }

    const { command } = data;
    log(`Received command from ${socket.id}: ${command}`);

    // Process commands
    try {
      const response = processCommand(command, socket.id);
      socket.emit("server:command:response", response);
    } catch (error) {
      socket.emit("server:command:error", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const playerName = socketIdToName[socket.id];

    // Remove player from game state
    if (playerName && gameState.players[playerName]) {
      const player = gameState.players[playerName];

      // Only delete the player if this socket owns the name
      if (nameToSocketId[playerName] === socket.id) {
        delete gameState.players[playerName];
        delete nameToSocketId[playerName];
      }

      delete socketIdToName[socket.id];

      // Broadcast to other players
      io.emit("player:leave", { id: playerName });

      log(`Player left: ${player.name} (${socket.id})`);
    } else {
      log("Client disconnected:", socket.id);
    }
  });
});

// Process server commands
function processCommand(command: string, socketId: string): CommandResponse {
  const parts = command.trim().toLowerCase().split(/\s+/);
  const cmd = parts[0];

  // Get player name from socket ID
  const playerName = socketIdToName[socketId];

  if (!playerName) {
    return {
      success: false,
      message: "You must be logged in to use commands",
    };
  }

  switch (cmd) {
    case "reset":
      // Check if player has permission (could implement admin roles later)
      return resetCubes();

    case "startgame":
      return startGame();

    case "timer": {
      const minutes = parseFloat(parts[1]);
      return startTimer(minutes);
    }

    case "memory":
      return {
        success: true,
        message: `Memory usage: ${Math.round(
          process.memoryUsage().heapUsed / 1024 / 1024
        )}MB / 512MB`,
      };

    case "help":
      return {
        success: true,
        message:
          "Available commands: reset, startgame, timer <minutes>, memory, help",
      };

    default:
      return {
        success: false,
        message: `Unknown command: ${cmd}. Type 'help' for available commands.`,
      };
  }
}

// Function to start the game
function startGame(): CommandResponse {
  if (gameState.gamePhase === GamePhase.ACTIVE) {
    return {
      success: false,
      message: "Game is already active",
    };
  }

  // Set game phase to ACTIVE
  gameState.gamePhase = GamePhase.ACTIVE;

  // Broadcast game state change
  io.emit("game:state:change", { phase: gameState.gamePhase });

  return {
    success: true,
    message: "Game started",
  };
}

// Function to start a timer
function startTimer(minutes: number): CommandResponse {
  if (isNaN(minutes) || minutes <= 0) {
    return {
      success: false,
      message: "Invalid time. Usage: timer <minutes>",
    };
  }

  if (gameState.gamePhase === GamePhase.ACTIVE) {
    return {
      success: false,
      message: "Game is already active",
    };
  }

  // Clear existing timer if any
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Set timer properties
  const now = Date.now();
  const durationMs = minutes * 60 * 1000;

  gameState.timer = {
    startTime: now,
    duration: durationMs,
    endTime: now + durationMs,
  };

  // Set game phase to ACTIVE
  gameState.gamePhase = GamePhase.ACTIVE;

  // Broadcast game state and timer
  io.emit("game:state:change", { phase: gameState.gamePhase });
  io.emit("timer:update", gameState.timer);

  // Start timer interval
  timerInterval = setInterval(() => {
    const now = Date.now();
    const timeLeft = (gameState.timer.endTime || 0) - now;

    if (timeLeft <= 0) {
      // Timer ended
      clearInterval(timerInterval as NodeJS.Timeout);
      timerInterval = null;

      // Set game phase to FINISHED
      gameState.gamePhase = GamePhase.FINISHED;

      // Broadcast game state change and timer end
      io.emit("game:state:change", { phase: gameState.gamePhase });
      io.emit("timer:end");

      // Reset timer
      gameState.timer = {
        startTime: null,
        duration: null,
        endTime: null,
      };
    } else {
      // Broadcast timer update every second
      io.emit("timer:update", {
        timeLeft,
        endTime: gameState.timer.endTime,
      });
    }
  }, 1000);

  return {
    success: true,
    message: `Timer started for ${minutes} minute${minutes === 1 ? "" : "s"}`,
  };
}

// Reset all cubes in the game
function resetCubes(): CommandResponse {
  const cubeCount = gameState.cubes.length;

  // Clear all cubes
  gameState.cubes = [];

  // Clear the position map
  Object.keys(cubePositionMap).forEach((key) => delete cubePositionMap[key]);

  // Reset game state to LOBBY
  gameState.gamePhase = GamePhase.LOBBY;

  // Clear timer if active
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // Reset timer
  gameState.timer = {
    startTime: null,
    duration: null,
    endTime: null,
  };

  // Broadcast cube reset and game state change
  io.emit("cubes:reset");
  io.emit("game:state:change", { phase: gameState.gamePhase });
  io.emit("timer:end");

  return {
    success: true,
    message: `Reset ${cubeCount} cube${
      cubeCount === 1 ? "" : "s"
    } and returned to lobby.`,
  };
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  log(`Server running on port ${PORT}`);
  log(
    `Connect from other devices using your local network IP address and port ${PORT}`
  );
});

process.on("SIGINT", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  process.exit(0);
});
