import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import './style/AdminDashboard.css';

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
            <main className="admin-container">
                <div className="admin-header">
                    <h1>🛡️ Panneau Administrateur</h1>
                    <div className="admin-tabs">
                        <button 
                            className={activeTab === 'submissions' ? 'active' : ''} 
                            onClick={() => setActiveTab('submissions')}
                        >
                            Validations en attente ({submissions.length})
                        </button>
                        <button 
                            className={activeTab === 'users' ? 'active' : ''} 
                            onClick={() => setActiveTab('users')}
                        >
                            Gestion Utilisateurs
                        </button>
                        <button 
                            className={activeTab === 'events' ? 'active' : ''} 
                            onClick={() => setActiveTab('events')}
                        >
                            📅 Événements
                        </button>
                    </div>
                </div>

                {actionMessage && <div className={`admin-msg ${actionMessage.type}`}>{actionMessage.text}</div>}

                <div className="admin-content">
                    {isLoading ? <div className="loading">Chargement...</div> : (
                        <>
                            {activeTab === 'events' && (
                                <div className="events-management">
                                    <div className="create-event-form">
                                        <h3>Créer un événement</h3>
                                        <form onSubmit={handleCreateEvent}>
                                            <input type="text" placeholder="Nom de l'événement" required 
                                                value={newEvent.nom} onChange={e => setNewEvent({...newEvent, nom: e.target.value})} />
                                            <textarea placeholder="Description" required
                                                value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                                            <div className="form-row">
                                                <input type="date" required 
                                                    value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                                                <input type="time" required 
                                                    value={newEvent.heure} onChange={e => setNewEvent({...newEvent, heure: e.target.value})} />
                                                <input type="number" placeholder="Durée (min)" required 
                                                    value={newEvent.duree} onChange={e => setNewEvent({...newEvent, duree: parseInt(e.target.value)})} />
                                            </div>
                                            <input type="text" placeholder="Lieu (ou URL)" required 
                                                value={newEvent.lieu} onChange={e => setNewEvent({...newEvent, lieu: e.target.value})} />
                                            <button type="submit" className="btn-create">Publier l'événement</button>
                                        </form>
                                    </div>

                                    <div className="events-list-admin">
                                        <h3>Événements existants</h3>
                                        {events.length === 0 ? <p>Aucun événement prévu.</p> : (
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>Nom</th>
                                                        <th>Description</th>
                                                        <th>Date</th>
                                                        <th>Heure (Durée)</th>
                                                        <th>Lieu</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {events.map(ev => (
                                                        <tr key={ev.id_evenement}>
                                                            <td><strong>{ev.nom}</strong></td>
                                                            <td title={ev.description} style={{maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                                                {ev.description}
                                                            </td>
                                                            <td>{new Date(ev.date).toLocaleDateString()}</td>
                                                            <td>{ev.heure} ({ev.duree} min)</td>
                                                            <td>{ev.lieu}</td>
                                                            <td>
                                                                <button className="btn-ban" onClick={() => handleDeleteEvent(ev.id_evenement)}>Supprimer</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'submissions' && (
                                <div className="submissions-list">
                                    {submissions.length === 0 ? <p className="empty">Aucune soumission en attente.</p> : (
                                        submissions.map(sub => (
                                            <div key={sub.id_classement_user} className="submission-card">
                                                <div className="sub-info">
                                                    <h3>{sub.nom_challenge}</h3>
                                                    <p>Joueur : <strong>{sub.pseudo}</strong></p>
                                                    <p className="score-display">Score : {sub.score} {sub.unite_mesure}</p>
                                                    <a href={sub.url_video_preuve} target="_blank" rel="noopener noreferrer" className="video-link">📺 Voir la Preuve</a>
                                                    <p className="date">Soumis le : {new Date(sub.date_soumission).toLocaleDateString()}</p>
                                                </div>
                                                <div className="sub-actions">
                                                    <button className="btn-refuse" onClick={() => handleValidation(sub.id_classement_user, 'REFUSE')}>Refuser ❌</button>
                                                    <button className="btn-validate" onClick={() => handleValidation(sub.id_classement_user, 'VALIDE')}>Valider ✅</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Pseudo</th>
                                            <th>Email</th>
                                            <th>Rôle</th>
                                            <th>Date Inscription</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id_utilisateur}>
                                                <td>{u.id_utilisateur}</td>
                                                <td>{u.pseudo}</td>
                                                <td>{u.email}</td>
                                                <td>
                                                    <span className={`badge-role ${u.role}`}>{u.role}</span>
                                                </td>
                                                <td>{new Date(u.date_inscription).toLocaleDateString()}</td>
                                                <td>
                                                    {u.role !== 'admin' && (
                                                        <button className="btn-ban" onClick={() => handleDeleteUser(u.id_utilisateur, u.pseudo)}>Bannir</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
