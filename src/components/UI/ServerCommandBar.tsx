import { useState, useRef, useEffect } from "react";
import { executeCommand } from "../../services/socketService";

const ServerCommandBar: React.FC = () => {
  const [command, setCommand] = useState("");
  const [commandResult, setCommandResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Prevent keyboard events from propagating when input is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocused) {
        // Stop propagation for movement keys and other game controls
        // when the input is focused
        const gameKeys = [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "Space",
          "ShiftLeft",
          "ShiftRight",
          "ControlLeft",
          "ControlRight",
        ];

        if (gameKeys.includes(e.code)) {
          e.stopPropagation();
        }

        // Handle Enter key to execute command
        if (e.code === "Enter" && command.trim()) {
          handleExecuteCommand();
          e.preventDefault();
        }
      }
    };

    // Add the event listener with capture phase to intercept events
    // before they reach other listeners
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isFocused, command]);

  // Clear command result after 3 seconds
  useEffect(() => {
    if (commandResult) {
      const timer = setTimeout(() => {
        setCommandResult(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [commandResult]);

  const handleExecuteCommand = async () => {
    if (!command.trim()) return;

    try {
      const result = await executeCommand(command.trim());
      setCommandResult(result.message);
      setCommand("");
    } catch (error) {
      setCommandResult(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 text-white py-2 px-3 rounded-md font-mono text-xs z-50 flex flex-col">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <span className="mr-1">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Enter command..."
            className="bg-white/40 border-none outline-none text-white rounded-sm p-1 w-32"
          />
        </div>
        <div>Debug Mode: ON (-)</div>
      </div>
      {commandResult && (
        <div className="mt-1 text-xs text-green-400">{commandResult}</div>
      )}
    </div>
  );
};

export default ServerCommandBar;
