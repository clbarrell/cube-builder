import React from "react";
import { Canvas } from "@react-three/fiber";
import MainScene from "./MainScene";
import ControlsHelp from "../components/UI/ControlsHelp";
import Crosshair from "../components/UI/Crosshair";
import CubeCounter from "../components/UI/CubeCounter";

const FirstPersonScene: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ fov: 75 }}>
        <MainScene />
      </Canvas>
      <ControlsHelp />
      <Crosshair />
      <CubeCounter />
    </div>
  );
};

export default FirstPersonScene;
