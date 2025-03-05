import React from "react";
import FirstPersonControls from "../components/controls/FirstPersonControls";
import Floor from "../components/environment/Floor";
import Lighting from "../components/environment/Lighting";
import ProceduralSky from "../components/environment/ProceduralSky";
import BasicShapes from "../components/objects/BasicShapes";
import Cubes from "../components/objects/Cubes";
import CubePlacementPreview from "../components/objects/CubePlacementPreview";
import PlayerVisualization from "../components/objects/PlayerVisualization";
import PlayerPositionSync from "../components/objects/PlayerPositionSync";

const MainScene: React.FC = () => {
  // Use the same sun position as in the directional light
  const sunPosition: [number, number, number] = [10, 20, 15];

  return (
    <mesh>
      <FirstPersonControls />
      <ProceduralSky sunPosition={sunPosition} rayleigh={0.3} />
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
