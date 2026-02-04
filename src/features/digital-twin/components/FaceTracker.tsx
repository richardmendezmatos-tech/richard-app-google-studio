import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";
// Direct import to bypass potential circular dependencies or barrel file issues in 'index.js'
import { FaceSolver } from '@/vendor/kalidokit/FaceSolver';

interface FaceTrackerProps {
    onFaceUpdate: (rig: any) => void;
    showDebug?: boolean;
}

const FaceTracker = forwardRef(({ onFaceUpdate }: FaceTrackerProps, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastVideoTime = useRef(-1);
    const requestRef = useRef<number>();
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);

    // Store callback in ref to avoid re-initializing effect when prop changes
    const onUpdateRef = useRef(onFaceUpdate);

    useEffect(() => {
        onUpdateRef.current = onFaceUpdate;
    }, [onFaceUpdate]);

    useImperativeHandle(ref, () => ({}));

    useEffect(() => {
        let mounted = true;

        const setup = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
                );

                if (!mounted) return;

                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });

                faceLandmarkerRef.current = landmarker;
                startWebcam();
            } catch (error) {
                console.error("Failed to initialize FaceTracker:", error);
            }
        };

        const startWebcam = async () => {
            if (!videoRef.current || !mounted) return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.addEventListener("loadeddata", predictWebcam);
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        const predictWebcam = () => {
            if (!mounted) return;
            // Robust checks before processing
            if (!faceLandmarkerRef.current || !videoRef.current || !FaceSolver) {
                requestRef.current = requestAnimationFrame(predictWebcam);
                return;
            }

            const startTimeMs = performance.now();
            if (lastVideoTime.current !== videoRef.current.currentTime) {
                lastVideoTime.current = videoRef.current.currentTime;

                try {
                    const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

                    if (results?.faceLandmarks?.length > 0 && results.faceBlendshapes) {
                        const faceRig = FaceSolver.solve(
                            results.faceLandmarks[0],
                            { runtime: "mediapipe", video: videoRef.current }
                        );

                        if (onUpdateRef.current && faceRig) {
                            onUpdateRef.current(faceRig);
                        }
                    }
                } catch (e) {
                    // console.warn("Face tracking error:", e);
                }
            }
            requestRef.current = requestAnimationFrame(predictWebcam);
        };

        setup();

        return () => {
            mounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);

            const videoElement = videoRef.current;
            if (videoElement) {
                videoElement.removeEventListener("loadeddata", predictWebcam);
                if (videoElement.srcObject) {
                    const stream = videoElement.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                }
            }

            // Clean up landmarker if method exists (prevent WebGL context leaks)
            if (faceLandmarkerRef.current && typeof faceLandmarkerRef.current.close === 'function') {
                faceLandmarkerRef.current.close();
            }
        };
    }, []); // Empty dependency array ensures initialization runs only once

    return (
        <div className="absolute top-4 left-4 z-50 opacity-0 pointer-events-none">
            <video
                ref={videoRef}
                className="w-48 rounded-lg"
                autoPlay
                playsInline
                muted
                style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
});

export default FaceTracker;
