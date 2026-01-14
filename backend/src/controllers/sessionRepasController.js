const SessionRepas = require('../models/Session_repas');
const SessionRepasPlat = require('../models/Session_repas_plat');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class SessionRepasController {
    create = withTransaction(async (req, res, client) => {
        const { nom, type_repas, date_repas, heure_repas, id_programme_a, notes } = req.body;
        const newSessionRepas = await SessionRepas.create({ nom, type_repas, date_repas, heure_repas, id_programme_a, notes }, client);
        res.status(201).json({
            message: 'Session repas créée avec succès',
            sessionRepas: newSessionRepas
        });
    });

    update = withTransaction(async (req, res, client) => {
        const id_session_repas = req.params.id;
        const { nom, type_repas, date_repas, heure_repas, id_programme_a, notes } = req.body;
        const updatedSessionRepas = await SessionRepas.update(id_session_repas, { nom, type_repas, date_repas, heure_repas, id_programme_a, notes }, client);
        res.status(200).json({
            message: 'Session repas mise à jour avec succès',
            sessionRepas: updatedSessionRepas
        });
    });

    delete = withTransaction(async (req, res, client) => {
        const id_session_repas = req.params.id;
        const deletedSessionRepas = await SessionRepas.delete(id_session_repas, client);
        res.status(200).json({
            message: 'Session repas supprimée avec succès',
            sessionRepas: deletedSessionRepas
        });
    });

    getByIdProgrammeAli = withClient(async (req, res, client) => {
        const id_programme_a = req.params.id;
        const query = 'SELECT * FROM session_repas WHERE id_programme_a = $1';
        const result = await client.query(query, [id_programme_a]);
        res.status(200).json(result.rows);
    });

    addPlatToSession = withTransaction(async (req, res, client) => {
        const id_session_repas = req.params.id;
        const { type_element, id_element, ordre, quantite, notes } = req.body;
        const newSessionRepasPlat = await SessionRepasPlat.create({ id_session_repas, type_element, id_element, ordre, quantite, notes }, client);
        res.status(201).json({
            message: 'Plat ajouté à la session repas avec succès',
            sessionRepasPlat: newSessionRepasPlat
        });
    });

    updateSessionRepasPlat = withTransaction(async (req, res, client) => {
        const id_session_repas_plats = req.params.id;
        const { id_session_repas, type_element, id_element, ordre, quantite, notes } = req.body;
        const updatedSessionRepasPlat = await SessionRepasPlat.update(id_session_repas_plats, { id_session_repas, type_element, id_element, ordre, quantite, notes }, client);
        res.status(200).json({
            message: 'Plat de la session repas mis à jour avec succès',
            sessionRepasPlat: updatedSessionRepasPlat
        });
    });

    deleteSessionRepasPlat = withTransaction(async (req, res, client) => {
        const id_session_repas_plats = req.params.id;
        const deletedSessionRepasPlat = await SessionRepasPlat.delete(id_session_repas_plats, client);
        res.status(200).json({
            message: 'Plat de la session repas supprimé avec succès',
            sessionRepasPlat: deletedSessionRepasPlat
        });
    });

    getPlatsBySessionRepasId = withClient(async (req, res, client) => {
        const id_session_repas = req.params.id;
        const sessionRepasPlats = await SessionRepasPlat.getPlatsBySessionRepasId(id_session_repas, client);
        res.status(200).json(sessionRepasPlats);
    });

    getDetailsPlatsSessionRepas = withClient(async (req, res, client) => {
        const id_session_repas = req.params.id;
        const platDetails = await SessionRepasPlat.findDetailsBySessionRepasId(id_session_repas, client);
        res.status(200).json(platDetails);
    });
}

module.exports = SessionRepasController;