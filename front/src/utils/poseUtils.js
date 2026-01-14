/**
 * Utilitaires pour la détection de pose et le dessin
 */

/**
 * Calcule l'angle entre trois points
 * @param {Object} a - Premier point {x, y}
 * @param {Object} b - Point central {x, y}
 * @param {Object} c - Troisième point {x, y}
 * @returns {number} Angle en degrés
 */
export const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
        angle = 360 - angle;
    }
    return angle;
};

/**
 * Trouve un keypoint par son nom dans un tableau de keypoints
 * @param {Array} keypoints - Tableau de keypoints
 * @param {string} name - Nom du keypoint
 * @returns {Object|null} Keypoint trouvé ou null
 */
export const findKeypoint = (keypoints, name) => {
    return keypoints.find(kp => kp.name === name) || null;
};

/**
 * Vérifie si un keypoint est valide (confiance suffisante)
 * @param {Object} keypoint - Keypoint à vérifier
 * @param {number} minConfidence - Confiance minimale (par défaut 0.3)
 * @returns {boolean} True si le keypoint est valide
 */
export const isKeypointValid = (keypoint, minConfidence = 0.3) => {
    return keypoint && keypoint.score >= minConfidence;
};

/**
 * Vérifie si tous les keypoints fournis sont valides
 * @param {Array} keypoints - Tableau de keypoints
 * @param {number} minConfidence - Confiance minimale
 * @returns {boolean} True si tous les keypoints sont valides
 */
export const areKeypointsValid = (keypoints, minConfidence = 0.3) => {
    return keypoints.every(kp => isKeypointValid(kp, minConfidence));
};

/**
 * Dessine les keypoints sur un canvas
 * @param {Array} keypoints - Tableau de keypoints
 * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
 * @param {Object} options - Options de dessin
 */
export const drawKeypoints = (keypoints, ctx, options = {}) => {
    const {
        radius = 5,
        color = '#00FF00',
        minConfidence = 0.3
    } = options;

    keypoints.forEach((keypoint) => {
        if (keypoint.score > minConfidence) {
            const { x, y } = keypoint;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
        }
    });
};

/**
 * Dessine le squelette sur un canvas
 * @param {Array} keypoints - Tableau de keypoints
 * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
 * @param {Object} options - Options de dessin
 */
export const drawSkeleton = (keypoints, ctx, options = {}) => {
    const {
        lineWidth = 2,
        color = '#00FF00',
        minConfidence = 0.3
    } = options;

    const adjacentKeyPoints = [
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'],
        ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'],
        ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'],
        ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'],
        ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'],
        ['right_knee', 'right_ankle']
    ];

    adjacentKeyPoints.forEach(([from, to]) => {
        const fromPoint = findKeypoint(keypoints, from);
        const toPoint = findKeypoint(keypoints, to);
        
        if (fromPoint && toPoint && 
            fromPoint.score > minConfidence && toPoint.score > minConfidence) {
            ctx.beginPath();
            ctx.moveTo(fromPoint.x, fromPoint.y);
            ctx.lineTo(toPoint.x, toPoint.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }
    });
};

/**
 * Dessine du texte sur le canvas
 * @param {CanvasRenderingContext2D} ctx - Contexte du canvas
 * @param {string} text - Texte à afficher
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {Object} options - Options de texte
 */
export const drawText = (ctx, text, x, y, options = {}) => {
    const {
        font = '20px Arial',
        color = '#FFFFFF',
        backgroundColor = null
    } = options;

    ctx.font = font;
    ctx.fillStyle = color;

    // Dessiner un fond si spécifié
    if (backgroundColor) {
        const metrics = ctx.measureText(text);
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x - 5, y - 20, metrics.width + 10, 25);
        ctx.fillStyle = color;
    }

    ctx.fillText(text, x, y);
};
