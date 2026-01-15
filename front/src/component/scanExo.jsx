import React, { useRef, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { usePoseDetection, usePoseDetectionLoop } from '../hooks/usePoseDetection';
import { useCamera } from '../hooks/useCamera';
import { useExerciseCounter } from '../hooks/useExerciseCounter';
import { drawKeypoints, drawSkeleton, drawText } from '../utils/poseUtils';
import { getAvailableExercises, getExerciseConfig } from '../detectors/exerciseDetectors';

function ScanExo() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [exerciseType, setExerciseType] = useState('pompe');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isLandscapeVideo, setIsLandscapeVideo] = useState(false);

    // Hooks
    const { detector, isLoading: isLoadingDetector, error: detectorError } = usePoseDetection();
    const camera = useCamera(videoRef, fileInputRef);
    const counter = useExerciseCounter(exerciseType);

    const toggleFullScreen = async () => {
        if (!isFullScreen) {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                }

                if (screen.orientation && screen.orientation.lock) {
                    const orientation = isLandscapeVideo ? 'landscape' : 'portrait';
                    screen.orientation.lock(orientation).catch(e => console.log(`Lock ${orientation} non supporté:`, e));
                }
                
                setIsFullScreen(true);
            } catch (err) {
                console.error("Erreur activation plein écran:", err);
            }
        } else {
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
                if (screen.orientation && screen.orientation.unlock) {
                    screen.orientation.unlock();
                }
                setIsFullScreen(false);
            } catch (err) {
                console.error("Erreur sortie plein écran:", err);
                setIsFullScreen(false);
            }
        }
    };

    // Style dynamique pour le plein écran
    const fullScreenContainerStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const fullScreenCanvasStyle = {
        maxHeight: '100vh',
        maxWidth: '100vw',
        objectFit: 'contain'
    };

    const handlePoseDetected = (pose, ctx) => {
        if (camera.videoSource === 'file' && videoRef.current && videoRef.current.paused && videoRef.current.currentTime === 0) {
            videoRef.current.play().catch(e => console.error("Erreur lecture auto:", e));
        }

        drawKeypoints(pose.keypoints, ctx);
        drawSkeleton(pose.keypoints, ctx);

        const detection = counter.processKeypoints(pose.keypoints);

        if (detection) {
            drawText(ctx, `Angle: ${Math.round(detection.angle)}°`, 10, 30, {
                font: '20px Arial',
                color: '#FFFFFF',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
            });

            if (detection.position) {
                drawText(
                    ctx,
                    `Position: ${detection.position === 'down' ? 'Bas' : 'Haut'}`,
                    10,
                    60,
                    {
                        font: '18px Arial',
                        color: detection.position === 'down' ? '#FFA500' : '#00FF00',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }
                );
            }

            if (detection.feedback) {
                const isWarning = detection.feedback.includes('Attention');
                drawText(
                    ctx,
                    detection.feedback,
                    10,
                    90,
                    {
                        font: 'bold 24px Arial',
                        color: '#FFFFFF',
                        backgroundColor: isWarning ? 'rgba(255, 0, 0, 0.7)' : 'rgba(76, 175, 80, 0.8)'
                    }
                );
            }
        }
    };

    usePoseDetectionLoop({
        detector,
        videoRef,
        canvasRef,
        onPoseDetected: handlePoseDetected,
        isActive: camera.isActive
    });

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !camera.isActive) return;

        const checkOrientation = () => {
            if (video.videoWidth && video.videoHeight) {
                const isLandscape = video.videoWidth > video.videoHeight;
                setIsLandscapeVideo(isLandscape);
            } else {
                setIsLandscapeVideo(false);
            }
        };

        checkOrientation();
        video.addEventListener('loadedmetadata', checkOrientation);
        video.addEventListener('resize', checkOrientation);

        return () => {
            video.removeEventListener('loadedmetadata', checkOrientation);
            video.removeEventListener('resize', checkOrientation);
        };
    }, [camera.isActive, camera.videoSource]);

    const handleExerciseChange = (e) => {
        const newExercise = e.target.value;
        setExerciseType(newExercise);
        counter.changeExercise(newExercise);
    };

    const currentExerciseConfig = getExerciseConfig(exerciseType);
    const availableExercises = getAvailableExercises();

    useEffect(() => {
        if (camera.isActive) counter.reset();
    }, [camera.isActive, counter.reset]);

    useEffect(() => {
        return () => camera.stop();
    }, []);

    const handleFullReset = () => {
        camera.stop();
        counter.reset();
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleReplay = () => {
        camera.replay();
        counter.reset();
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <Header />
            
            <main className="flex-1 flex flex-col items-center p-4 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Détection d'Exercices
                </h1>
                
                <div className="mb-6 space-y-2 text-center min-h-[24px]">
                    {isLoadingDetector && <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium animate-pulse">Chargement du modèle...</span>}
                    {detectorError && <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Erreur: {detectorError}</span>}
                    {camera.error && <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">{camera.error}</span>}
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-md w-full max-w-4xl mb-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="w-full md:w-1/3">
                            <select 
                                value={exerciseType} 
                                onChange={handleExerciseChange}
                                disabled={camera.isActive}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {availableExercises.map(exercise => (
                                    <option key={exercise.id} value={exercise.id}>
                                        {exercise.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 w-full md:w-2/3">
                                                        <button 
                                                            onClick={camera.startCamera} 
                                                            disabled={camera.isActive || isLoadingDetector}
                                                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-transform active:scale-95 shadow-sm flex-1 min-w-[120px] ${
                                                                camera.isActive ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                                                            }`}
                                                        >
                                                            Activer Caméra
                                                        </button>
                            
                                                        <button 
                                                            onClick={camera.openFileSelector} 
                                                            disabled={camera.isActive || isLoadingDetector}
                                                            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-transform active:scale-95 shadow-sm flex-1 min-w-[120px] ${
                                                                camera.isActive ? 'bg-gray-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
                                                            }`}
                                                        >
                                                            Choisir Fichier
                                                        </button>
                                                        
                                                        {camera.isEnded ? (
                                                            <button 
                                                                onClick={handleReplay}
                                                                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-sm transition-transform active:scale-95"
                                                            >
                                                                Rejouer
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={camera.stop}
                                                                disabled={!camera.isActive}
                                                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-transform active:scale-95 shadow-sm ${
                                                                    !camera.isActive ? 'hidden' : 'bg-red-500 hover:bg-red-600'
                                                                }`}
                                                            >
                                                                Arrêter
                                                            </button>
                                                        )}
                            
                                                        <button 
                                                            onClick={handleFullReset}
                                                            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow-sm transition-transform active:scale-95"
                                                            title="Réinitialiser"
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                            
                                            <div className="mb-6">
                                                <span className="text-4xl font-extrabold text-green-600 tracking-tight">
                                                    {currentExerciseConfig?.name || 'Exercices'}: {counter.count}
                                                </span>
                                            </div>
                            
                                            {camera.isActive && (
                                                <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${camera.videoSource === 'camera' ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></span>
                                                    Source: {camera.videoSource === 'camera' ? 'Direct' : 'Fichier'}
                                                </div>
                                            )}
                            
                                            <div 
                                                style={isFullScreen ? fullScreenContainerStyle : {}}
                                                className={!isFullScreen ? "relative w-full max-w-2xl mx-auto bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800" : ""}
                                            >
                                                <button 
                                                    onClick={toggleFullScreen}
                                                    className="absolute top-4 right-4 z-1 px-3 py-1 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors text-sm font-bold"
                                                    title={isFullScreen ? "Quitter plein écran" : "Plein écran"}
                                                >
                                                    {isFullScreen ? 'QUITTER' : 'PLEIN ÉCRAN'}
                                                </button>
                            
                                                {isFullScreen && (
                                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-green-500/30">
                                                        <span className="text-green-400 font-bold text-2xl">{counter.count}</span>
                                                    </div>
                                                )}
                            
                                                <video  
                                                    ref={videoRef} 
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="hidden h-full w-full object-fit"
                                                    
                                                />
                                                <canvas 
                                                    ref={canvasRef}
                                                    style={isFullScreen ? fullScreenCanvasStyle : { width: '100%', height: '100%', objectFit: 'contain' }}
                                                    className="block"
                                                />
                                                
                                                {!camera.isActive && !isLoadingDetector && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                                        <p className="text-lg">En attente du flux vidéo...</p>
                                                    </div>
                                                )}
                                            </div>
                {currentExerciseConfig && (
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-md w-full max-w-3xl border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-green-500">ℹ️</span> Instructions : {currentExerciseConfig.name}
                        </h3>
                        <ul className="space-y-3">
                            {currentExerciseConfig.instructions.map((instruction, index) => (
                                <li key={index} className="flex items-start gap-3 text-gray-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                    {instruction}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
                            <span>Bas &lt; {currentExerciseConfig.thresholds.down}°</span>
                            <span>Haut &gt; {currentExerciseConfig.thresholds.up}°</span>
                        </div>
                    </div>
                )}

                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="video/*"
                    onChange={camera.handleFileChange}
                    className="hidden"
                />
            </main>
            <Footer />
        </div>
    );
}

export default ScanExo;