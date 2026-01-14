import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

function Classement() {
    const [challenges, setChallenges] = useState([]);
    const [selectedChallengeId, setSelectedChallengeId] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState({ leaderboard: [], userRank: null, challenge: null });
    const [isLoading, setIsLoading] = useState(true);
    
    // État pour le formulaire de soumission
    const [showForm, setShowForm] = useState(false);
    const [submissionData, setSubmissionData] = useState({ score: '', url_video_preuve: '' });
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error'

    // Récupérer l'utilisateur courant pour l'appel API
    const getUserId = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            return JSON.parse(atob(token.split('.')[1])).id;
        } catch (e) {
            return null;
        }
    };

    const userId = getUserId();

    // 1. Charger la liste des challenges au montage
    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/classement/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setChallenges(data);
                    if (data.length > 0) {
                        setSelectedChallengeId(data[0].id_classement);
                    }
                }
            } catch (error) {
                console.error("Erreur chargement challenges", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    // 2. Charger le leaderboard quand le challenge sélectionné change
    useEffect(() => {
        if (!selectedChallengeId) return;

        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                const uid = getUserId();
                const response = await fetch(`/api/classement/${selectedChallengeId}/leaderboard?userId=${uid}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboardData(data);
                }
            } catch (error) {
                console.error("Erreur chargement leaderboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [selectedChallengeId]);

    const handleChallengeChange = (e) => {
        setSelectedChallengeId(e.target.value);
        setShowForm(false);
        setSubmitStatus(null);
    };

    const handleSubmission = async (e) => {
        e.preventDefault();
        setSubmitStatus('loading');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/classement/soumettre', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    id_classement: selectedChallengeId,
                    score: Number(submissionData.score),
                    url_video_preuve: submissionData.url_video_preuve
                })
            });

            if (response.ok) {
                setSubmitStatus('success');
                setTimeout(() => {
                    setShowForm(false);
                    setSubmissionData({ score: '', url_video_preuve: '' });
                    setSubmitStatus(null);
                    // Déclencher un re-fetch rapide pour voir son score (optionnel si validation auto)
                }, 2000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        }
    };

    // Helper pour l'affichage du podium
    const renderPodium = () => {
        const top3 = leaderboardData.leaderboard.slice(0, 3);
        // On réorganise pour le visuel : 2ème (gauche), 1er (milieu), 3ème (droite)
        const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

        if (podiumOrder.length === 0) return null;

        return (
            <div className="flex justify-center items-end gap-2 sm:gap-6 mb-8 mt-4 min-h-[180px]">
                {/* 2ND PLACE */}
                {top3[1] && (
                    <div className="flex flex-col items-center animate-[slideUp_0.6s_ease-out]">
                        <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden shadow-lg">
                                <span className="text-xl font-bold text-gray-600">{top3[1].pseudo.charAt(0)}</span>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                2
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-[80px]">{top3[1].pseudo}</p>
                            <p className="text-xs text-gray-500 font-mono">{top3[1].score} <span className="text-[10px]">{leaderboardData.challenge?.unite_mesure}</span></p>
                        </div>
                        <div className="h-16 w-16 sm:w-20 bg-gradient-to-t from-gray-300 to-gray-200 opacity-50 rounded-t-lg mt-2"></div>
                    </div>
                )}

                {/* 1ST PLACE */}
                {top3[0] && (
                    <div className="flex flex-col items-center z-10 -mb-2 animate-[slideUp_0.5s_ease-out]">
                         <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-yellow-400/20">
                                <span className="text-3xl font-bold text-yellow-600">👑</span>
                            </div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                                1
                            </div>
                        </div>
                         <div className="text-center mt-3">
                            <p className="font-bold text-gray-900 text-base sm:text-lg truncate max-w-[100px]">{top3[0].pseudo}</p>
                            <p className="text-sm font-bold text-yellow-600 font-mono">{top3[0].score} <span className="text-xs">{leaderboardData.challenge?.unite_mesure}</span></p>
                        </div>
                        <div className="h-24 w-20 sm:w-24 bg-gradient-to-t from-yellow-200 to-yellow-100 opacity-60 rounded-t-lg mt-2 shadow-inner"></div>
                    </div>
                )}

                {/* 3RD PLACE */}
                {top3[2] && (
                    <div className="flex flex-col items-center animate-[slideUp_0.7s_ease-out]">
                         <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-orange-300 bg-orange-50 flex items-center justify-center overflow-hidden shadow-lg">
                                <span className="text-xl font-bold text-orange-700">{top3[2].pseudo.charAt(0)}</span>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                3
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-[80px]">{top3[2].pseudo}</p>
                            <p className="text-xs text-gray-500 font-mono">{top3[2].score} <span className="text-[10px]">{leaderboardData.challenge?.unite_mesure}</span></p>
                        </div>
                        <div className="h-12 w-16 sm:w-20 bg-gradient-to-t from-orange-200 to-orange-100 opacity-50 rounded-t-lg mt-2"></div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            
            <main className="flex-grow container mx-auto px-4 py-6 max-w-3xl">
                {/* Header Section */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-black mb-4">
                        Classements
                    </h1>
                    
                    <div className="relative inline-block w-full max-w-xs mx-auto">
                        <select 
                            value={selectedChallengeId || ''} 
                            onChange={handleChallengeChange}
                            className="flex w-full px-4 py-3 pr-8 text-base text-black bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-shadow"
                        >
                            {challenges.map(c => (
                                <option className='text-s' key={c.id_classement} value={c.id_classement}>{c.nom}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {isLoading && !leaderboardData.challenge ? (
                     <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                     </div>
                ) : challenges.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg">Aucun défi disponible pour le moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-blue-600">{leaderboardData.challenge?.nom}</h2>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-full">
                                        {leaderboardData.challenge?.type_challenge}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{leaderboardData.challenge?.description}</p>
                                
                                {leaderboardData.userRank ? (
                                    <div className="flex items-center justify-between bg-indigo-600 rounded-xl p-4 text-white shadow-lg transform transition-transform active:scale-[0.99]">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border border-white/20">
                                                #{leaderboardData.userRank.global_rank}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Mon Score</p>
                                                <p className="text-xl font-bold font-mono">{leaderboardData.userRank.score} <span className="text-xs font-normal opacity-70">{leaderboardData.challenge?.unite_mesure}</span></p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowForm(true)}
                                            className="bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-lg transition-colors"
                                            title="Améliorer mon score"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowForm(true)}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                                    >
                                        Participer au défi
                                    </button>
                                )}
                            </div>
                        </div>

                        {showForm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                                <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-[scaleIn_0.3s_ease-out]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Soumettre un score</h3>
                                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleSubmission} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Score ({leaderboardData.challenge?.unite_mesure})</label>
                                            <input 
                                                type="number" 
                                                value={submissionData.score}
                                                onChange={(e) => setSubmissionData({...submissionData, score: e.target.value})}
                                                required 
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Preuve Vidéo (URL)</label>
                                            <input 
                                                type="url" 
                                                value={submissionData.url_video_preuve}
                                                onChange={(e) => setSubmissionData({...submissionData, url_video_preuve: e.target.value})}
                                                required 
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                placeholder="https://..."
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Lien YouTube, Drive, etc.</p>
                                        </div>

                                        {submitStatus === 'error' && (
                                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Erreur lors de l'envoi. Réessayez.
                                            </div>
                                        )}
                                        {submitStatus === 'success' && (
                                            <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                Score envoyé ! Validation en cours.
                                            </div>
                                        )}

                                        <button 
                                            type="submit" 
                                            disabled={submitStatus === 'loading'}
                                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-2"
                                        >
                                            {submitStatus === 'loading' ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Envoi...
                                                </span>
                                            ) : 'Valider ma performance'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="pb-20">
                            {renderPodium()}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            
                                <div className="divide-y divide-gray-100">
                                    {leaderboardData.leaderboard.length > 0 ? (
                                        leaderboardData.leaderboard.slice(3).map((entry, index) => (
                                            <div key={entry.id_classement_user} className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${entry.id_utilisateur === userId ? 'bg-blue-50/50' : ''}`}>
                                                <div className="w-8 font-bold text-gray-400 text-center mr-4">
                                                    #{index + 4}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold mr-4 text-sm">
                                                    {entry.pseudo.charAt(0)}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className={`font-semibold ${entry.id_utilisateur === userId ? 'text-blue-700' : 'text-gray-800'}`}>
                                                        {entry.pseudo} 
                                                        {entry.id_utilisateur === userId && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wide">Moi</span>}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 font-mono">{entry.score}</p>
                                                    {entry.url_video_preuve && (
                                                        <a href={entry.url_video_preuve} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center justify-end gap-1 mt-0.5">
                                                            <span>Preuve</span>
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : leaderboardData.leaderboard.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">
                                            Soyez le premier à participer !
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-400 text-sm">
                                            Fin du classement.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <Footer />

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default Classement;