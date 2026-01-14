const Evenement = require('../models/Evenement');
const Participation = require('../models/Participation');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class EvenementController {

    createEvenement = withTransaction(async (req, res, client) => {
        const { nom, description, date, lieu, heure, duree, categorie } = req.body;
        // On récupère l'ID de l'utilisateur connecté via le token (req.user ajouté par le middleware auth)
        const userId = req.user ? req.user.id : null; 
        
        if (!userId) {
            throw new Error("Utilisateur non identifié. Token manquant ?");
        }

        const newEvenement = await Evenement.create({ nom, description, date, lieu, heure, duree, categorie }, userId, client);
        res.status(201).json({
            message: 'Événement créé avec succès',
            evenement: newEvenement
        });
    });

    updateEvenement = withTransaction(async (req, res, client) => {
        const id_evenement = req.params.id;
        const { nom, description, date, lieu, heure, duree, categorie } = req.body;
        const updatedEvenement = await Evenement.update(id_evenement, { nom, description, date, lieu, heure, duree, categorie }, client);
        res.status(200).json({
            message: 'Événement mis à jour avec succès',
            evenement: updatedEvenement
        });
    });

    deleteEvenement = withTransaction(async (req, res, client) => {
        const id_evenement = req.params.id;
        const deletedEvenement = await Evenement.delete(id_evenement, client);
        res.status(200).json({
            message: 'Événement supprimé avec succès',
            evenement: deletedEvenement
        });
    });

    getAllEvenements = withClient(async (req, res, client) => {
        const evenements = await Evenement.findAll(client);
        res.status(200).json({
            message: 'Événements récupérés avec succès',
            evenements
        });
    });

    addParticipation = withTransaction(async (req, res, client) => {
        const { id_utilisateur, id_evenement, statut } = req.body; // fixed typo status -> statut
        // Actually body might send 'status' or 'statut'. Controller originally read 'status'. Model expects 'statut'.
        // Let's check original controller: 
        // const { id_utilisateur, id_evenement,status } = req.body;
        // const newParticipation = await Participation.create({ id_utilisateur, id_evenement, status }, client);
        // And model Participation.create: const { id_evenement, id_utilisateur, statut } = participationData;
        // So original code was passing { status: ... } but model expected { statut: ... }. This was a bug.
        // I will assume the input should be 'statut' or map 'status' to 'statut'.
        // Let's use 'statut' to be consistent with French DB schema.
        
        const participationData = {
             id_utilisateur, 
             id_evenement, 
             statut: statut || req.body.status 
        };
        
        const newParticipation = await Participation.create(participationData, client);
        res.status(201).json({
            message: 'Participation enregistrée avec succès',
            participation: newParticipation
        });
    });

    updateParticipation = withTransaction(async (req, res, client) => {
        const { id_evenement, id_utilisateur, statut } = req.body;
        
        // La méthode update attend: id_evenement, id_utilisateur, participationData
        const updatedParticipation = await Participation.update(id_evenement, id_utilisateur, { statut }, client);
        
        if (!updatedParticipation) {
             return res.status(404).json({ message: 'Participation non trouvée' });
        }

        res.status(200).json({
            message: 'Participation mise à jour avec succès',
            participation: updatedParticipation
        });
    });

    deleteParticipation = withTransaction(async (req, res, client) => {
        // On récupère les IDs via le body ou les query params (plus REST)
        // Pour DELETE, on autorise les query params: ?id_evenement=X&id_utilisateur=Y
        const id_evenement = req.body.id_evenement || req.query.id_evenement;
        const id_utilisateur = req.body.id_utilisateur || req.query.id_utilisateur;

        if (!id_evenement || !id_utilisateur) {
            return res.status(400).json({ message: 'Identifiants manquants (id_evenement, id_utilisateur)' });
        }

        const deletedParticipation = await Participation.delete(id_evenement, id_utilisateur, client);
        
        if (!deletedParticipation) {
             return res.status(404).json({ message: 'Participation non trouvée' });
        }

        res.status(200).json({
            message: 'Participation supprimée avec succès',
            participation: deletedParticipation
        });
    });

    checkParticipation = withClient(async (req, res, client) => {
        const { id_evenement, id_utilisateur } = req.params;
        const participation = await Participation.findById(id_evenement, id_utilisateur, client);
        res.status(200).json({
            message: 'Statut participation récupéré',
            isRegistered: !!participation,
            participation
        });
    });

    getAllParticipationsByUserId = withClient(async (req, res, client) => {
        const id_utilisateur = req.params.id_utilisateur;
        const participations = await Participation.findAllByUserId(id_utilisateur, client);
        res.status(200).json({
            message: 'Participations récupérées avec succès',
            participations
        });
    });
}
module.exports = EvenementController;