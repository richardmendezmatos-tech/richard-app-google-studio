import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, OrbitControls, Html } from "@react-three/drei";
import { Euler, MathUtils } from 'three';

interface SceneProps {
    faceRig: any;
    aiState?: {
        isSpeaking: boolean;
        volume: number; // 0 to 1
    };
    modelUrl?: string | null;
}

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode, fallback: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.warn("AvatarScene 3D Load Error:", error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// --- HOLOGRAM FALLBACK ---
const HologramFallback = () => {
    const [videoTexture, setVideoTexture] = useState<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = document.createElement('video');
        video.src = '/Avatar.glb.mp4';
        video.crossOrigin = 'Anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.play().then(() => {
            setVideoTexture(video);
        }).catch(e => {
            console.warn("Video texture failed to load:", e);
        });
    }, []);

    if (videoTexture) {
        return (
            <mesh position={[0, 0, 0]} scale={[1.5, 2.5, 1]}>
                <planeGeometry />
                <meshBasicMaterial
                    transparent
                    opacity={0.9}
                    side={2}
                >
                    <videoTexture attach="map" args={[videoTexture]} />
                </meshBasicMaterial>
                <Html position={[0, 1.4, 0]} center>
                    <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded border border-cyan-500/30 text-[10px] uppercase font-bold tracking-widest backdrop-blur-sm animate-pulse">
                        Hologram Mode Active
                    </div>
                </Html>
            </mesh>
        );
    }

    return (
        <group>
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#00aed9" wireframe />
            </mesh>
            <Html position={[0, 1.2, 0]} center>
                <div className="bg-black/90 text-cyan-400 p-3 rounded-xl border border-cyan-500/50 text-xs text-center font-mono">
                    <div className="font-bold mb-1">ASSET MISSING</div>
                    <div className="opacity-70">/mi_gemelo.glb</div>
                </div>
            </Html>
        </group>
    );
};

// --- MODEL COMPONENT ---
// --- MODEL COMPONENT ---
const Model = ({ faceRig, aiState, modelUrl }: SceneProps) => {
    // Determine which URL to load
    const url = modelUrl || "/mi_gemelo.glb";

    // safe load
    const { scene } = useGLTF(url, true) as any;

    const headBoneRef = useRef<any>(null);
    const neckBoneRef = useRef<any>(null);

    useEffect(() => {
        if (scene) {
            scene.traverse((o: any) => {
                if (o.isBone) {
                    if (o.name === 'Head') headBoneRef.current = o;
                    if (o.name === 'Neck') neckBoneRef.current = o;
                }
            });
        }
    }, [scene]);

    useFrame((state) => {
        if (!scene) return;

        const damp = 0.5;
        const time = state.clock.getElapsedTime();

        let targetHeadRot = new Euler(0, 0, 0);
        let targetMouthOpen = 0;
        let targetSmile = 0;
        let targetBlinkLeft = 0;
        let targetBlinkRight = 0;

        if (aiState?.isSpeaking) {
            targetHeadRot.x = Math.sin(time * 0.5) * 0.05;
            targetHeadRot.y = Math.sin(time * 0.3) * 0.1;
            targetHeadRot.z = Math.sin(time * 0.2) * 0.02;
            const noise = Math.random() * 0.2;
            targetMouthOpen = MathUtils.lerp(0, 0.6, aiState.volume) + (aiState.volume > 0.1 ? noise : 0);
            targetSmile = 0.2;
            const blink = Math.random() > 0.99 ? 1 : 0;
            targetBlinkLeft = blink;
            targetBlinkRight = blink;
        } else if (faceRig && faceRig.head && faceRig.mouth?.shape && faceRig.eye) {
            targetHeadRot = new Euler(
                (faceRig.head.x || 0) * -1,
                (faceRig.head.y || 0) * -1,
                (faceRig.head.z || 0),
                "XYZ"
            );
            targetMouthOpen = faceRig.mouth.shape.A || 0;
            targetSmile = (faceRig.mouth.shape.I || 0) * 0.5;
            targetBlinkLeft = 1 - (faceRig.eye.l || 0);
            targetBlinkRight = 1 - (faceRig.eye.r || 0);
        }

        if (headBoneRef.current) {
            const currentHeadRot = headBoneRef.current.rotation;
            headBoneRef.current.rotation.x = MathUtils.lerp(currentHeadRot.x, targetHeadRot.x, damp);
            headBoneRef.current.rotation.y = MathUtils.lerp(currentHeadRot.y, targetHeadRot.y, damp);
            headBoneRef.current.rotation.z = MathUtils.lerp(currentHeadRot.z, targetHeadRot.z, damp);
        }

        if (neckBoneRef.current) {
            neckBoneRef.current.rotation.x = MathUtils.lerp(neckBoneRef.current.rotation.x, targetHeadRot.x * 0.5, damp);
            neckBoneRef.current.rotation.y = MathUtils.lerp(neckBoneRef.current.rotation.y, targetHeadRot.y * 0.5, damp);
        }

        scene.traverse((child: any) => {
            if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
                const setMorph = (name: string, value: number) => {
                    const idx = child.morphTargetDictionary[name];
                    if (idx !== undefined && child.morphTargetInfluences[idx] !== undefined) {
                        child.morphTargetInfluences[idx] = MathUtils.lerp(child.morphTargetInfluences[idx], value, damp);
                    }
                };
                setMorph('eyeBlinkLeft', targetBlinkLeft);
                setMorph('eyeBlinkRight', targetBlinkRight);
                setMorph('jawOpen', targetMouthOpen);
                setMorph('mouthSmile', targetSmile);

                if (aiState?.isSpeaking) {
                    setMorph('browInnerUp', 0);
                } else if (faceRig) {
                    setMorph('browInnerUp', faceRig.brow);
                }
            }
        });
    });

    return <primitive object={scene} position={[0, -1.5, 0]} scale={1.8} />;
};

const AvatarScene: React.FC<SceneProps> = ({ faceRig, aiState, modelUrl }) => {
    return (
        <div className="w-full h-full absolute inset-0 bg-slate-900">
            <Canvas camera={{ position: [0, 0, 1.5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="city" />
                <OrbitControls enableZoom={true} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.8} />

                {/* If we have a custom URL or if we want to try the default one again */}
                <ErrorBoundary fallback={<HologramFallback />}>
                    <React.Suspense fallback={<HologramFallback />}>
                        {/* Pass URL or fall back to known asset */}
                        <Model faceRig={faceRig} aiState={aiState} modelUrl={modelUrl} />
                    </React.Suspense>
                </ErrorBoundary>
            </Canvas>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
                Three.js + MediaPipe + Avaturn
            </div>
        </div>
    );
};

export default AvatarScene;
