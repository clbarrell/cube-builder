import React, { useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useGameStateStore, GamePhase } from "../../game/state/GameStateStore";
import { Color } from "three";

const TimerDisplay: React.FC = () => {
  const getFormattedTimeLeft = useGameStateStore(
    (state) => state.getFormattedTimeLeft
  );
  const gamePhase = useGameStateStore((state) => state.gamePhase);
  const timer = useGameStateStore((state) => state.timer);
  // Reference to the text element to update its rotation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textRef = useRef<any>(null);
  const [displayText, setDisplayText] = useState("");

  // Update the timer text every frame and make it face the camera
  useFrame(({ camera }) => {
    // Update display text based on game phase
    if (gamePhase === GamePhase.ACTIVE) {
      // Only show timer if there's an active countdown
      if (timer.endTime !== null) {
        setDisplayText(getFormattedTimeLeft());
      } else {
        setDisplayText("ACTIVE");
      }
    } else if (gamePhase === GamePhase.LOBBY) {
      setDisplayText("LOBBY");
    } else if (gamePhase === GamePhase.FINISHED) {
      setDisplayText("GAME FINISHED");
    }

    // Make the text look at the camera
    if (textRef.current) {
      textRef.current.lookAt(camera.position);
    }
  });

  // Color based on time left
  const getColor = () => {
    if (gamePhase === GamePhase.LOBBY) return new Color(0x3498db); // Blue
    if (gamePhase === GamePhase.FINISHED) return new Color(0xe74c3c); // Red

    // Only check timer colors if there's an active countdown
    if (timer.endTime !== null) {
      const timeText = getFormattedTimeLeft();
      const [minutes] = timeText.split(":").map(Number);

      if (minutes < 1) return new Color(0xe74c3c); // Red for < 1 minute
      if (minutes < 3) return new Color(0xf39c12); // Orange for < 3 minutes
      return new Color(0x2ecc71); // Green otherwise
    }

    return new Color(0x2ecc71); // Green for active game without timer
  };

  return (
    <group position={[0, 10, 0]}>
      <Text
        ref={textRef}
        position={[0, 0, 0]}
        fontSize={5}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#000000"
        // Remove rotation inheritance from parent
        rotation={[0, 0, 0]}
      >
        {displayText}
      </Text>
    </group>
  );
};

export default TimerDisplay;
