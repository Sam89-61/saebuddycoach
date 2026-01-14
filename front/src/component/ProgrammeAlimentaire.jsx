import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const ProgrammeAlimentaire = () => {
    const [programme, setProgramme] = useState(null);
    const [allSessions, setAllSessions] = useState([]);
    const [repasDuJour, setRepasDuJour] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailsRepas, setDetailsRepas] = useState({});
    const [openRecipes, setOpenRecipes] = useState({});
    const navigate = useNavigate();

    // Mapping des images par défaut
    const getDefaultImage = (type) => {
        if (type === 'Entree') return '/media/Entrées/Entre1.png';
        if (type === 'Dessert') return '/media/Desserts/Dessert1.png';
        return '/media/Plats/Plat1.png';
    };

    const toggleRecipe = (itemId) => {
        setOpenRecipes(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    // Formater la date pour l'affichage
    const formatDate = (date) => {
        return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    useEffect(() => {
        const fetchProgramme = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('/api/programme/mon-programme', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProgramme(data.programme);

                    if (data.sessionRepas) {
                        setAllSessions(data.sessionRepas);
                    }
                } else if (response.status === 404) {
                    setError("Vous n'avez pas encore de programme alimentaire généré.");
                } else {
                    setError("Erreur lors du chargement du programme.");
                }
            } catch (err) {
                console.error(err);
                setError("Erreur de connexion au serveur.");
            } finally {
                setLoading(false);
            }
        };

        fetchProgramme();
    }, [navigate]);

    // Effet pour filtrer les repas quand la date ou les sessions changent
    useEffect(() => {
        if (allSessions.length > 0) {
            const dateString = selectedDate.toISOString().split('T')[0];

            const mealsForDate = allSessions.filter(session => {
                if (!session.date_repas) return false;
                const sessionDate = session.date_repas.split('T')[0];
                return sessionDate === dateString;
            });

            // Trier par heure
            mealsForDate.sort((a, b) => {
                if (a.heure_repas && b.heure_repas) {
                    return a.heure_repas.localeCompare(b.heure_repas);
                }
                return 0;
            });

            setRepasDuJour(mealsForDate);

            // Charger les détails si pas encore en cache
            const token = localStorage.getItem('token');
            mealsForDate.forEach(session => {
                if (!detailsRepas[session.id_session_repas]) {
                    fetchDetailsSession(session.id_session_repas, token);
                }
            });
        } else {
            setRepasDuJour([]);
        }
    }, [selectedDate, allSessions]);

    const fetchDetailsSession = async (sessionId, token) => {
        try {
            const response = await fetch(`/api/sessionRepas/plat/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const plats = await response.json();
                setDetailsRepas(prev => ({
                    ...prev,
                    [sessionId]: plats
                }));
            }
        } catch (err) {
            console.error("Erreur chargement plats:", err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-500 font-medium">
            Chargement de votre nutrition...
        </div>
    );

    // Si pas de programme ou erreur
    if (error || !programme) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center p-6">
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl shadow-sm max-w-md w-full text-center border border-red-100">
                        <p className="font-medium">
                            {error ? error : "Vous n'avez pas encore de programme alimentaire généré."}
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Header />

            <main className="flex-grow w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 " style={{ minHeight: '83vh' }}>

                <header className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-200/50 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                            {programme.nom || 'Mon Programme'}
                        </h1>

                    </div>
                </header>

                <div className="flex items-center justify-between bg-white p-2 rounded-full shadow-sm border border-gray-100">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-3 w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-[#FF5E62] transition-colors active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    <h2 className="text-lg font-bold text-gray-800 capitalize">
                        {formatDate(selectedDate)}
                    </h2>

                    <button
                        onClick={() => changeDate(1)}
                        className="p-3 w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-[#FF5E62] transition-colors active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                <section className="space-y-6">
                    {repasDuJour.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">Aucun repas prévu pour ce jour.</p>
                            <p className="text-sm text-gray-400 mt-1">Profitez-en pour boire de l'eau ! 💧</p>
                        </div>
                    ) : (
                        repasDuJour.map(session => (
                            <div key={session.id_session_repas} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 duration-300">
                                <div className="bg-gray-50/80 px-5 py-4 flex justify-between items-center border-b border-gray-100">
                                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                        <span className="w-2 h-6 bg-indigo-600 rounded-full block"></span>
                                        {session.nom}
                                    </h3>
                                    <span className="text-sm font-semibold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                                        {session.heure_repas?.substring(0, 5)}
                                    </span>
                                </div>

                                <div className="p-5">
                                    {/* Liste des plats */}
                                    {detailsRepas[session.id_session_repas] ? (
                                        detailsRepas[session.id_session_repas].length > 0 ? (
                                            <div className="space-y-4">
                                                {detailsRepas[session.id_session_repas].map((item, index) => {
                                                    const uniqueId = `${session.id_session_repas}-${index}`;
                                                    return (
                                                        <div key={index} className="flex flex-col gap-2 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                                                            <div className="flex gap-4 items-start group">
                                                                <img
                                                                    src={getDefaultImage(item.type_element)}
                                                                    alt="Plat"
                                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/media/bouffe.png' }}
                                                                />
                                                                <div className="flex-1 min-w-0 pt-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h4 className="font-bold text-gray-800 text-base leading-tight truncate pr-2">
                                                                            {item.nom_element || "Plat sans nom"}
                                                                        </h4>
                                                                        {console.log(item)}
                                                                        {item.calories && (
                                                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                                                {item.calories} kcal
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-sm text-gray-500 mb-2">
                                                                        Portion : <span className="font-medium text-gray-700">{item.quantite}g</span>
                                                                    </p>

                                                                    <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-gray-500 font-medium items-center">
                                                                        {item.glucide > 0 && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Glu: {item.glucide}g</span>}
                                                                        {item.proteine > 0 && <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">Prot: {item.proteine}g</span>}
                                                                        {item.lipide > 0 && <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">Lip: {item.lipide}g</span>}
                                                                        {console.log(item.recette)}

                                                                        {item.recette && (
                                                                            <button
                                                                                onClick={() => toggleRecipe(uniqueId)}
                                                                                className="ml-auto flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-full transition-colors text-xs font-bold border border-indigo-100"
                                                                            >
                                                                                Recette {openRecipes[uniqueId] ? '▲' : '▼'}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {item.notes && (
                                                                        <p className="mt-2 text-xs text-gray-400 italic border-l-2 border-gray-200 pl-2">
                                                                            {item.notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {openRecipes[uniqueId] && item.recette && (
                                                                <div className="mt-2 mx-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm text-gray-700 animate-fadeIn">
                                                                    <h5 className="font-bold text-indigo-800 mb-1 text-xs uppercase tracking-wide">Préparation :</h5>
                                                                    <p className="leading-relaxed whitespace-pre-line">{item.recette}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-center italic text-sm">Aucun aliment listé pour ce repas.</p>
                                        )
                                    ) : (
                                        <div className="animate-pulse space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                                                <div className="flex-1 space-y-2 py-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {session.notes && (
                                        <div className="mt-4 bg-yellow-50 text-yellow-700 text-sm p-3 rounded-xl flex items-start gap-2">
                                            <span>📝</span>
                                            <p>{session.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </section>

            </main>
            <Footer />
        </>);
};

export default ProgrammeAlimentaire;
