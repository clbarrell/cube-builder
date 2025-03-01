import React from 'react'
import * as THREE from 'three'

interface CubeProps {
  position: THREE.Vector3
}

const Cube: React.FC<CubeProps> = ({ position }) => {
  return (
    <mesh 
      position={[position.x, position.y, position.z]} 
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="green" />
    </mesh>
  )
}

export default Cube 