/**
 * Décoder le payload d'un token JWT sans librairie externe.
 * @param {string} token 
 * @returns {object|null} Le payload décodé ou null si invalide
 */
export const parseJwt = (token) => {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erreur parsing JWT:", e);
        return null;
    }
};

/**
 * Récupérer l'ID utilisateur depuis le token stocké
 * @returns {number|null} L'ID utilisateur ou null
 */
export const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded ? decoded.id : null;
};
