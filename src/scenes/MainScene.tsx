import React from "react";
import FirstPersonControls from "../components/controls/FirstPersonControls";
import Floor from "../components/environment/Floor";
import Lighting from "../components/environment/Lighting";
import BasicShapes from "../components/objects/BasicShapes";
import Cubes from "../components/objects/Cubes";
import CubePlacementPreview from "../components/objects/CubePlacementPreview";
import PlayerVisualization from "../components/objects/PlayerVisualization";
import PlayerPositionSync from "../components/objects/PlayerPositionSync";

const MainScene: React.FC = () => {
  return (
    <mesh>
      <FirstPersonControls />
      <Floor />
      <Lighting />
      <BasicShapes />
      <Cubes />
      <CubePlacementPreview />
      <PlayerVisualization />
      <PlayerPositionSync />
    </mesh>
  );
};

export default MainScene;
