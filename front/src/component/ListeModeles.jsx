import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import './style/MonProgramme.css'; // Réutilisation du style existant

function ListeModeles({ zone }) {
    const [modeles, setModeles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchModeles = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/modeleSeance', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const filtered = data.filter(m => 
                        Array.isArray(m.tags_zone_corps) && m.tags_zone_corps.includes(decodeURIComponent(zone))
                    );
                    setModeles(filtered);
                } else {
                    console.error("Erreur chargement modèles");
                }
            } catch (error) {
                console.error("Erreur réseau", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchModeles();
    }, [zone]);

    const handleLancer = (idModele) => {
        window.location.href = `/seance-libre/${idModele}`;
    };

    return (
        <div className="page-container">
            <Header />
            <main className="mon-programme-container " style={{ minHeight: '85vh' }}>
                <div className="programme-header">
                    <h1>Séances : {decodeURIComponent(zone)}</h1>
                    <p className="programme-description">Choisissez une séance prédéfinie à réaliser dès maintenant.</p>
                </div>

                <h2 className="section-title">Catalogue</h2>

                {isLoading ? (
                    <div className="app-loading">Chargement des séances...</div>
                ) : modeles.length === 0 ? (
                    <div className="empty-state">
                        <p>Aucune séance disponible pour cette zone.</p>
                        <button className="btn-lancer" onClick={() => window.location.href = '/'}>Retour</button>
                    </div>
                ) : (
                    modeles.map((modele) => (
                        <div key={modele.id} className="session-card">
                            <div className="session-info">
                                <span className="session-date">
                                    {modele.difficulte} • {modele.duree_minutes} min • {modele.tags_equipement ? modele.tags_equipement.join(', ') : 'Aucun matériel'}
                                </span>
                                <h3>{modele.nom}</h3>
                                <p>{modele.description}</p>
                            </div>
                            <button 
                                className="btn-lancer"
                                onClick={() => handleLancer(modele.id)}
                            >
                                Lancer
                            </button>
                        </div>
                    ))
                )}
            </main>
            <Footer />
        </div>
    );
}

export default ListeModeles;
