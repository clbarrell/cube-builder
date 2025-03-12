import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

// Station position mapping for camera movement
const stationPositions = {
  pilot: [0, 1.5, -3],
  navigation: [-3, 1.5, -2],
  weapons: [3, 1.5, -2],
  comms: [-4, 1.5, 1],
  radar: [4, 1.5, 1],
  bridge: [0, 1.5, 3],
};

// Station color themes
const stationColors = {
  pilot: "#00aaff",
  navigation: "#4287f5",
  weapons: "#ff3e3e",
  comms: "#ffcc00",
  radar: "#00ff88",
  bridge: "#aa44ff",
};

// Main App Component
function App() {
  const [currentStation, setCurrentStation] = useState("bridge");

  return (
    <div className="h-screen w-full">
      <Canvas
        shadows
        camera={{ position: [0, 1.5, 5], fov: 75 }}
        gl={{ alpha: false }}
        style={{ background: "black" }}
      >
        {/* Enhanced lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 8, 0]} intensity={0.5} castShadow />
        <spotLight
          position={[0, 10, 0]}
          intensity={0.8}
          castShadow
          penumbra={0.5}
          angle={Math.PI / 3}
          shadow-mapSize={[2048, 2048]}
        />

        {/* Main scene */}
        <SpaceshipBridge
          currentStation={currentStation}
          setCurrentStation={setCurrentStation}
        />

        {/* Camera controller with animation */}
        <CameraController currentStation={currentStation} />
      </Canvas>

      {/* Station UI overlay */}
      <StationUI currentStation={currentStation} />
    </div>
  );
}
// Camera controller component for smooth transitions
function CameraController({ currentStation }: { currentStation: string }) {
  const { camera } = useThree();
  const targetPositionRef = useRef([0, 1.5, 5]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevStationRef = useRef(currentStation);
  const controlsRef = useRef<any>(null);

  // Get the current station position for the target
  const stationPosition =
    stationPositions[currentStation as keyof typeof stationPositions];

  // Update target position when station changes
  useEffect(() => {
    // Only trigger transition when station actually changes
    if (prevStationRef.current !== currentStation) {
      const position =
        stationPositions[currentStation as keyof typeof stationPositions];
      if (position) {
        setIsTransitioning(true);
        targetPositionRef.current = [
          position[0],
          position[1],
          position[2] + 4, // Add offset for better view
        ];

        // Update the OrbitControls target to look at the station
        if (controlsRef.current) {
          controlsRef.current.target.set(position[0], position[1], position[2]);
        }

        // Reset transitioning state after animation completes
        const timer = setTimeout(() => {
          setIsTransitioning(false);
        }, 1000);

        prevStationRef.current = currentStation;
        return () => clearTimeout(timer);
      }
    }
  }, [currentStation]);

  // Animate camera movement only during transitions
  useFrame(() => {
    if (camera && isTransitioning) {
      // Smoothly interpolate camera position
      camera.position.x = THREE.MathUtils.lerp(
        camera.position.x,
        targetPositionRef.current[0],
        0.05
      );
      camera.position.y = THREE.MathUtils.lerp(
        camera.position.y,
        targetPositionRef.current[1],
        0.05
      );
      camera.position.z = THREE.MathUtils.lerp(
        camera.position.z,
        targetPositionRef.current[2],
        0.05
      );

      const lookAtPosition = [
        ...stationPositions[currentStation as keyof typeof stationPositions],
      ];
      // Look at the station during transition
      camera.lookAt(
        new THREE.Vector3(
          lookAtPosition[0],
          lookAtPosition[1],
          lookAtPosition[2]
        )
      );
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={Math.PI / 6}
      maxDistance={10}
      minDistance={2}
      enableRotate={!isTransitioning}
      target={
        new THREE.Vector3(
          stationPosition[0],
          stationPosition[1],
          stationPosition[2]
        )
      }
    />
  );
}

// Spaceship Bridge Environment
function SpaceshipBridge({
  currentStation,
  setCurrentStation,
}: {
  currentStation: string;
  setCurrentStation: (station: string) => void;
}) {
  // Ship interior - circular room with stations
  return (
    <group>
      {/* Floor with improved material */}
      <mesh rotation={[0, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[10, 10, 0.2, 36]} />
        <meshStandardMaterial color="#d7d7d7" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Ceiling with improved material */}
      <mesh rotation={[0, 0, 0]} position={[0, 5, 0]}>
        <cylinderGeometry args={[10, 10, 0.2, 36]} />
        <meshStandardMaterial
          color="##d7d7d7"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Curved walls with improved material */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[10, 10, 5, 36, 1, true]} />
        <meshStandardMaterial
          color="#e0e0e0"
          side={THREE.BackSide}
          metalness={0.3}
          roughness={0.7}
          opacity={0.3}
          transparent
        />
      </mesh>

      {/* Front window with glow effect */}
      <group position={[0, 2, -9]}>
        {/* <mesh>
          <boxGeometry args={[16, 4, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[15, 3, 0.1]} />
          <meshStandardMaterial
            color="#a0d8ef"
            transparent
            opacity={0.3} // More transparent to see stars better
            emissive="#4080ff"
            emissiveIntensity={0.2}
          />
        </mesh> */}
        <pointLight position={[0, 0, 2]} intensity={0.2} color="#4080ff" />{" "}
        {/* Add light to illuminate stars */}
        {/* <Stars /> */}
      </group>
      <Stars />

      {/* Stations */}
      <StationConsole
        position={[0, 0, -5]}
        name="pilot"
        label="Pilot Station"
        currentStation={currentStation}
        setCurrentStation={setCurrentStation}
      />
      <StationConsole
        position={[-4, 0, -4]}
        name="navigation"
        label="Navigation"
        currentStation={currentStation}
        setCurrentStation={setCurrentStation}
      />
      <StationConsole
        position={[4, 0, -4]}
        name="weapons"
        label="Weapons"
        currentStation={currentStation}
        setCurrentStation={setCurrentStation}
      />
      <StationConsole
        position={[-6, 0, 0]}
        name="comms"
        label="Communications"
        currentStation={currentStation}
        setCurrentStation={setCurrentStation}
      />
      <StationConsole
        position={[6, 0, 0]}
        name="radar"
        label="Radar Station"
        currentStation={currentStation}
        setCurrentStation={setCurrentStation}
      />
      <StationConsole
        position={[0, 0, 5]}
        name="bridge"
        label="Captain's Chair"
        currentStation={currentStation}
        setCurrentStation={setCurrentStation}
      />
    </group>
  );
}

// Define types for StationConsole props
interface StationConsoleProps {
  position: [number, number, number];
  name: string;
  label: string;
  currentStation: string;
  setCurrentStation: (station: string) => void;
}

// Individual station console with improved visuals
function StationConsole({
  position,
  name,
  label,
  currentStation,
  setCurrentStation,
}: StationConsoleProps) {
  const isActive = name === currentStation;
  const stationColor = stationColors[name as keyof typeof stationColors];

  // Pulsing effect for active station
  const screenRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (screenRef.current && isActive) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      if (material && material.emissive) {
        material.emissiveIntensity =
          0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      }
    }
  });

  return (
    <group position={position}>
      {/* Console desk with improved material */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.2, 1.2]} />
        <meshStandardMaterial color="#fafafa" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Console screen tilt with glow effect */}
      <mesh
        ref={screenRef}
        position={[0, 0.8, -0.3]}
        rotation={[-Math.PI / 6, 0, 0]}
        castShadow
      >
        <boxGeometry args={[1.8, 1, 0.1]} />
        <meshStandardMaterial
          color={isActive ? stationColor : "#999"}
          emissive={isActive ? stationColor : "#000"}
          emissiveIntensity={isActive ? 0.5 : 0}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>

      {/* Chair with improved material */}
      <mesh position={[0, 0.4, 0.8]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 16]} />
        <meshStandardMaterial
          color={isActive ? "#fafafa" : "#f4f4f4"}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Clickable area with improved visibility */}
      <mesh
        position={[0, 1.4, 0.8]}
        onClick={() => setCurrentStation(name)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          e.object.scale.set(1.05, 1.05, 1.05);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "auto";
          e.object.scale.set(1, 1, 1);
        }}
      >
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? stationColor : "#e9e9e9"}
          emissive={isActive ? stationColor : "#000"}
          emissiveIntensity={isActive ? 0.7 : 0}
        />
        <Html distanceFactor={10}>
          <div
            className={`bg-black bg-opacity-80 text-white p-2 rounded whitespace-nowrap border ${
              isActive ? getColorClass(name) : "border-transparent"
            }`}
          >
            {label}
          </div>
        </Html>
      </mesh>

      {/* Light indicator for active station */}
      {isActive && (
        <pointLight
          position={[0, 1.5, 0]}
          intensity={0.7}
          color={stationColor}
          distance={3}
        />
      )}
    </group>
  );
}

// Helper function to get Tailwind color class based on station name
function getColorClass(stationName: string): string {
  switch (stationName) {
    case "pilot":
      return "border-blue-400";
    case "navigation":
      return "border-blue-500";
    case "weapons":
      return "border-red-500";
    case "comms":
      return "border-yellow-400";
    case "radar":
      return "border-green-400";
    case "bridge":
      return "border-purple-400";
    default:
      return "border-gray-400";
  }
}

// Stars for outside the window with improved visibility
function Stars() {
  const meshRefs = useRef<THREE.Points[]>([]);

  useEffect(() => {
    // Create multiple star fields to ensure visibility from all angles
    const createStarField = (index: number) => {
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 1.0,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        map: createStarTexture(),
      });

      // Different position ranges for each star field
      const zRange =
        index === 0
          ? [-80, -8] // far field
          : index === 1
          ? [-20, 80] // forward field
          : [-40, 40]; // side fields

      const starPositions: number[] = [];
      const starCount = 1000; // Fewer stars per field but more fields

      for (let i = 0; i < starCount; i++) {
        // Distribute stars in a sphere around the camera
        const radius = 100;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        starPositions.push(x, y, z);
      }

      starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starPositions, 3)
      );

      if (meshRefs.current[index]) {
        meshRefs.current[index].geometry = starGeometry;
        meshRefs.current[index].material = starMaterial;
      }
    };

    // Create multiple star fields (5 is a good number for full coverage)
    for (let i = 0; i < 5; i++) {
      createStarField(i);
    }
  }, []);

  // Create a circular texture for stars
  function createStarTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");

    if (context) {
      // Draw a radial gradient
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.5, "rgba(240, 240, 255, 0.5)");
      gradient.addColorStop(1, "rgba(220, 220, 255, 0)");

      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Add a subtle animation to the stars
  useFrame(({ clock }) => {
    meshRefs.current.forEach((mesh) => {
      if (mesh) {
        mesh.rotation.y = clock.getElapsedTime() * 0.01;
      }
    });
  });

  // Create multiple star fields positioned in different directions
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => (
        <points
          key={i}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
          frustumCulled={false}
          position={[
            i === 1 ? 50 : i === 2 ? -50 : 0, // x position
            i === 3 ? 50 : i === 4 ? -50 : 0, // y position
            0,
          ]}
        />
      ))}
    </group>
  );
}

// UI overlays for each station
function StationUI({ currentStation }: { currentStation: string }) {
  switch (currentStation) {
    case "pilot":
      return <PilotUI />;
    case "navigation":
      return <NavigationUI />;
    case "weapons":
      return <WeaponsUI />;
    case "comms":
      return <CommsUI />;
    case "radar":
      return <RadarUI />;
    case "bridge":
      return <BridgeUI />;
    default:
      return null;
  }
}

// Individual station UIs with improved colors
function PilotUI() {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded text-blue-300 border border-blue-500 shadow-lg shadow-blue-500/20">
      <h2 className="text-xl mb-2 font-bold text-blue-400">Pilot Controls</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg">Speed</h3>
          <input type="range" className="w-full accent-blue-500" />
        </div>
        <div>
          <h3 className="text-lg">Direction</h3>
          <div className="flex space-x-2 mt-2">
            <button className="bg-blue-900 hover:bg-blue-800 p-2 rounded">
              ⬅️
            </button>
            <button className="bg-blue-900 hover:bg-blue-800 p-2 rounded">
              ⬆️
            </button>
            <button className="bg-blue-900 hover:bg-blue-800 p-2 rounded">
              ⬇️
            </button>
            <button className="bg-blue-900 hover:bg-blue-800 p-2 rounded">
              ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationUI() {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded text-blue-300 border border-blue-600 shadow-lg shadow-blue-600/20">
      <h2 className="text-xl mb-2 font-bold text-blue-500">
        Navigation Controls
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg">Coordinates</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              className="bg-blue-900 border border-blue-700 p-1 rounded text-blue-200"
              placeholder="X"
            />
            <input
              type="text"
              className="bg-blue-900 border border-blue-700 p-1 rounded text-blue-200"
              placeholder="Y"
            />
            <input
              type="text"
              className="bg-blue-900 border border-blue-700 p-1 rounded text-blue-200"
              placeholder="Z"
            />
          </div>
        </div>
        <div>
          <h3 className="text-lg">Star Map</h3>
          <div className="bg-blue-900 border border-blue-700 h-24 rounded flex items-center justify-center text-blue-200">
            [Star Map Display]
          </div>
        </div>
      </div>
    </div>
  );
}

function WeaponsUI() {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded text-red-300 border border-red-600 shadow-lg shadow-red-500/20">
      <h2 className="text-xl mb-2 font-bold text-red-400">Weapons Systems</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg">Weapon Selection</h3>
          <select className="bg-red-900 border border-red-700 p-1 rounded w-full text-red-200">
            <option>Photon Torpedoes</option>
            <option>Laser Cannons</option>
            <option>Plasma Burst</option>
          </select>
        </div>
        <div>
          <h3 className="text-lg">Targeting</h3>
          <div className="bg-red-900 border border-red-700 h-24 rounded flex items-center justify-center text-red-200">
            [Targeting System]
          </div>
          <button className="bg-red-700 hover:bg-red-600 p-2 rounded mt-2 w-full">
            Fire
          </button>
        </div>
      </div>
    </div>
  );
}

function CommsUI() {
  const [messages, setMessages] = useState<
    Array<{ sender: string; message: string }>
  >([
    {
      sender: "Station Alpha",
      message: "Greetings, Starship! How can we assist?",
    },
    { sender: "You", message: "Requesting permission to dock." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, { sender: "You", message: newMessage }]);
    setNewMessage("");

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "Station Alpha",
          message: "Message received. Standing by for further communications.",
        },
      ]);
    }, 2000);
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded text-yellow-300 h-64 flex flex-col border border-yellow-600 shadow-lg shadow-yellow-500/20">
      <h2 className="text-xl mb-2 font-bold text-yellow-400">Communications</h2>
      <div className="flex-1 overflow-y-auto bg-yellow-900/30 border border-yellow-700 p-2 rounded mb-2">
        {messages.map((msg, index) => (
          <div key={index} className="mb-1">
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 bg-yellow-900/50 border border-yellow-700 p-2 rounded-l text-yellow-200"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-yellow-700 hover:bg-yellow-600 p-2 rounded-r"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

function RadarUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let angle = 0;

    const drawRadar = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 10;

      // Clear canvas with better alpha for persistence
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, width, height);

      // Draw radar circles with brighter color
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 1.5;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius * i) / 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw crosshairs with brighter color
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Draw radar sweep with better glow
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + 0.1);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = "#00ff88";
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Draw some random blips with better visibility
      const blips = [
        { dist: 0.5, ang: Math.PI * 0.3, size: 5 },
        { dist: 0.8, ang: Math.PI * 1.7, size: 4 },
        { dist: 0.2, ang: Math.PI * 0.9, size: 6 },
      ];

      blips.forEach((blip) => {
        const blipX = centerX + Math.cos(blip.ang) * radius * blip.dist;
        const blipY = centerY + Math.sin(blip.ang) * radius * blip.dist;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          blipX,
          blipY,
          0,
          blipX,
          blipY,
          blip.size * 2
        );
        gradient.addColorStop(0, "#00ff88");
        gradient.addColorStop(1, "rgba(0, 255, 136, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blipX, blipY, blip.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(blipX, blipY, blip.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update angle
      angle += 0.02;
      if (angle > Math.PI * 2) angle = 0;

      animationFrameId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded text-green-300 border border-green-600 shadow-lg shadow-green-500/20">
      <h2 className="text-xl mb-2 font-bold text-green-400">Radar System</h2>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="bg-black rounded mx-auto border border-green-800"
      />
    </div>
  );
}

function BridgeUI() {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded text-purple-300 border border-purple-600 shadow-lg shadow-purple-500/20">
      <h2 className="text-xl mb-2 font-bold text-purple-400">
        Captain's Bridge
      </h2>
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-purple-900/50 border border-purple-700 p-2 rounded">
          <h3 className="text-sm font-semibold">Pilot</h3>
          <div className="text-xs">Status: Active</div>
        </div>
        <div className="bg-purple-900/50 border border-purple-700 p-2 rounded">
          <h3 className="text-sm font-semibold">Navigation</h3>
          <div className="text-xs">Status: Active</div>
        </div>
        <div className="bg-purple-900/50 border border-purple-700 p-2 rounded">
          <h3 className="text-sm font-semibold">Weapons</h3>
          <div className="text-xs">Status: Standby</div>
        </div>
        <div className="bg-purple-900/50 border border-purple-700 p-2 rounded">
          <h3 className="text-sm font-semibold">Comms</h3>
          <div className="text-xs">Status: Active</div>
        </div>
        <div className="bg-purple-900/50 border border-purple-700 p-2 rounded">
          <h3 className="text-sm font-semibold">Radar</h3>
          <div className="text-xs">Status: Active</div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Mission Status</h3>
        <div className="bg-purple-900/30 border border-purple-700 p-2 rounded">
          <p>Current mission: Exploring Sector 7-G</p>
          <p>
            Ship health: <span className="text-green-400">98%</span>
          </p>
          <p>
            Energy reserves: <span className="text-blue-400">85%</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
