# Cube Builder

A 3D scene/game built with React Three Fiber.

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
   npm install
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```
