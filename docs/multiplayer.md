Cube Builder - Multiplayer Design Document
1. Overview
Cube Builder is a multiplayer game built with React Three Fiber where players can collaboratively add cubes to a 3D scene. Each player has a limited number of cubes they can place, and players can see each other's positions and contributions in real-time.
2. Technology Stack
Frontend: React, React Three Fiber, Three.js
State Management: Zustand
Multiplayer Communication: Socket.io
Build Tool: Vite
Package Manager: pnpm
3. Core Features
3.1 Player Management
Player Identification:
When a player joins, prompt for their name
Store player name in client and server state
Associate player name with their placed cubes
Display player count in UI
3.2 Cube Placement
Cube Ownership:
Each cube is associated with the player who placed it
Store player name with each cube in the shared state
Visual indication of cube ownership (different colors or labels)
3.3 Cube Removal
Ownership-based Removal:
Players can only remove cubes they placed
Remove via cmd+click (Mac) or right-click
Visual feedback when attempting to remove another player's cube
3.4 Player Visualization
Player Representation:
Render a cylinder at each player's position
Display player name above their cylinder
Update positions in real-time
4. Data Structures
4.1 Player State
interface Player {
  id: string;         // Unique player ID (socket ID)
  name: string;       // Player display name
  position: {         // Player's current position
    x: number;
    y: number;
    z: number;
  };
  rotation: {         // Player's current rotation
    x: number;
    y: number;
  };
}

interface PlayerState {
  players: Record<string, Player>;  // Map of player ID to player data
  localPlayerId: string | null;     // Current player's ID
  count: number;                    // Total number of connected players
}

4.2 Cube State
interface Cube {
  position: {
    x: number;
    y: number;
    z: number;
  };
  playerId: string;    // ID of player who placed the cube
  playerName: string;  // Name of player who placed the cube
}

interface CubeState {
  cubes: Cube[];
  maxCubesPerPlayer: number;
  addCube: (position: THREE.Vector3) => void;
  removeCube: (position: THREE.Vector3) => void;
  hasReachedLimit: () => boolean;
  getCubesByPlayer: (playerId: string) => Cube[];
}

5. Component Structure
5.1 New Components
PlayerNameInput: Modal dialog to collect player name on join
PlayerList: UI component showing connected players
PlayerVisualization: 3D component rendering cylinders for other players
OwnedCube: Enhanced cube component with ownership information
5.2 Modified Components
CubeState: Update to include player information and cube removal
CubePlacementPreview: Update to handle cube removal interaction
Cubes: Update to render cubes with ownership information
MainScene: Add PlayerVisualization component
FirstPersonScene: Add PlayerList component
6. Socket.io Communication
6.1 Events
player:join: New player joins the game
Data: { id: string, name: string, position: Vector3 }
player:leave: Player disconnects
Data: { id: string }
player:move: Player position update
Data: { id: string, position: Vector3, rotation: Vector2 }
cube:add: Player adds a cube
Data: { position: Vector3, playerId: string, playerName: string }
cube:remove: Player removes a cube
Data: { position: Vector3, playerId: string }
state:sync: Full state synchronization
Data: { players: Record<string, Player>, cubes: Cube[] }
6.2 Server-Side Logic
Maintain authoritative state of players and cubes
Validate cube placement and removal requests
Broadcast state changes to all connected clients
Handle player disconnections and cleanup
7. User Experience Flow
Game Load:
Connect to Socket.io server
Display player name input modal
Player Join:
Submit player name
Receive initial game state
Spawn at default position
Gameplay:
Move around using WASD/arrow keys
Place cubes with left-click
Remove own cubes with cmd+click or right-click
See other players as cylinders with names
View cube count and player count in UI
Player Leave:
Socket disconnection
Player removed from other clients' views
Player's cubes remain in the scene
8. Implementation Plan
8.1 Phase 1: Socket.io Integration
Set up Socket.io client and server
Implement basic connection handling
Create player name input modal
8.2 Phase 2: Player State Management
Create PlayerState store with Zustand
Implement player position synchronization
Add player visualization (cylinders)
8.3 Phase 3: Enhanced Cube Management
Update CubeState to include player information
Implement cube ownership and removal logic
Add visual indicators for cube ownership
8.4 Phase 4: UI Enhancements
Add player list component
Update cube counter to show per-player counts
Add feedback for cube removal permissions
8.5 Phase 5: Testing and Optimization
Test multiplayer functionality
Optimize network traffic
Handle edge cases (disconnections, etc.)
9. Technical Considerations
9.1 Performance
Throttle position updates to reduce network traffic
Use efficient data structures for cube and player management
Implement client-side prediction for smooth movement
9.2 Security
Validate all client actions on the server
Prevent cube placement/removal exploitation
Sanitize player names
9.3 Scalability
Design for potential increase in player count
Consider room-based architecture for larger deployments

Technology: Combine Vite, zustand, react with Socket.io

WHEN USEr JOINS< ASK THEIR NAME. Store in state.

STORE NAME WITH CUBE's ADDED.

ALLOW YOU TO REMOVE THE CUBE, AS LONG AS IT"S YOURS. cmd+click or right click. Can’t remove if it’s not yours.

Show a count of players as a UI component.

Also include in the shared state the location of each player. So that players can "see" each other player, and a cylinder can be rendered where each player is. Their name should be above the shape.
