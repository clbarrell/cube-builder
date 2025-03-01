import React from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "./MainScene";
import ControlsHelp from "../components/UI/ControlsHelp";

const FirstPersonScene: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <Canvas shadows camera={{ fov: 75 }}>
        <MainScene />
      </Canvas>
      <ControlsHelp />
    </div>
  );
};

export default FirstPersonScene;
