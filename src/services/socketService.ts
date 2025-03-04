import { io, Socket } from "socket.io-client";
import { Vector3 } from "three";

// Types
export interface Player {
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

export interface Cube {
  position: {
    x: number;
    y: number;
    z: number;
  };
  playerId: string;
  playerName: string;
}

export interface GameState {
  players: Record<string, Player>;
  cubes: Cube[];
}

// Socket.io client instance
let socket: Socket | null = null;

// Server URL - use environment variable in production
// Avoid accessing import.meta.env directly during initialization
const getServerUrl = () =>
  import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

// Initialize socket connection with reconnection options
export const initializeSocket = (): Socket => {
  if (!socket) {
    try {
      socket = io(getServerUrl(), {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      // Set up connection event listeners
      socket.on("connect", () => {
        console.log("Socket.io connection established");
      });

      socket.on("disconnect", (reason) => {
        console.warn(`Socket disconnected: ${reason}`);
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
      });

      socket.on("reconnect_error", (error) => {
        console.error("Socket reconnection error:", error);
      });

      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });

      console.log("Socket.io connection initialized");
    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }
  }
  return socket!;
};

// Get socket instance with connection check
export const getSocket = (): Socket | null => {
  if (!socket) {
    console.warn("getSocket: No socket instance exists");
    return null;
  }

  if (!socket.connected) {
    console.warn("getSocket: Socket exists but is not connected");
    return null;
  }

  return socket;
};

// Add this function to ensure socket is connected
export const ensureSocketConnected = (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    // If no socket exists at all, initialize one
    if (!socket) {
      const newSocket = initializeSocket();

      if (newSocket.connected) {
        resolve(newSocket);
        return;
      }

      // Wait for connection
      const timeout = setTimeout(() => {
        newSocket.off("connect");
        reject(new Error("Socket connection timeout"));
      }, 5000);

      newSocket.once("connect", () => {
        clearTimeout(timeout);
        resolve(newSocket);
      });

      return;
    }

    // Socket exists but is disconnected - reconnect it
    if (socket && !socket.connected) {
      console.log("Reconnecting disconnected socket...");

      // Socket exists but is disconnected - let's reconnect
      socket.connect();

      // Use a non-null assertion since we've already checked socket is not null
      const socketInstance = socket!;

      const timeout = setTimeout(() => {
        socketInstance.off("connect");
        reject(new Error("Socket reconnection timeout"));
      }, 5000);

      socketInstance.once("connect", () => {
        clearTimeout(timeout);
        resolve(socketInstance);
      });

      return;
    }

    // Socket exists and is connected
    resolve(socket);
  });
};

// Modify joinGame to use ensureSocketConnected
export const joinGame = async (
  name: string,
  position: Vector3
): Promise<boolean> => {
  try {
    // Ensure socket is connected before joining
    await ensureSocketConnected();

    safeEmit("player:join", {
      name,
      position: {
        x: position.x,
        y: position.y,
        z: position.z,
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to join game:", error);
    return false;
  }
};

// Update player position
export const updatePosition = (
  position: Vector3,
  rotation: { x: number; y: number }
): void => {
  safeEmit("player:move", {
    position: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    rotation,
  });
};

// Disconnect from the server
export const disconnect = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket.io connection closed");
  }
};

// Safe event listener registration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeOn = (event: string, callback: (...args: any[]) => void): void => {
  const socketInstance = getSocket();
  if (!socketInstance) return;

  try {
    socketInstance.on(event, callback);
  } catch (error) {
    console.error(`Error setting up ${event} listener:`, error);
  }
};

export const onPlayerJoin = (callback: (player: Player) => void): void => {
  safeOn("player:join", callback);
};

export const onPlayerLeave = (
  callback: (data: { id: string }) => void
): void => {
  safeOn("player:leave", callback);
};

export const onPlayerMove = (
  callback: (data: {
    id: string;
    position: Vector3;
    rotation: { x: number; y: number };
  }) => void
): void => {
  safeOn("player:move", callback);
};

export const onStateSync = (callback: (state: GameState) => void): void => {
  safeOn("state:sync", callback);
};

export const onCubeAdd = (callback: (cube: Cube) => void): void => {
  safeOn("cube:add", callback);
};

export const onCubeRemove = (
  callback: (data: { position: { x: number; y: number; z: number } }) => void
): void => {
  safeOn("cube:remove", callback);
};

// Clean up event listeners
export const offAllEvents = (): void => {
  if (socket) {
    socket.off("player:join");
    socket.off("player:leave");
    socket.off("player:move");
    socket.off("state:sync");
    socket.off("cube:add");
    socket.off("cube:remove");
  }
};

// Add safe emit helper to wrap socket operations in try/catch
export const safeEmit = <T extends Record<string, unknown>>(
  event: string,
  data: T
): void => {
  const socketInstance = getSocket();

  if (!socketInstance) {
    console.error(`Cannot emit ${event}: Socket not connected`);
    return;
  }

  try {
    socketInstance.emit(event, data);
  } catch (error) {
    console.error(`Error emitting ${event}:`, error);
  }
};
