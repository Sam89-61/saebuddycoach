/**
 * Hook personnalisé pour la détection de pose avec TensorFlow
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

/**
 * Hook pour initialiser et gérer le détecteur de pose
 * @returns {Object} { detector, isLoading, error }
 */
export const usePoseDetection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detector, setDetector] = useState(null);
    const detectorRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        const initializeDetector = async () => {
            try {
                setIsLoading(true);
                setError(null);

                await tf.ready();
                await tf.setBackend('webgl');
                
                const detectorConfig = {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
                    enableSmoothing: true,
                };
                
                const det = await poseDetection.createDetector(
                    poseDetection.SupportedModels.MoveNet,
                    detectorConfig
                );
                
                if (isMounted) {
                    detectorRef.current = det;
                    setDetector(det);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Erreur lors de l\'initialisation du détecteur:', err);
                if (isMounted) {
                    setError(err.message);
                    setIsLoading(false);
                }
            }
        };

        initializeDetector();

        return () => {
            isMounted = false;
            if (detectorRef.current) {
                detectorRef.current.dispose();
                detectorRef.current = null;
            }
        };
    }, []);

    return {
        detector,
        isLoading,
        error
    };
};

/**
 * Hook pour gérer la boucle de détection de pose
 * @param {Object} params - Paramètres
 * @param {Object} params.detector - Détecteur de pose
 * @param {React.RefObject} params.videoRef - Référence à l'élément vidéo
 * @param {React.RefObject} params.canvasRef - Référence au canvas
 * @param {Function} params.onPoseDetected - Callback appelé quand une pose est détectée
 * @param {boolean} params.isActive - Si la détection est active
 * @returns {Object} { startDetection, stopDetection }
 */
export const usePoseDetectionLoop = ({ 
    detector, 
    videoRef, 
    canvasRef, 
    onPoseDetected,
    isActive = true 
}) => {
    const animationRef = useRef(null);
    const isRunningRef = useRef(false);
    const detectorRef = useRef(detector);

    // Mettre à jour la ref du detector
    useEffect(() => {
        detectorRef.current = detector;
    }, [detector]);

    const stopDetection = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        isRunningRef.current = false;
    }, []);

    const detectPose = useCallback(async () => {
        if (!detectorRef.current || !videoRef.current || !canvasRef.current || !isRunningRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState === 4) {
            // Ajuster la taille du canvas à la vidéo
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            // Dessiner la vidéo
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Détecter les poses
            try {
                const poses = await detectorRef.current.estimatePoses(video);
                
                if (poses.length > 0 && onPoseDetected) {
                    onPoseDetected(poses[0], ctx);
                }
            } catch (err) {
                console.error('Erreur lors de la détection:', err);
            }
        }

        if (isRunningRef.current) {
            animationRef.current = requestAnimationFrame(detectPose);
        }
    }, [videoRef, canvasRef, onPoseDetected]);

    const startDetection = useCallback(() => {
        if (!isRunningRef.current && detectorRef.current && videoRef.current && canvasRef.current) {
            isRunningRef.current = true;
            detectPose();
        }
    }, [detectPose, videoRef, canvasRef]);

    useEffect(() => {
        if (isActive && detectorRef.current) {
            startDetection();
        } else {
            stopDetection();
        }

        return () => {
            stopDetection();
        };
    }, [isActive, startDetection, stopDetection]);

    return {
        startDetection,
        stopDetection
    };
};
