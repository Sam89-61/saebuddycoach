import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
// import './style/MonProgramme.css'; // Replaced by Tailwind CSS

function MonProgramme() {
    const [programmeData, setProgrammeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgramme = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
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
                    setProgrammeData(data);
                } else if (response.status === 404) {
                    setError("Vous n'avez pas encore de programme généré.");
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
    }, []);



    const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isFuture = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // On reset l'heure pour comparer juste les jours
        return date >= today;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen text-indigo-600 font-medium text-lg">
            Chargement de votre programme...
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center p-8 bg-gray-100 rounded-xl max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oups !</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button 
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full" 
                            onClick={() => window.location.href = '/'}
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const { programme, programmeSportif, sessions } = programmeData;

    // Filtrage des sessions
    const todaySession = sessions.find(s => isToday(s.date_session));
    const upcomingSessions = sessions.filter(s => isFuture(s.date_session) && !isToday(s.date_session));

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header />
            <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-6 pb-24">
                
                {/* EN-TÊTE PROGRAMME */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2 leading-tight">
                        {programmeSportif ? programmeSportif.nom : programme.nom}
                    </h1>
                    <p className="text-gray-500 italic text-sm md:text-base">
                        {programmeSportif ? programmeSportif.description : programme.description}
                    </p>
                </div>

                {/* SECTION SEANCE DU JOUR */}
                <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-6 mt-8">
                    Aujourd'hui
                </h2>
                
                {todaySession ? (
                    <div className={`
                        relative overflow-hidden rounded-2xl p-6 mb-8 transition-all duration-300
                        flex flex-col md:flex-row md:items-center md:justify-between
                        ${todaySession.finish 
                            ? 'bg-white border border-gray-200 shadow-sm opacity-75' 
                            : 'bg-indigo-50 border-2 border-indigo-500 shadow-md transform hover:scale-[1.01]'
                        }
                    `}>
                        <div className="flex-1 mb-4 md:mb-0">
                            <span className="inline-block text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1">
                                Séance du Jour
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {todaySession.nom}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {todaySession.description}
                            </p>
                            <div className="flex items-center text-gray-500 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {todaySession.duree_minutes} min
                            </div>
                        </div>

                        <div className="md:ml-6 flex-shrink-0 w-full md:w-auto">
                            {todaySession.finish ? (
                                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center font-medium border border-green-200 w-full">
                                    Séance Terminée ✅
                                </div>
                            ) : (
                                <button
                                    className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
                                    onClick={() => window.location.href = `/session/${todaySession.id_session_sport}`}
                                    disabled={todaySession.finish}
                                >
                                    Lancer la séance
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100 mb-8">
                        <p className="text-gray-400 font-medium">Aucune séance prévue pour aujourd'hui. Reposez-vous ! 😴</p>
                    </div>
                )}

                {/* SECTION PROCHAINES SEANCES */}
                <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-6 mt-10">
                    Prochaines Séances
                </h2>

                <div className="space-y-4">
                    {upcomingSessions.length > 0 ? (
                        upcomingSessions.map(session => (
                            <div key={session.id_session_sport} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between">
                                <div className="mb-2 md:mb-0">
                                    <span className="block text-indigo-600 font-semibold text-sm mb-1 capitalize">
                                        {new Date(session.date_session).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </span>
                                    <h3 className="text-lg font-bold text-gray-800">{session.nom}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{session.description}</p>
                                </div>
                                {/* Placeholder pour future action */}
                                {/* <div className="mt-3 md:mt-0 md:ml-4 text-gray-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div> */}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-xl">
                            <p className="text-gray-400">Vous avez terminé toutes vos séances ! Bravo ! 🏆</p>
                        </div>
                    )}
                </div>

            </main>
            <Footer />
        </div>
    );
}

export default MonProgramme;