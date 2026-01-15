import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import silhouette from '../../media/silhouette.png';
import jambesImg from '../../media/seance/jambe.png';
import abdoImg from '../../media/seance/buste.png';
import cardioImg from '../../media/seance/cardio.png';
import bouffe from '../../media/bouffe.png';

function Accueil() {
    const [userName] = useState(() => {
        return localStorage.getItem('userPseudo') || "Utilisateur";
    });
    const [muscleGroups, setMuscleGroups] = useState([]);

    useEffect(() => {
        const Seance = async () => {
            try {
                const token = localStorage.getItem('token');
                const reponse = await fetch('/api/modeleSeance', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (reponse.ok) {
                    const data = await reponse.json();
                    const allZones = data.flatMap(modele => modele.tags_zone_corps);
                    const uniqueZones = [...new Set(allZones)];
                    setMuscleGroups(uniqueZones);
                } else {
                    console.error("Erreur lors du chargement des séances.");
                }
            } catch (err) {
                console.error("Erreur de connexion au serveur.");
            }
        };
        Seance();
    }, []);

    // Mapper les images aux groupes musculaires
    const getImageForMuscle = (muscle) => {
        const muscleLower = muscle.toLowerCase();
        if (muscleLower.includes('jambe') || muscleLower.includes('leg')) return jambesImg;
        if (muscleLower.includes('haut du corps') || muscleLower.includes('torse') || muscleLower.includes('buste')) return abdoImg;
        if (muscleLower.includes('bras') || muscleLower.includes('arm')) return cardioImg;
        if (muscleLower.includes('pectoraux') || muscleLower.includes('chest')) return abdoImg;
        return cardioImg; // Image par défaut
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 px-4 py-6 pb-24 max-w-md mx-auto w-full">
                {/* Grand bouton Programme */}
                <button
                    onClick={() => window.location.href = '/mon-programme-sport'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-6 mb-8 shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <div className="flex items-center justify-center gap-3">
                        <img
                            src={silhouette}
                            alt="Programme"
                            className="w-12 h-12 filter brightness-0 invert"
                        />
                        <span className="text-xl font-bold">Programme Sport</span>
                    </div>
                </button>
                <button
                    onClick={() => window.location.href = '/mon-programme-alimentaire'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-6 mb-8 shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    <div className="flex items-center justify-center gap-3">
                        <img
                            src={bouffe}
                            alt="Programme"
                            className="w-10 h-10 filter brightness-0 invert"
                        />
                        <span className="text-xl font-bold">Programme Alimentaire</span>
                    </div>
                </button>

                {/* Section Séances */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Séances :</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {muscleGroups.slice(0, 4).map((muscle) => (
                            <button
                                key={muscle}
                                onClick={() => window.location.href = `/modeles/${encodeURIComponent(muscle)}`}
                                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 aspect-square"
                                style={{
                                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${getImageForMuscle(muscle)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white text-xl font-bold text-shadow">
                                        {muscle}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Boutons Classement et Évènement */}
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/classement'}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Classement
                    </button>
                    <button
                        onClick={() => window.location.href = '/Evenement'}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Évènement
                    </button>
                </div>
            </main>

            <Footer />

            {/* Style pour l'ombre du texte */}
            <style>{`
                .text-shadow {
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                }
            `}</style>
        </div>
    );
}

export default Accueil;