import React from "react";
import { useGameStateStore, GamePhase } from "../../game/state/GameStateStore";

const GameStateUI: React.FC = () => {
  const gamePhase = useGameStateStore((state) => state.gamePhase);

  const getStateMessage = () => {
    switch (gamePhase) {
      case GamePhase.LOBBY:
        return "Waiting in lobby.";
      case GamePhase.ACTIVE:
        return "";
      case GamePhase.FINISHED:
        return "Game finished!";
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
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-black/70 text-white py-2 px-4 rounded-t-md font-mono text-xs z-50 flex flex-row gap-3 items-center justify-center ${
        gamePhase === GamePhase.ACTIVE && "hidden"
      }`}
    >
      <div className={`font-bold ${getStateColor()}`}>{gamePhase}</div>
      <div>{getStateMessage()}</div>
    </div>
  );
};

export default GameStateUI;
