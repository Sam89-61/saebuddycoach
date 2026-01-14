/**
 * Hook personnalisé pour gérer la caméra et les fichiers vidéo
 */

import { useRef, useState, useCallback } from 'react';

/**
 * Hook pour gérer la caméra et les fichiers vidéo
 * @param {React.RefObject} videoRef - Référence à l'élément vidéo
 * @param {React.RefObject} fileInputRef - Référence à l'input file (optionnel)
 * @returns {Object} État et méthodes de contrôle
 */
export const useCamera = (videoRef, fileInputRef = null) => {
    const [isActive, setIsActive] = useState(false);
    const [videoSource, setVideoSource] = useState(null); // 'camera' ou 'file'
    const [error, setError] = useState(null);
    const [isEnded, setIsEnded] = useState(false);
    const currentStreamRef = useRef(null);

    /**
     * Arrête la caméra ou la vidéo en cours
     */
    const stop = useCallback(() => {
        if (!videoRef.current) return;

        // Arrêter les tracks de la caméra si elle est active
        if (currentStreamRef.current) {
            const tracks = currentStreamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            currentStreamRef.current = null;
        }

        // Arrêter la vidéo
        if (videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
        }

        // Nettoyer l'URL de la vidéo fichier
        if (videoRef.current.src && videoSource === 'file') {
            URL.revokeObjectURL(videoRef.current.src);
        }

        videoRef.current.pause();
        // Utiliser removeAttribute au lieu de '' pour éviter que le mobile ne charge la page courante comme vidéo
        videoRef.current.removeAttribute('src');
        videoRef.current.load(); // Force le navigateur à comprendre qu'il n'y a plus de media
        
        setIsActive(false);
        setIsEnded(false);
        setVideoSource(null);
        setError(null);
    }, [videoRef, videoSource]);

    /**
     * Relance la vidéo depuis le début
     */
    const replay = useCallback(() => {
        if (videoRef.current && videoSource === 'file') {
            videoRef.current.currentTime = 0;
            setIsEnded(false);
            videoRef.current.play()
                .catch(err => {
                    console.error('Erreur lors de la relecture:', err);
                    setError('Impossible de relancer la vidéo');
                });
        }
    }, [videoRef, videoSource]);

    /**
     * Démarre la caméra
     */
    const startCamera = useCallback(async () => {
        try {
            setError(null);
            stop(); // Arrêter toute source précédente

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            if (videoRef.current) {
                currentStreamRef.current = stream;
                videoRef.current.srcObject = stream;
                videoRef.current.loop = false;
                
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play()
                        .then(() => {
                            setIsActive(true);
                            setVideoSource('camera');
                            setIsEnded(false);
                        })
                        .catch(err => {
                            console.error('Erreur lors de la lecture:', err);
                            setError('Impossible de démarrer la lecture de la caméra');
                            stop();
                        });
                };
            }
        } catch (err) {
            console.error('Erreur lors de l\'accès à la caméra:', err);
            setError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
            stop();
        }
    }, [videoRef, stop]);

    /**
     * Charge une vidéo depuis un fichier
     */
    const loadVideoFile = useCallback((file) => {
        if (!file) return;

        // Vérifier que c'est un fichier vidéo
        if (!file.type.startsWith('video/')) {
            setError('Veuillez sélectionner un fichier vidéo.');
            return;
        }

        setError(null);
        stop(); // Arrêter toute source précédente

        const url = URL.createObjectURL(file);
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = url;
            videoRef.current.loop = false;
            
            // Écouter la fin de la vidéo
            videoRef.current.onended = () => {
                setIsEnded(true);
            };

            videoRef.current.onloadedmetadata = () => {
                videoRef.current.currentTime = 0;
                setIsActive(true);
                setVideoSource('file');
                setIsEnded(false);
                
                // Tenter de lancer la lecture immédiatement
                videoRef.current.play().catch(err => {
                    console.warn("L'autostart a été bloqué par le navigateur, l'utilisateur devra peut-être interagir:", err);
                });
            };

            videoRef.current.onerror = () => {
                setError('Erreur lors du chargement de la vidéo');
                URL.revokeObjectURL(url);
                stop();
            };
        }
    }, [videoRef, stop]);

    /**
     * Gestionnaire pour le changement de fichier
     */
    const handleFileChange = useCallback((event) => {
        const file = event.target.files?.[0];
        if (file) {
            loadVideoFile(file);
        }
        // Réinitialiser la valeur pour permettre de sélectionner le même fichier à nouveau
        event.target.value = '';
    }, [loadVideoFile]);

    /**
     * Ouvre le sélecteur de fichier
     */
    const openFileSelector = useCallback(() => {
        if (fileInputRef?.current) {
            fileInputRef.current.click();
        }
    }, [fileInputRef]);

    return {
        // État
        isActive,
        videoSource,
        error,
        isEnded,
        fileInputRef,
        
        // Méthodes
        startCamera,
        loadVideoFile,
        handleFileChange,
        openFileSelector,
        stop,
        replay
    };
};
