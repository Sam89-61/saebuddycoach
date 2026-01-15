import React, { useState } from 'react';
import WaweEffect from './WaveEffect';
function Form_Co() {
    const [formData, setFormData] = useState({
        email: '',
        mot_de_passe: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    mot_de_passe: formData.mot_de_passe
                })
            });

            const data = await response.json();

            console.log('Réponse serveur:', data); // Pour déboguer

            if (response.ok) {
                // Stocker le token JWT uniquement
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    if (data.user && data.user.pseudo) {
                        localStorage.setItem('userPseudo', data.user.pseudo);
                    }

                    console.log('Connexion réussie:', data.user);
                    // alert(`Bienvenue ${data.user.pseudo} !`); // Optionnel, peut-être intrusif

                    window.location.href = '/';
                } else {
                    setError('Token non reçu du serveur');
                }
            } else {
                setError(data.message || 'Échec de la connexion');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center ">
            <div className="w-full max-w-md pt-7 z-10 bg-white ">
                <div className='flex justify-center py-2'>
                    <img src="../../media/logo.svg" alt="Logo" className="h-32 w-32 object-cover" />
                </div>
                <form className="p-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Connexion</h2>
                        <p className="text-gray-500 text-sm">Bienvenue sur BuddyCoach</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email ou Pseudo
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 outline-none"
                            placeholder="Entrez votre email ou pseudo"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="mot_de_passe"
                            name="mot_de_passe"
                            value={formData.mot_de_passe}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 outline-none"
                            placeholder="Entrez votre mot de passe"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Connexion en cours...
                            </span>
                        ) : (
                            'Se connecter'
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Pas encore de compte ?{' '}
                            <a
                                href="/inscription"
                                className="font-semibold text-indigo-600 hover:text-indigo-700 transition duration-200"
                            >
                                Inscrivez-vous
                            </a>
                        </p>
                        <p className="text-sm text-gray-600">
                            
                            <a
                                href="/login"
                                className="font-semibold text-indigo-600 hover:text-indigo-700 transition duration-200"
                            >
                                Mot de passe oublié ?{' '}
                            </a>
                        </p>
                    </div>
                </form>
                
            </div>
            <WaweEffect />
        </main>
    );
}

export default Form_Co;
