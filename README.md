# Cube Builder

This is a multiplayer game built with React Three Fiber. Where each player can add a limited number of cubes to the scene.

## Project Structure

```
src/
├── components/           # Reusable UI and 3D components
│   ├── controls/         # Camera and player controls
│   ├── environment/      # Environment elements (floor, lighting, etc.)
│   ├── objects/          # Basic 3D objects and shapes
│   └── UI/               # User interface components
├── game/                 # Game-specific logic
│   ├── entities/         # Game entities (players, enemies, items)
│   ├── systems/          # Game systems (physics, collision, etc.)
│   └── state/            # Game state management
├── hooks/                # Custom React hooks
├── scenes/               # Scene compositions
├── utils/                # Utility functions
└── assets/               # Static assets (textures, models, sounds)
```

## Key Components

- **FirstPersonControls**: Handles camera movement and player input
- **Floor**: Renders the ground plane and grid
- **Lighting**: Sets up scene lighting
- **BasicShapes**: Renders basic 3D shapes for reference
- **Cube**: A sample game entity with animation

## Game Systems

- **CollisionSystem**: Handles collision detection and resolution
- **GameState**: Manages game state using Zustand

## Development

1. Install dependencies:

   ```
   pnpm install
   ```

2. Create a `.env` file based on `.env.example`:

   ```
   cp .env.example .env
   ```

3. Start the development server and Socket.io server together:

   ```
   pnpm dev:all
   ```

   Or run them separately:

   ```
   # Terminal 1 - Client
   pnpm dev

   # Terminal 2 - Server
   pnpm server
   ```

4. Build for production:

   ```
   pnpm build
   pnpm build:server
   ```

5. Start the production server:
   ```
   pnpm start
   ```

## Multiplayer Features

- Each player can add a limited number of cubes to the scene
- Players can see each other's positions in real-time
- Players can only remove cubes they placed (cmd+click or right-click)
- Player names are displayed above their avatars
- A counter shows the number of connected players
