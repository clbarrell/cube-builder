import React, { useState, useEffect } from "react";
import { usePlayerStore } from "../../game/state/PlayerState";

interface PlayerNameInputProps {
  onNameSubmit: (name: string) => void;
}

const PlayerNameInput: React.FC<PlayerNameInputProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const localPlayerName = usePlayerStore((state) => state.localPlayerName);

  // Hide modal if player name is already set
  useEffect(() => {
    if (localPlayerName) {
      setIsVisible(false);
    }
  }, [localPlayerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim()) {
      onNameSubmit(name.trim());
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">
          Welcome to Cube World
        </h2>
        <p className="text-gray-300 mb-6">
          Enter your name to begin
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="playerName" className="sr-only text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
              autoFocus
              maxLength={20}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className={`w-full py-2 px-4 rounded font-medium flex items-center justify-center gap-4 ${
              name.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Join Game{" "}
            <code className="text-xs p-1 bg-gray-700 rounded">Enter</code>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameInput;
