import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('submissions'); // 'users', 'submissions', 'events'
    const [users, setUsers] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ nom: '', description: '', date: '', heure: '', duree: 60, lieu: 'En ligne' });
    const [isLoading, setIsLoading] = useState(true);
    const [actionMessage, setActionMessage] = useState(null);

    // Charger les données selon l'onglet
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };
                
                if (activeTab === 'users') {
                    const res = await fetch('/api/admin/users', { headers });
                    if (res.ok) setUsers(await res.json());
                } else if (activeTab === 'submissions') {
                    const res = await fetch('/api/admin/submissions', { headers });
                    if (res.ok) setSubmissions(await res.json());
                } else if (activeTab === 'events') {
                    const res = await fetch('/api/evenement/getAll', { headers }); // Route publique ou admin selon config
                    if (res.ok) {
                        const data = await res.json();
                        setEvents(data.evenements);
                    }
                }
            } catch (err) {
                console.error("Erreur admin:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [activeTab, actionMessage]); 

    // Action : Créer un événement
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/evenement/create', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newEvent)
            });

            if (res.ok) {
                setActionMessage({ type: 'success', text: 'Événement créé avec succès !' });
                setNewEvent({ nom: '', description: '', date: '', heure: '', duree: 60, lieu: 'En ligne' });
                setTimeout(() => setActionMessage(null), 3000);
            } else {
                setActionMessage({ type: 'error', text: 'Erreur lors de la création.' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Action : Supprimer un événement
    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Supprimer cet événement ?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/evenement/delete/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setActionMessage({ type: 'success', text: 'Événement supprimé.' });
                setTimeout(() => setActionMessage(null), 3000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Action : Valider / Refuser un score
    const handleValidation = async (id, statut) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir ${statut === 'VALIDE' ? 'VALIDER' : 'REFUSER'} cette soumission ?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/submissions/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ statut, commentaire: statut === 'REFUSE' ? 'Non conforme' : 'Validé par Admin' })
            });

            if (res.ok) {
                setActionMessage({ type: 'success', text: 'Traitement effectué avec succès.' });
                setTimeout(() => setActionMessage(null), 3000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Action : Supprimer un utilisateur
    const handleDeleteUser = async (id, pseudo) => {
        if (!window.confirm(`ATTENTION : Voulez-vous vraiment bannir définitivement ${pseudo} ? Cette action est irréversible.`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setActionMessage({ type: 'success', text: `Utilisateur ${pseudo} banni.` });
                setTimeout(() => setActionMessage(null), 3000);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="page-container">
            <Header />
            <main className="max-w-7xl mx-auto p-8 min-h-[80vh]">
                <div className="mb-8 text-center">
                    <h1 className="text-[#e74c3c] mb-6 text-3xl font-bold">🛡️ Panneau Administrateur</h1>
                    <div className="flex justify-center gap-4 mb-8">
                        <button 
                            className={`px-6 py-3 text-base border-none cursor-pointer rounded-lg transition-all duration-300 ${activeTab === 'submissions' ? 'bg-[#34495e] text-white font-bold -translate-y-0.5 shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} 
                            onClick={() => setActiveTab('submissions')}
                        >
                            Validations en attente ({submissions.length})
                        </button>
                        <button 
                            className={`px-6 py-3 text-base border-none cursor-pointer rounded-lg transition-all duration-300 ${activeTab === 'users' ? 'bg-[#34495e] text-white font-bold -translate-y-0.5 shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} 
                            onClick={() => setActiveTab('users')}
                        >
                            Gestion Utilisateurs
                        </button>
                        <button 
                            className={`px-6 py-3 text-base border-none cursor-pointer rounded-lg transition-all duration-300 ${activeTab === 'events' ? 'bg-[#34495e] text-white font-bold -translate-y-0.5 shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`} 
                            onClick={() => setActiveTab('events')}
                        >
                            📅 Événements
                        </button>
                    </div>
                </div>

                {actionMessage && (
                    <div className={`p-4 rounded-md mb-6 text-center font-bold ${actionMessage.type === 'success' ? 'bg-[#d4edda] text-[#155724]' : 'bg-red-100 text-red-700'}`}>
                        {actionMessage.text}
                    </div>
                )}

                <div className="admin-content">
                    {isLoading ? <div className="text-center text-xl text-gray-500 mt-10">Chargement...</div> : (
                        <>
                            {activeTab === 'events' && (
                                <div className="space-y-8">
                                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#34495e]">
                                        <h3 className="text-xl font-bold mb-4 text-[#2c3e50]">Créer un événement</h3>
                                        <form onSubmit={handleCreateEvent} className="space-y-4">
                                            <input type="text" placeholder="Nom de l'événement" required 
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34495e]"
                                                value={newEvent.nom} onChange={e => setNewEvent({...newEvent, nom: e.target.value})} />
                                            <textarea placeholder="Description" required
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34495e] h-32"
                                                value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <input type="date" required 
                                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34495e]"
                                                    value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                                                <input type="time" required 
                                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34495e]"
                                                    value={newEvent.heure} onChange={e => setNewEvent({...newEvent, heure: e.target.value})} />
                                                <input type="number" placeholder="Durée (min)" required 
                                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34495e]"
                                                    value={newEvent.duree} onChange={e => setNewEvent({...newEvent, duree: parseInt(e.target.value)})} />
                                            </div>
                                            <input type="text" placeholder="Lieu (ou URL)" required 
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34495e]"
                                                value={newEvent.lieu} onChange={e => setNewEvent({...newEvent, lieu: e.target.value})} />
                                            <button type="submit" className="w-full py-3 bg-[#34495e] text-white font-bold rounded-lg hover:bg-[#2c3e50] transition-colors">
                                                Publier l'événement
                                            </button>
                                        </form>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-md">
                                        <h3 className="text-xl font-bold mb-4 text-[#2c3e50]">Événements existants</h3>
                                        {events.length === 0 ? <p className="text-gray-500 italic">Aucun événement prévu.</p> : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse bg-white text-[#2c3e50] rounded-lg overflow-hidden shadow-sm">
                                                    <thead>
                                                        <tr>
                                                            <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Nom</th>
                                                            <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Description</th>
                                                            <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Date</th>
                                                            <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Heure (Durée)</th>
                                                            <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Lieu</th>
                                                            <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {events.map(ev => (
                                                            <tr key={ev.id_evenement} className="hover:bg-gray-50">
                                                                <td className="p-4 border-b border-gray-200"><strong>{ev.nom}</strong></td>
                                                                <td className="p-4 border-b border-gray-200 max-w-[250px] whitespace-nowrap overflow-hidden text-ellipsis" title={ev.description}>
                                                                    {ev.description}
                                                                </td>
                                                                <td className="p-4 border-b border-gray-200">{new Date(ev.date).toLocaleDateString()}</td>
                                                                <td className="p-4 border-b border-gray-200">{ev.heure} ({ev.duree} min)</td>
                                                                <td className="p-4 border-b border-gray-200">{ev.lieu}</td>
                                                                <td className="p-4 border-b border-gray-200">
                                                                    <button className="bg-[#e74c3c] text-white px-3 py-1 rounded hover:bg-[#c0392b] transition-colors" onClick={() => handleDeleteEvent(ev.id_evenement)}>Supprimer</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'submissions' && (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                                    {submissions.length === 0 ? <p className="text-center text-[#7f8c8d] italic col-span-full">Aucune soumission en attente.</p> : (
                                        submissions.map(sub => (
                                            <div key={sub.id_classement_user} className="bg-white p-6 rounded-xl shadow-md border-l-[5px] border-[#f1c40f]">
                                                <div className="mb-4">
                                                    <h3 className="mt-0 text-[#2c3e50] text-xl font-bold">{sub.nom_challenge}</h3>
                                                    <p className="text-gray-700">Joueur : <strong>{sub.pseudo}</strong></p>
                                                    <p className="text-lg font-bold text-[#2980b9] my-2">Score : {sub.score} {sub.unite_mesure}</p>
                                                    <a href={sub.url_video_preuve} target="_blank" rel="noopener noreferrer" className="inline-block my-2 text-[#e67e22] no-underline font-bold hover:underline">📺 Voir la Preuve</a>
                                                    <p className="text-sm text-gray-500">Soumis le : {new Date(sub.date_soumission).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-4 mt-4">
                                                    <button className="flex-1 p-2 rounded cursor-pointer font-bold text-black bg-[#c0392b] hover:bg-[#a93226] transition-colors" onClick={() => handleValidation(sub.id_classement_user, 'REFUSE')}>Refuser ❌</button>
                                                    <button className="flex-1 p-2 rounded cursor-pointer font-bold text-black bg-[#27ae60] hover:bg-[#219150] transition-colors" onClick={() => handleValidation(sub.id_classement_user, 'VALIDE')}>Valider ✅</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse bg-white text-[#2c3e50] rounded-lg overflow-hidden shadow-sm" style={{maxWidth:"90vw"}}>
                                        <thead>
                                            <tr>
                                                <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">ID</th>
                                                <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Pseudo</th>
                                                <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Email</th>
                                                <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Rôle</th>
                                                <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Date Inscription</th>
                                                <th className="p-4 text-left border-b border-gray-200 bg-[#34495e] text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id_utilisateur} className="hover:bg-gray-50">
                                                    <td className="p-4 border-b border-gray-200">{u.id_utilisateur}</td>
                                                    <td className="p-4 border-b border-gray-200">{u.pseudo}</td>
                                                    <td className="p-4 border-b border-gray-200">{u.email}</td>
                                                    <td className="p-4 border-b border-gray-200">
                                                        <span className={`px-2 py-1 rounded text-xs uppercase ${u.role === 'admin' ? 'bg-[#8e44ad] text-white' : 'bg-[#95a5a6] text-white'}`}>{u.role}</span>
                                                    </td>
                                                    <td className="p-4 border-b border-gray-200">{new Date(u.date_inscription).toLocaleDateString()}</td>
                                                    <td className="p-4 border-b border-gray-200">
                                                        {u.role !== 'admin' && (
                                                            <button className="bg-[#e74c3c] text-white px-3 py-1 rounded hover:bg-[#c0392b] transition-colors" onClick={() => handleDeleteUser(u.id_utilisateur, u.pseudo)}>Bannir</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default AdminDashboard;
