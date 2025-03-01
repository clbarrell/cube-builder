import React from "react";

const BasicShapes: React.FC = () => {
  return (
    <>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      <mesh position={[-3, 1, 3]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>

      <mesh position={[3, 1, -3]} castShadow>
        <coneGeometry args={[1, 2, 16]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
    </>
  );
};

export default BasicShapes;
