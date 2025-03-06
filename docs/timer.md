# Timer and Game State System

This document describes the timer and game state system implemented in the cube-builder application.

## Game States

The application has three game states:

1. **LOBBY** - Initial state when players join. Cube placement/removal is disabled.
2. **ACTIVE** - Game is in progress. Cube placement/removal is enabled.
3. **FINISHED** - Game has ended. Cube placement/removal is disabled.

## Timer Functionality

The timer is a countdown timer that can be set to a specific duration in minutes. When the timer reaches zero, the game state transitions from ACTIVE to FINISHED.

## Server Commands

The following commands can be used to control the game state and timer:

- `startgame` - Start the game immediately (transitions from LOBBY to ACTIVE)
- `timer <minutes>` - Start a countdown timer for the specified number of minutes (transitions from LOBBY to ACTIVE)
- `reset` - Reset the game state to LOBBY, clear all cubes, and stop the timer

## Visual Elements

1. **Timer Display** - A large 3D text element positioned at (0, 10, 0) in the scene that:

   - Always faces the camera/player (billboard mode)
   - Displays the countdown timer in MM:SS format when a timer is active
   - Shows "ACTIVE" when the game is active but no timer is set
   - Shows "LOBBY" or "GAME OVER" in the respective game states

2. **Game State UI** - A UI element that displays the current game state and relevant information:
   - Shows the current game phase (LOBBY, ACTIVE, FINISHED)
   - Displays timer information when a countdown is active
   - Provides appropriate messages based on the game state

## Implementation Details

### Server-Side

- The server maintains the game state and timer.
- The timer is implemented using `setInterval` with a 1-second interval.
- When the timer reaches zero, the game state transitions to FINISHED.
- Game state changes and timer updates are broadcast to all connected clients.

### Client-Side

- The client maintains a local copy of the game state and timer.
- The client updates the timer display every frame.
- Cube placement and removal are only allowed when the game state is ACTIVE.

## Usage Example

1. Players join the game (LOBBY state).
2. An administrator enters the command `timer 5` to start a 5-minute countdown.
3. The game state transitions to ACTIVE, and the timer starts counting down.
4. Players can place and remove cubes during the ACTIVE state.
5. When the timer reaches zero, the game state transitions to FINISHED.
6. An administrator enters the command `reset` to return to the LOBBY state.
