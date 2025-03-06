import React from "react";
import { useGameStateStore, GamePhase } from "../../game/state/GameStateStore";

const GameStateUI: React.FC = () => {
  const gamePhase = useGameStateStore((state) => state.gamePhase);
  const getFormattedTimeLeft = useGameStateStore(
    (state) => state.getFormattedTimeLeft
  );
  const timer = useGameStateStore((state) => state.timer);

  const getStateMessage = () => {
    switch (gamePhase) {
      case GamePhase.LOBBY:
        return "Waiting in lobby. Use 'startgame' or 'timer <minutes>' to begin.";
      case GamePhase.ACTIVE:
        if (timer.endTime !== null) {
          return `Game in progress! Time remaining: ${getFormattedTimeLeft()}`;
        } else {
          return "Game in progress! No time limit.";
        }
      case GamePhase.FINISHED:
        return "Game over! Use 'reset' to return to lobby.";
      default:
        return "";
    }
  };

  const getStateColor = () => {
    switch (gamePhase) {
      case GamePhase.LOBBY:
        return "text-blue-400";
      case GamePhase.ACTIVE:
        return "text-green-400";
      case GamePhase.FINISHED:
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-black/70 text-white py-2 px-4 rounded-md font-mono text-sm z-50 flex flex-row gap-3 items-center justify-center">
      <div className={`font-bold ${getStateColor()}`}>{gamePhase}</div>
      <div className="text-xs mt-1">{getStateMessage()}</div>
    </div>
  );
};

export default GameStateUI;
