import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Planning = () => {
    const [events, setEvents] = useState([]);
    const [participations, setParticipations] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // États des filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const [selectedDay, setSelectedDay] = useState('Tous');

    // Récupérer l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user.id_utilisateur || (localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id : null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/evenement/getAll');
            const data = await response.json();
            
            if (response.ok) {
                const sortedEvents = data.evenements.sort((a, b) => new Date(a.date) - new Date(b.date));
                setEvents(sortedEvents);
                if (userId) {
                    checkParticipations(sortedEvents);
                }
            }
        } catch (error) {
            console.error("Erreur chargement événements:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkParticipations = async (eventList) => {
        const token = localStorage.getItem('token');
        const statusMap = {};
        for (const event of eventList) {
            try {
                const res = await fetch(`/api/evenement/checkParticipation/${event.id_evenement}/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    statusMap[event.id_evenement] = data.isRegistered;
                }
            } catch (e) {
                console.error("Erreur check participation:", e);
            }
        }
        setParticipations(statusMap);
    };

    const handleSubscribe = async (eventId) => {
        if (!userId) {
            alert("Veuillez vous connecter pour participer.");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/evenement/addParticipation', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_evenement: eventId,
                    id_utilisateur: userId,
                    statut: 'INSCRIT'
                })
            });

            if (response.ok) {
                setParticipations(prev => ({ ...prev, [eventId]: true }));
            } else {
                alert("Erreur lors de l'inscription.");
            }
        } catch (error) {
            console.error("Erreur inscription:", error);
        }
    };

    const handleJoin = (eventId) => {
        navigate(`/join-event/${eventId}`);
    };

    const isEventLive = (event) => {
        if (!event.date || !event.heure) return false;
        const eventDateStr = event.date.split('T')[0];
        const startDateTime = new Date(`${eventDateStr}T${event.heure}`);
        const now = new Date();
        const durationMs = (event.duree || 60) * 60 * 1000;
        const endDateTime = new Date(startDateTime.getTime() + durationMs);
        const openTime = new Date(startDateTime.getTime() - 10 * 60 * 1000);
        return now >= openTime && now <= endDateTime;
    };

    const isEventFinished = (event) => {
        if (!event.date || !event.heure) return false;
        const eventDateStr = event.date.split('T')[0];
        const startDateTime = new Date(`${eventDateStr}T${event.heure}`);
        const durationMs = (event.duree || 60) * 60 * 1000;
        const endDateTime = new Date(startDateTime.getTime() + durationMs);
        return new Date() > endDateTime;
    };



    // --- LOGIQUE DE FILTRAGE ---
    const getEventDayName = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { weekday: 'long' }); // "lundi", "mardi"...
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = 
            event.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (event.lieu && event.lieu.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'Tous' || 
            (event.categorie && event.categorie.toLowerCase() === selectedCategory.toLowerCase());

        const matchesDay = selectedDay === 'Tous' || 
            getEventDayName(event.date).toLowerCase() === selectedDay.toLowerCase();

        return matchesSearch && matchesCategory && matchesDay;
    });

    const availableCategories = ['Tous', ...new Set(events.map(e => e.categorie).filter(Boolean))];
    const availableDays = ['Tous', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <Header />
            
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
                
                <div className="text-center mb-10">
                    <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Planning</span>
                    <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">
                        Cours en Direct
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                        Rejoignez nos coachs et la communauté pour des sessions live interactives.
                    </p>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    <div className="relative w-full md:w-1/3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un cours, un lieu..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 w-full md:w-auto overflow-x-auto">
                        <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                        >
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'Tous' ? 'Toutes catégories' : cat}</option>
                            ))}
                        </select>

                        <select 
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-indigo-600 outline-none"
                        >
                            {availableDays.map(day => (
                                <option key={day} value={day}>{day === 'Tous' ? 'Tous les jours' : day}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun cours trouvé</h3>
                        <p className="mt-1 text-gray-500">Essayez de modifier vos filtres.</p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {filteredEvents.map(event => {
                            const isRegistered = participations[event.id_evenement];
                            const isLive = isEventLive(event);
                            const isFinished = isEventFinished(event);

                            return (
                                <div key={event.id_evenement} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                                    
                                    <div className={`h-32 w-full flex items-center justify-center relative bg-gradient-to-r from-gray-100 to-gray-50`}>
                                        <span className="text-xl font-bold text-gray-400 uppercase tracking-widest">
                                            {event.categorie || 'Sport'}
                                        </span>
                                        {isLive && (
                                            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                                                <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                                            </span>
                                        )}
                                        {isRegistered && (
                                            <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                Inscrit
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-600 text-white`}>
                                                {event.categorie || 'Général'}
                                            </span>
                                            {event.organisateur_nom && (
                                                <span className="text-xs text-gray-400 font-medium">
                                                    Par {event.organisateur_nom}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-1">
                                            {event.nom}
                                        </h3>
                                        
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                                            {event.description || "Pas de description disponible."}
                                        </p>

                                        <div className="space-y-3 mb-6 mt-auto">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                                {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                                {event.heure ? event.heure.substring(0, 5) : '??:??'} • {event.duree || 60} min
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="w-5 h-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                                {event.lieu || 'En ligne'}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-100">
                                            {!isRegistered && !isFinished && (
                                                <button 
                                                    onClick={() => handleSubscribe(event.id_evenement)}
                                                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <span>S'inscrire</span>
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                                                </button>
                                            )}

                                            {isRegistered && !isFinished && (
                                                <button 
                                                    onClick={() => isLive && handleJoin(event.id_evenement)}
                                                    disabled={!isLive}
                                                    className={`w-full py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                                                        isLive 
                                                        ? 'bg-green-500 hover:bg-green-600 text-white active:scale-95 animate-pulse' 
                                                        : 'bg-green-50 text-green-400 cursor-not-allowed border border-green-100'
                                                    }`}
                                                >
                                                    {isLive ? (
                                                        <><span>Rejoindre</span> <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></>
                                                    ) : (
                                                        <><span>Bientôt</span> <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></>
                                                    )}
                                                </button>
                                            )}

                                            {isFinished && (
                                                <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed border border-gray-200">
                                                    Terminé
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Planning;
