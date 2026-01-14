const SessionSport = require('../models/Session_sport');
const SessionSportExo = require('../models/Session_sport_exo');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class SessionSportController {
    createSessionSport = withTransaction(async (req, res, client) => {
        const { nom, description, date_session, heure_session, duree_minutes, id_programme_sportif } = req.body;
        const newSessionSport = await SessionSport.create({ nom, description, date_session, heure_session, duree_minutes, id_programme_sportif }, client);
        res.status(201).json({
            message: 'Session sportive créée avec succès',
            sessionSport: newSessionSport
        });
    });

    updateSessionSport = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const { nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif } = req.body;
        const updatedSessionSport = await SessionSport.update(id_session_sport, { nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif }, client);
        res.status(200).json({
            message: 'Session sportive mise à jour avec succès',
            sessionSport: updatedSessionSport
        });
    });

    deleteSessionSport = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const deletedSessionSport = await SessionSport.delete(id_session_sport, client);
        res.status(200).json({
            message: 'Session sportive supprimée avec succès',
            sessionSport: deletedSessionSport
        });
    });

    addExosToSession = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const { id_exo, ordre, repetitions, series, temps_repos_secondes, notes } = req.body;
        const newSessionSportExo = await SessionSportExo.create({ id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes, notes }, client);
        res.status(201).json({
            message: 'Exercice ajouté à la session sportive avec succès',
            sessionSportExo: newSessionSportExo
        });
    });

    updateSessionSportExo = withTransaction(async (req, res, client) => {
        const id_session_sport_exo = req.params.id;
        const { id_exo, id_session_sport, ordre, repetitions, series, temps_repos_secondes, notes } = req.body;
        const updatedSessionSportExo = await SessionSportExo.update(id_session_sport_exo, { id_exo, id_session_sport, ordre, repetitions, series, temps_repos_secondes, notes }, client);
        res.status(200).json({
            message: 'Exercice de la session sportive mis à jour avec succès',
            sessionSportExo: updatedSessionSportExo
        });
    });

    deleteSessionSportExo = withTransaction(async (req, res, client) => {
        const id_session_sport_exo = req.params.id;
        const deletedSessionSportExo = await SessionSportExo.delete(id_session_sport_exo, client);
        res.status(200).json({
            message: 'Exercice de la session sportive supprimé avec succès',
            sessionSportExo: deletedSessionSportExo
        });
    });

    getExosBySessionSportId = withClient(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const sessionSportExos = await SessionSportExo.getExosBySessionSportId(id_session_sport, client);
        res.status(200).json(sessionSportExos);
    });

    getSessionDetails = withClient(async (req, res, client) => {
        const id_session_sport = req.params.id;
        
        // 1. Infos Session
        const session = await SessionSport.findById(id_session_sport, client);
        if (!session) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        // 2. Exercices détaillés
        const exercices = await SessionSportExo.findDetailsBySessionId(id_session_sport, client);

        res.status(200).json({
            session,
            exercices
        });
    });

    completeSession = withTransaction(async (req, res, client) => {
        const id_session_sport = req.params.id;
        const result = await SessionSport.markAsRealized(id_session_sport, client);

        if (!result) {
            return res.status(404).json({ message: 'Session non trouvée' });
        }

        res.status(200).json({
            message: 'Session marquée comme réalisée',
            session: result
        });
    });
}

module.exports = SessionSportController;