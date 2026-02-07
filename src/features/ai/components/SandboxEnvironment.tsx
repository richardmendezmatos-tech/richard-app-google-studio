
import React from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";

interface SandboxEnvironmentProps {
    files?: Record<string, string>;
    template?: "vite-react" | "react";
}

const SandboxEnvironment: React.FC<SandboxEnvironmentProps> = ({
    files = {},
    template = "vite-react"
}) => {
    return (
        <div className="w-full h-[600px] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <Sandpack
                template={template}
                theme={atomDark}
                customSetup={{
                    dependencies: {
                        "three": "^0.160.0",
                        "@react-three/fiber": "^8.15.16",
                        "@react-three/drei": "^9.102.6",
                        "lucide-react": "^0.300.0",
                        "clsx": "^2.1.0",
                        "tailwind-merge": "^2.2.1"
                    }
                }}
                files={{
                    "App.tsx": `import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows, Text } from "@react-three/drei";
import { Activity, Thermometer, Gauge, Zap } from 'lucide-react';

// --- MOCK IOT SERVICE ---
// Simulates MQTT subscriptions
const useVehicleTelemetry = () => {
    const [data, setData] = useState({ rpm: 800, temp: 90, battery: 100 });

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => ({
                rpm: Math.max(800, Math.min(8000, prev.rpm + (Math.random() - 0.5) * 500)),
                temp: Math.max(80, Math.min(120, prev.temp + (Math.random() - 0.5) * 2)),
                battery: Math.max(0, prev.battery - 0.05)
            }));
        }, 1000); // 1Hz update
        return () => clearInterval(interval);
    }, []);

    return data;
    return data;
};

// --- WHATSAPP ALERT SERVICE ---
// Simulates edge computing trigger
const useWhatsAppAlert = (telemetry) => {
    const [lastAlert, setLastAlert] = useState(0);

    useEffect(() => {
        if (telemetry.temp > 115 && Date.now() - lastAlert > 30000) { // Cooldown 30s
            console.log("CRITICAL TEMP DETECTED: Dispatching WhatsApp...");
            setLastAlert(Date.now());
            
            // Call the Vercel Function (Backend Proxy)
            fetch('/api/send-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: '17873682880', // Richard's Number
                    message: \`⚠️ *ALERTA CRÍTICA DE IOT* ⚠️\\n\\nLa unidad de prueba #404 reporta sobrecalentamiento.\\n\\n🌡️ Temp: \${telemetry.temp.toFixed(1)}°C\\n⚙️ RPM: \${telemetry.rpm.toFixed(0)}\\n\\nSe recomienda detener el motor inmediatamente.\`
                })
            }).then(res => res.json())
              .then(data => console.log("WhatsApp dispatched:", data))
              .catch(err => console.error("Alert failed:", err));
        }
    }, [telemetry.temp]);
};

function SmartEngine({ telemetry }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  // Visual Feedback based on Data
  const color = telemetry.temp > 110 ? "#ef4444" : (telemetry.temp > 100 ? "#f59e0b" : "#00aed9");
  const rotationSpeed = telemetry.rpm / 5000; 

  useFrame((state, delta) => {
    if(meshRef.current) {
        meshRef.current.rotation.x += delta * 0.2;
        meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh 
            ref={meshRef}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={hovered ? 1.1 : 1}
        >
            <octahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial 
                color={color} 
                roughness={0.2} 
                metalness={0.8} 
                emissive={color}
                emissiveIntensity={telemetry.rpm > 6000 ? 0.5 : 0.1}
            />
        </mesh>
        <Text position={[0, -2, 0]} fontSize={0.3} color="white">
            {telemetry.rpm.toFixed(0)} RPM
        </Text>
    </Float>
  );
}

export default function App() {
  const telemetry = useVehicleTelemetry();
  useWhatsAppAlert(telemetry); // Activate Monitor

  return (
    <div className="h-screen w-full bg-slate-950 text-white relative flex flex-col overflow-hidden">
        
        {/* HUD OVERLAY */}
        <div className="absolute top-0 left-0 p-6 z-10 w-full pointer-events-none">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Activity className="text-[#00aed9]" />
                        Digital Twin <span className="text-[#00aed9]">v0.1</span>
                    </h1>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                        CONNECTED: AWS_IOT_CORE_EU_WEST_1
                    </p>
                </div>
                
                {/* Telemetry Cards */}
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-slate-900/80 backdrop-blur border border-white/10 p-3 rounded-lg w-48 shadow-xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-400 font-bold uppercase">Engine Load</span>
                            <Gauge size={14} className="text-[#00aed9]" />
                        </div>
                        <div className="text-xl font-mono font-bold text-white">
                            {telemetry.rpm.toFixed(0)} <span className="text-xs text-slate-500">RPM</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00aed9] transition-all duration-300" style={{ width: \`\${(telemetry.rpm / 8000) * 100}%\` }} />
                        </div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur border border-white/10 p-3 rounded-lg w-48 shadow-xl">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-400 font-bold uppercase">Core Temp</span>
                            <Thermometer size={14} className={telemetry.temp > 100 ? "text-red-500" : "text-emerald-500"} />
                        </div>
                        <div className="text-xl font-mono font-bold text-white">
                            {telemetry.temp.toFixed(1)}° <span className="text-xs text-slate-500">C</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3D SCENE */}
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <color attach="background" args={['#0f172a']} />
            <fog attach="fog" args={['#0f172a', 5, 20]} />
            
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <SmartEngine telemetry={telemetry} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div> {/* Dummy Layout Fix */}

            <Environment preset="city" />
            <OrbitControls autoRotate autoRotateSpeed={0.5} />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
        </Canvas>
    </div>
  );
}`,
                    ...files
                }}
                options={{
                    showNavigator: true,
                    showTabs: true,
                    editorHeight: 600,
                    showLineNumbers: true,
                    externalResources: ["https://cdn.tailwindcss.com"]
                }}
            />
        </div>
    );
};

export default SandboxEnvironment;
