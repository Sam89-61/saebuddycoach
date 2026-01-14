import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function ProfilPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ pseudo: '', email: '' });
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('info'); // info, security

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const localPseudo = localStorage.getItem('userPseudo');

                setUser({
                    pseudo: localPseudo || decoded.pseudo,
                    email: decoded.email
                });
                setFormData(prev => ({
                    ...prev,
                    pseudo: localPseudo || decoded.pseudo,
                    email: decoded.email
                }));
            } catch (e) {
                console.error("Error parsing token", e);
            }
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profil mis à jour !' });

                // Update local storage
                if (formData.pseudo) localStorage.setItem('userPseudo', formData.pseudo);

                // Update UI state
                setUser(prev => ({ ...prev, pseudo: formData.pseudo, email: formData.email }));

                // Reset sensitive fields
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            } else {
                setMessage({ type: 'error', text: data.message || 'Erreur lors de la mise à jour' });
            }
                } catch (error) {
                     setMessage({ type: 'error', text: 'Erreur serveur. Veuillez réessayer.' });
                } finally {            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? \n\nATTENTION : Cette action est irréversible. Toutes vos données (progression, historique, programmes) seront effacées.")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/auth/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                localStorage.clear();
                navigate('/inscription');
            } else {
                const data = await res.json();
                alert(data.message || "Erreur lors de la suppression");
            }
        } catch (error) {
            alert("Erreur serveur lors de la suppression");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userPseudo');
        navigate('/login');
    };

    return (
        <>
            <Header />

            <main className="flex-1 px-4 py-6  max-w-md mx-auto w-full" style={{ minHeight: "0vh" }}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    <div className="bg-indigo-600 p-6 text-center">
                        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-indigo-200">
                            {user.pseudo ? user.pseudo.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2 className="text-white text-xl font-bold">{user.pseudo}</h2>
                        <p className="text-indigo-200 text-sm">{user.email}</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Informations
                        </button>
                        <button
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeTab === 'security' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
                            onClick={() => setActiveTab('security')}
                        >
                            Sécurité
                        </button>
                    </div>

                    <div className="p-6">
                        {message.text && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdate}>
                            {activeTab === 'info' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pseudo</label>
                                        <input
                                            type="text"
                                            name="pseudo"
                                            value={formData.pseudo}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="Votre pseudo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-4">
                                    <div className="p-3 bg-yellow-50 text-yellow-800 text-xs rounded-lg mb-4">
                                        Pour changer de mot de passe, vous devez saisir votre mot de passe actuel.
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow transition-all duration-200 disabled:opacity-50"
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </form>
                        <div className="mt-6 border-t pt-4">
                            
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                    >
                        Déconnexion
                    </button>

                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-colors border border-red-100"
                    >
                        Supprimer mon compte
                    </button>
                    </div>
                    </div>
                    
                </div>

             
            </main>

            <Footer />
        </>
    );
}

export default ProfilPage;
