import React from "react";
import FirstPersonControls from "../components/controls/FirstPersonControls";
import Floor from "../components/environment/Floor";
import Lighting from "../components/environment/Lighting";
import BasicShapes from "../components/objects/BasicShapes";

const MainScene: React.FC = () => {
  return (
    <mesh>
      <FirstPersonControls />
      <Floor />
      <Lighting />
      <BasicShapes />
    </mesh>
  );
};

export default MainScene;
