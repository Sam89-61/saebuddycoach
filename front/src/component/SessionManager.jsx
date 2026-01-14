import React, { useState, useEffect } from 'react';
import Seance from './Seance';
import Repos from './Repos';
import './style/SessionManager.css';
import Header from './Header';
import Footer from './Footer';

function SessionManager({ mode }) {
    const [sessionId, setSessionId] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentExerciceIndex, setCurrentExerciceIndex] = useState(0);
    const [currentSerie, setCurrentSerie] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isAlreadyDone, setIsAlreadyDone] = useState(false);

    useEffect(() => {
        const parts = window.location.pathname.split('/');
        const id = parts[parts.length - 1];

        if (!id || isNaN(id)) {
            setError("ID invalide");
            setLoading(false);
            return;
        }
        setSessionId(id);

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                if (mode === 'libre') {
                    // --- MODE SÉANCE LIBRE (Modèle) ---
                    // 1. Récupérer les infos du modèle
                    const respModel = await fetch(`/api/modeleSeance/${id}`, { headers });
                    if (!respModel.ok) throw new Error("Modèle introuvable");
                    const modelInfo = await respModel.json();

                    // 2. Récupérer les exos du modèle
                    const respExos = await fetch(`/api/modeleSeance/${id}/exos`, { headers });
                    if (!respExos.ok) throw new Error("Exos du modèle introuvables");
                    const rawExos = await respExos.json();

                    // 3. Adapter les données pour correspondre au format attendu par Seance.jsx
                    const adaptedExos = rawExos.map(exo => ({
                        ...exo,
                        description: exo.description_exo, // Mapping
                        img: exo.img_exo, // Mapping
                        // Les autres champs (series, repetitions, notes) sont déjà là
                    }));

                    setSessionData({
                        session: {
                            nom: modelInfo.nom,
                            duree_minutes: modelInfo.duree_minutes,
                            description: modelInfo.description,
                            tags_zone_corps: modelInfo.tags_zone_corps, // Ajouté ici
                            finish: false // Une séance libre n'est jamais "déjà finie" au chargement
                        },
                        exercices: adaptedExos
                    });

                } else {
                    // --- MODE NORMAL (Session planifiée) ---
                    const response = await fetch(`/api/sessionSport/details/${id}`, { headers });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.session.finish) {
                            setIsAlreadyDone(true);
                        }
                        setSessionData(data);
                    } else {
                        setError("Impossible de charger la séance.");
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Erreur de chargement.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [mode]);

    const currentExo = sessionData ? sessionData.exercices[currentExerciceIndex] : null;

    const handleExoFinished = () => {
        setIsResting(true);
    };

    const handleRestFinished = async () => {
        setIsResting(false);

        const currentSeriesNum = Number(currentSerie);
        const totalSeriesNum = Number(currentExo.series);

        if (currentSeriesNum < totalSeriesNum) {
            setCurrentSerie(prev => prev + 1);
        } else {
            if (currentExerciceIndex < sessionData.exercices.length - 1) {
                setCurrentSerie(1);
                setCurrentExerciceIndex(prev => prev + 1);
            } else {
                // SÉANCE TERMINÉE
                if (mode !== 'libre') {
                    // On ne valide en base que si ce n'est PAS une séance libre
                    try {
                        const token = localStorage.getItem('token');
                        await fetch(`/api/sessionSport/${sessionId}/complete`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    } catch (err) {
                        console.error("Erreur validation", err);
                    }
                }
                setIsFinished(true);
            }
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-xl font-semibold text-gray-700">Préparation de votre séance... 🏋️‍♂️</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-600 text-lg">{error} <a href="/" className="ml-2 underline text-indigo-600">Retour</a></div>;
    if (!sessionData) return <div className="flex items-center justify-center min-h-screen text-gray-600">Aucune donnée.</div>;

    if (isFinished) {
        const returnPath = (mode === 'libre' && sessionData.session.tags_zone_corps)
            ? `/modeles/${encodeURIComponent(sessionData.session.tags_zone_corps[0])}`
            : '/mon-programme';

        return (
            <div className="text-center py-12 px-5">
                <Header />
                <div className="bg-white p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] max-w-[500px] mx-auto">
                    <h1 className="text-green-500 text-4xl font-bold mb-5">Bravo ! 🎉</h1>
                    <p className="text-gray-700 mb-3 text-lg">Vous avez terminé la séance <strong>{sessionData.session.nom}</strong>.</p>
                    <p className="text-gray-600 mb-5">Temps estimé : {sessionData.session.duree_minutes} min</p>
                    <button
                        className="bg-indigo-600 text-white px-8 py-3 text-lg rounded-full font-semibold hover:bg-indigo-700 transition-all duration-200 active:scale-95"
                        onClick={() => window.location.href = returnPath}
                    >
                        {mode === 'libre' ? "Retour aux séances" : "Retour au programme"}
                    </button>
                </div>
            </div>
        );
    }

    // Calcul du nom de la prochaine étape pour l'affichage repos
    const currentSeriesNum = Number(currentSerie);
    const totalSeriesNum = Number(currentExo ? currentExo.series : 0);

    let nextStepName = "Fin de séance";
    if (currentSeriesNum < totalSeriesNum) {
        nextStepName = `Série ${currentSeriesNum + 1}`;
    } else if (currentExerciceIndex < sessionData.exercices.length - 1) {
        nextStepName = sessionData.exercices[currentExerciceIndex + 1].nom_exercice;
    }

    return (
        <div className={`min-h-screen flex flex-col font-['Poppins',sans-serif] transition-colors duration-300 ${
            isResting ? 'bg-indigo-600 text-gray-50' : 'bg-white text-gray-800'
        }`}>
            <Header />
            <main className="flex-1 flex flex-col items-center p-5 max-w-[600px] mx-auto w-full justify-around">
                <div className="w-full h-2.5 bg-gray-200 rounded-md mb-5 overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${((currentExerciceIndex) / sessionData.exercices.length) * 100}%` }}
                    ></div>
                </div>

                {isResting ? (
                    <Repos
                        nextExo={handleRestFinished}
                        restTime={currentExo.temps_repos_secondes || 60}
                        nextExoName={nextStepName}
                    />
                ) : (
                    <Seance
                        exercice={currentExo}
                        exerciceIndex={currentExerciceIndex + 1}
                        totalExos={sessionData.exercices.length}
                        currentSerie={currentSerie}
                        isAlreadyDone={isAlreadyDone}
                        onExoFini={handleExoFinished}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
}

export default SessionManager;