/**
 * Système de détection d'exercices modulaire
 * 
 * Pour ajouter un nouvel exercice:
 * 1. Créer une fonction de détection qui retourne { angle, data } ou null
 * 2. Créer un validateur de position qui retourne la position actuelle
 * 3. Ajouter l'exercice à EXERCISE_CONFIGS
 */

import { calculateAngle, findKeypoint, areKeypointsValid, isKeypointValid } from '../utils/poseUtils';

/**
 * Détection des pompes
 * @param {Array} keypoints - Keypoints détectés
 * @returns {Object|null} { angle: number, data: Object, feedback: string|null } ou null si détection impossible
 */
const detectPushup = (keypoints) => {
    const leftShoulder = findKeypoint(keypoints, 'left_shoulder');
    const leftElbow = findKeypoint(keypoints, 'left_elbow');
    const leftWrist = findKeypoint(keypoints, 'left_wrist');
    const leftHip = findKeypoint(keypoints, 'left_hip');
    const leftKnee = findKeypoint(keypoints, 'left_knee');
    const leftAnkle = findKeypoint(keypoints, 'left_ankle');

    const rightShoulder = findKeypoint(keypoints, 'right_shoulder');
    const rightElbow = findKeypoint(keypoints, 'right_elbow');
    const rightWrist = findKeypoint(keypoints, 'right_wrist');
    const rightHip = findKeypoint(keypoints, 'right_hip');
    const rightKnee = findKeypoint(keypoints, 'right_knee');
    const rightAnkle = findKeypoint(keypoints, 'right_ankle');

    const requiredKeypoints = [
        leftShoulder, leftElbow, leftWrist,
        rightShoulder, rightElbow, rightWrist
    ];

    if (!areKeypointsValid(requiredKeypoints, 0.3)) {
        return null;
    }

    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

    let feedback = null;

    // Vérification du dos (Alignement Épaule - Hanche - Cheville)
    // On essaie le côté gauche d'abord, puis le droit
    let bodyAngle = null;
    
    if (isKeypointValid(leftShoulder) && isKeypointValid(leftHip) && isKeypointValid(leftAnkle)) {
        bodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
    } else if (isKeypointValid(rightShoulder) && isKeypointValid(rightHip) && isKeypointValid(rightAnkle)) {
        bodyAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
    } 
    // Fallback sur les genoux si les chevilles ne sont pas visibles (pompes sur genoux ou cadrage)
    else if (isKeypointValid(leftShoulder) && isKeypointValid(leftHip) && isKeypointValid(leftKnee)) {
        bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    } else if (isKeypointValid(rightShoulder) && isKeypointValid(rightHip) && isKeypointValid(rightKnee)) {
        bodyAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    }

    if (bodyAngle !== null) {
        // Un angle "droit" est ~180°. On tolère entre 160 et 200 (légère courbure).
        // < 160 : Bassin qui tombe (sagging)
        // > 200 : Fesses en l'air (piking)
        if (bodyAngle < 150) {
            feedback = "Attention : Remontez le bassin, dos droit !";
        } else if (bodyAngle > 200) {
            feedback = "Attention : Baissez les fesses, alignez-vous !";
        } else {
            feedback = "C'est bien !";
        }
    }

    // Vérification sommaire des bras (pas d'hyper-extension ou angle étrange)
    // Par exemple, si l'angle est très petit (< 40°) alors qu'on est censé être en pompe
    if (avgElbowAngle < 40) {
        feedback = "Attention : Ne pliez pas trop les bras !";
    }

    return {
        angle: avgElbowAngle,
        feedback: feedback,
        data: {
            leftElbowAngle,
            rightElbowAngle,
            avgElbowAngle,
            bodyAngle
        }
    };
};

/**
 * Validation de position pour les pompes
 * @param {number} angle - Angle actuel
 * @param {string} currentPosition - Position actuelle ('up', 'down', null)
 * @returns {string|null} Nouvelle position
 */
const validatePushupPosition = (angle, currentPosition) => {
    // Position basse: angle < 90
    if (angle < 90) {
        return 'down';
    }
    // Position haute: angle > 160
    if (angle > 160) {
        return 'up';
    }
    return currentPosition;
};

/**
 * Détection des squats
 * @param {Array} keypoints - Keypoints détectés
 * @returns {Object|null} { angle: number, data: Object, feedback: string|null } ou null si détection impossible
 */
const detectSquat = (keypoints) => {
    const leftShoulder = findKeypoint(keypoints, 'left_shoulder');
    const leftHip = findKeypoint(keypoints, 'left_hip');
    const leftKnee = findKeypoint(keypoints, 'left_knee');
    const leftAnkle = findKeypoint(keypoints, 'left_ankle');

    const rightShoulder = findKeypoint(keypoints, 'right_shoulder');
    const rightHip = findKeypoint(keypoints, 'right_hip');
    const rightKnee = findKeypoint(keypoints, 'right_knee');
    const rightAnkle = findKeypoint(keypoints, 'right_ankle');

    const requiredKeypoints = [
        leftHip, leftKnee, leftAnkle,
        rightHip, rightKnee, rightAnkle
    ];

    if (!areKeypointsValid(requiredKeypoints, 0.3)) {
        return null;
    }

    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    let feedback = "C'est bien !";

    // 1. Vérification de la verticalité du dos (Check Absolu)
    let backVerticalAngle = null;
    
    // Helper pour calculer l'angle par rapport à la verticale (0° = droit, 90° = horizontal)
    const getVerticalOffset = (shoulder, hip) => {
        if (!isKeypointValid(shoulder) || !isKeypointValid(hip)) return null;
        // Vecteur Hanche -> Épaule
        const dy = shoulder.y - hip.y; // Négatif si épaule au-dessus
        const dx = shoulder.x - hip.x;
        // Angle par rapport à la verticale (-PI/2)
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = angleRad * (180 / Math.PI);
        // Écart par rapport à -90° (verticale)
        // Si angleDeg = -90 (droit) -> diff = 0
        // Si angleDeg = 0 (horizontal) -> diff = 90
        return Math.abs(angleDeg + 90);
    };

    const leftBackAngle = getVerticalOffset(leftShoulder, leftHip);
    const rightBackAngle = getVerticalOffset(rightShoulder, rightHip);
    
    // On prend la moyenne si les deux sont valides, sinon l'un des deux
    if (leftBackAngle !== null && rightBackAngle !== null) {
        backVerticalAngle = (leftBackAngle + rightBackAngle) / 2;
    } else if (leftBackAngle !== null) {
        backVerticalAngle = leftBackAngle;
    } else if (rightBackAngle !== null) {
        backVerticalAngle = rightBackAngle;
    }

    // 2. Vérification angle Buste-Cuisses (Check Relatif existant)
    let torsoAngle = null;
    if (isKeypointValid(leftShoulder) && isKeypointValid(leftHip) && isKeypointValid(leftKnee)) {
        torsoAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    } else if (isKeypointValid(rightShoulder) && isKeypointValid(rightHip) && isKeypointValid(rightKnee)) {
        torsoAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    }

    // Logique de feedback priorisée
    
    // Si le dos est trop penché (> 45° de la verticale), c'est une erreur critique
    if (backVerticalAngle !== null && backVerticalAngle > 45) {
        feedback = "Attention : Redressez votre dos (trop penché) !";
    } 
    // Sinon, on vérifie la fermeture de l'angle buste-cuisses
    else if (torsoAngle !== null) {
        // Ajustement dynamique du seuil : en position basse (squat profond), on penche naturellement plus
        const torsoThreshold = avgKneeAngle < 100 ? 50 : 60;
        
        // Si l'angle entre le buste et les cuisses est trop fermé, on se penche trop
        if (torsoAngle < torsoThreshold) {
            feedback = "Attention : Levez le buste !";
        }
    }

    return {
        angle: avgKneeAngle,
        feedback: feedback,
        data: {
            leftKneeAngle,
            rightKneeAngle,
            avgKneeAngle,
            torsoAngle,
            backVerticalAngle
        }
    };
};

/**
 * Validation de position pour les squats
 * @param {number} angle - Angle actuel
 * @param {string} currentPosition - Position actuelle ('up', 'down', null)
 * @returns {string|null} Nouvelle position
 */
const validateSquatPosition = (angle, currentPosition) => {
    // Position basse: angle < 100
    if (angle < 100) {
        return 'down';
    }
    // Position haute: angle > 160
    if (angle > 160) {
        return 'up';
    }
    return currentPosition;
};






/**
 * Configuration des exercices disponibles
 * Chaque exercice doit avoir:
 * - id: identifiant unique
 * - name: nom affiché
 * - detector: fonction de détection
 * - validator: fonction de validation de position
 * - thresholds: seuils pour la détection (optionnel, pour affichage)
 */
export const EXERCISE_CONFIGS = {
    pompe: {
        id: 'pompe',
        name: 'Pompes',
        detector: detectPushup,
        validator: validatePushupPosition,
        thresholds: {
            down: 90,
            up: 160
        },
        instructions: [
            'Placez-vous face à la caméra de profil',
            'Assurez-vous que tout votre corps est visible',
            'Descendez jusqu\'à ce que vos coudes soient à ~90°',
            'Remontez complètement pour valider une répétition'
        ]
    },
    squat: {
        id: 'squat',
        name: 'Squats',
        detector: detectSquat,
        validator: validateSquatPosition,
        thresholds: {
            down: 100,
            up: 160
        },
        instructions: [
            'Placez-vous de profil par rapport à la caméra',
            'Assurez-vous que vos jambes sont visibles',
            'Descendez jusqu\'à ce que vos genoux soient à ~90°',
            'Remontez complètement pour valider une répétition'
        ]
    }
};

/**
 * Récupère la configuration d'un exercice
 * @param {string} exerciseId - ID de l'exercice
 * @returns {Object|null} Configuration de l'exercice ou null
 */
export const getExerciseConfig = (exerciseId) => {
    return EXERCISE_CONFIGS[exerciseId] || null;
};

/**
 * Récupère la liste de tous les exercices disponibles
 * @returns {Array} Tableau des exercices
 */
export const getAvailableExercises = () => {
    return Object.values(EXERCISE_CONFIGS);
};

/**
 * Détecte un exercice selon sa configuration
 * @param {string} exerciseId - ID de l'exercice
 * @param {Array} keypoints - Keypoints détectés
 * @returns {Object|null} Résultat de la détection
 */
export const detectExercise = (exerciseId, keypoints) => {
    const config = getExerciseConfig(exerciseId);
    if (!config) {
        console.warn(`Exercice inconnu: ${exerciseId}`);
        return null;
    }
    return config.detector(keypoints);
};

/**
 * Valide la position d'un exercice
 * @param {string} exerciseId - ID de l'exercice
 * @param {number} angle - Angle actuel
 * @param {string} currentPosition - Position actuelle
 * @returns {string|null} Nouvelle position
 */
export const validateExercisePosition = (exerciseId, angle, currentPosition) => {
    const config = getExerciseConfig(exerciseId);
    if (!config) {
        return currentPosition;
    }
    return config.validator(angle, currentPosition);
};
