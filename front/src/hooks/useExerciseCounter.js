/**
 * Hook personnalisé pour gérer le comptage d'exercices
 */

import { useRef, useState, useCallback } from 'react';
import { detectExercise, validateExercisePosition } from '../detectors/exerciseDetectors';

/**
 * Hook pour compter les répétitions d'exercices
 * @param {string} exerciseId - ID de l'exercice à détecter
 * @returns {Object} État et méthodes de comptage
 */
export const useExerciseCounter = (exerciseId) => {
    const [count, setCount] = useState(0);
    const positionRef = useRef(null);
    const lastAngleRef = useRef(null);

    /**
     * Réinitialise le compteur
     */
    const reset = useCallback(() => {
        setCount(0);
        positionRef.current = null;
        lastAngleRef.current = null;
    }, []);

    /**
     * Traite les keypoints pour détecter et compter l'exercice
     * @param {Array} keypoints - Keypoints détectés
     * @returns {Object|null} Informations sur la détection
     */
    const processKeypoints = useCallback((keypoints) => {
        if (!exerciseId || !keypoints) {
            return null;
        }

        // Détecter l'exercice
        const detection = detectExercise(exerciseId, keypoints);
        
        if (!detection) {
            return null;
        }

        const { angle, data, feedback } = detection; // Récupérer le feedback
        lastAngleRef.current = angle;

        // Valider la position
        const newPosition = validateExercisePosition(exerciseId, angle, positionRef.current);
        
        // Compter une répétition si on passe de 'down' à 'up'
        if (newPosition === 'up' && positionRef.current === 'down') {
            setCount(prevCount => prevCount + 1);
        }

        positionRef.current = newPosition;

        return {
            angle,
            position: newPosition,
            feedback, // Retourner le feedback
            data
        };
    }, [exerciseId]);

    /**
     * Change l'exercice en cours
     */
    const changeExercise = useCallback((newExerciseId) => {
        reset();
    }, [reset]);

    return {
        count,
        processKeypoints,
        reset,
        changeExercise
    };
};
