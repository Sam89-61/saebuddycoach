import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Accueil from './component/Accueil.jsx';
import FormProfil from './component/FormProfil.jsx';
import Form_Inscr from './component/Form_Inscr.jsx';
import Form_Co from './component/Form_Co.jsx';
import MonProgrammeSport from './component/MonProgrammeSport.jsx';
import SessionManager from './component/SessionManager.jsx';
import ListeModeles from './component/ListeModeles.jsx';
import Classement from './component/Classement.jsx';
import AdminDashboard from './component/AdminDashboard.jsx';
import ScanExo from './component/scanExo.jsx';
import VideoEvent from './component/VideoEvent.jsx';
import Planning from './component/Planning.jsx';

import ProgrammeAlimentaire from './component/ProgrammeAlimentaire.jsx';
import ProfilPage from './component/ProfilPage.jsx';

/**
 * Composant de protection des routes qui nécessitent une authentification
 */
function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/inscription" replace />;
  }
  
  return children;
}

/**
 * Composant de gestion des routes selon le profil utilisateur
 */
function ProfileRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');
  const [hasProfile, setHasProfile] = useState(null); // null = pas encore vérifié
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction utilitaire pour décoder le JWT
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return e;
    }
  };

  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const decoded = parseJwt(token);
      
      if (!decoded || !decoded.id) {
        // Token invalide => Logout forcé
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }

      // Vérification Admin
      if (decoded.role === 'admin') {
          setIsAdmin(true);
      }

      try {
        const response = await fetch(`/api/profil/getProfilByUser/${decoded.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          // Le backend retourne un tableau dans result.data
          // S'il y a au moins un élément, c'est que le profil existe
          if (result.data && result.data.length > 0) {
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } else if (response.status === 401 || response.status === 403) {
          // Token invalide ou Utilisateur supprimé côté serveur
          console.warn("Session expirée ou utilisateur invalide.");
          localStorage.removeItem('token');
          localStorage.removeItem('userPseudo');
          navigate('/login', { replace: true });
          return;
        } else {
          // Autre erreur API (500, etc.) -> on considère pas de profil par sécurité
          setHasProfile(false);
        }
      } catch (error) {
        console.error("Erreur vérification profil:", error);
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [isAuthenticated, navigate]);

  // Gestion des redirections une fois le chargement terminé
  useEffect(() => {
    if (isLoading) return; // On attend la fin de la vérification

    // 1. Si l'utilisateur est CONNECTÉ
    if (isAuthenticated) {
      
      // Protection Route Admin
      if (location.pathname === '/admin' && !isAdmin) {
          navigate('/', { replace: true });
          return;
      }

      // Cas A : Il a un profil
      if (hasProfile === true) {
        // Il ne doit PAS accéder à la création de profil ni au login/inscription
        if (location.pathname === '/creation-profil' || location.pathname === '/login' || location.pathname === '/inscription') {
          navigate('/', { replace: true });
        }
      }
      
      // Cas B : Il N'A PAS de profil
      else if (hasProfile === false) {
        // Il DOIT aller sur la création de profil (sauf s'il y est déjà)
        if (location.pathname !== '/creation-profil') {
          navigate('/creation-profil', { replace: true });
        }
      }
    } 
    // 2. Si l'utilisateur N'EST PAS CONNECTÉ
    else {
      const publicPaths = ['/inscription', '/login'];
      if (!publicPaths.includes(location.pathname)) {
        navigate('/inscription', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, hasProfile, location.pathname, isAdmin, navigate]);

  if (isLoading) {
    return <div className="app-loading">Chargement...</div>;
  }

  // Rendu de la vue
  const renderView = () => {
    if (isAuthenticated) {
      
      // Route Admin Prioritaire
      if (location.pathname === '/admin' && isAdmin) {
          return <AdminDashboard />;
      }

      // Si l'utilisateur est connecté, on décide QUOI afficher uniquement basés sur l'existence du profil.
      // On IGNORE l'URL ici pour éviter le "flash" de contenu interdit pendant la redirection.
      
      if (hasProfile) {
        if (location.pathname === '/mon-programme-sport') {
            return <MonProgrammeSport />;
        }
        if(location.pathname === '/mon-programme-alimentaire') {
            return <ProgrammeAlimentaire />;
        }
                        if (location.pathname === '/Evenement') {
                            return <Planning />;
                        }
                        if (location.pathname.startsWith('/join-event/')) {                    return <VideoEvent />;
                }
                if (location.pathname.startsWith('/session/')) {
            return <SessionManager />;
        }
        if (location.pathname === '/classement') {
            return <Classement />;
        }
        if(location.pathname === '/profil') {
            return <ProfilPage />
        }
        
        if (location.pathname === '/scan' || location.pathname === '/scan-exo') {
            return <ScanExo />;
        }
        if (location.pathname.startsWith('/modeles/')) {
            const zone = location.pathname.split('/')[2];
            return <ListeModeles zone={zone} />;
        }
        if (location.pathname.startsWith('/seance-libre/')) {
            return <SessionManager mode="libre" />;
        }
        // S'il a un profil, il ne doit voir que l'interface principale (Accueil)
        // Même s'il est sur /creation-profil, on affiche Accueil en attendant que le useEffect le redirige.
        return <Accueil />;
      } else {
        // S'il n'a PAS de profil, il ne doit voir QUE le formulaire de création
        // Même s'il est sur / (Accueil), on affiche FormProfil en attendant la redirection.
        return <FormProfil />;
      }
    } 
    
    // Non connecté
    else {
      if (location.pathname === '/login') {
        return <Form_Co />;
      }
      // Par défaut : Inscription
      return <Form_Inscr onRegisterSuccess={() => navigate('/creation-profil')} />;
    }
  };

  return (
    <>
        {renderView()}
    </>
  );
}

/**
 * Application BuddyCoach principale avec Router
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app-container min-h-screen">
        <Routes>
          {/* Routes publiques */}
          <Route path="/inscription" element={<ProfileRouter />} />
          <Route path="/login" element={<ProfileRouter />} />
          
          {/* Routes protégées */}
          <Route path="/*" element={
            <ProtectedRoute>
              <ProfileRouter />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;