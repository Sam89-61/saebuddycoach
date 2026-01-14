const Mascotte = require('../models/Mascotte');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class MascotteController {
    createMascotte = withTransaction(async (req, res, client) => {
        const { experience, niveau, apparence, id_utilisateur } = req.body;
        const newMascotte = await Mascotte.create({ experience, niveau, apparence, id_utilisateur }, client);
        res.status(201).json({
            message: 'Mascotte créée avec succès',
            mascotte: newMascotte
        });
    });

    updateMascotte = withTransaction(async (req, res, client) => {
        const id_mascotte = req.params.id;
        const { experience, niveau, apparence, id_utilisateur } = req.body;
        const updatedMascotte = await Mascotte.update(id_mascotte, { experience, niveau, apparence, id_utilisateur }, client);
        res.status(200).json({
            message: 'Mascotte mise à jour avec succès',
            mascotte: updatedMascotte
        });
    });

    deleteMascotte = withTransaction(async (req, res, client) => {
        const id_mascotte = req.params.id;
        const deletedMascotte = await Mascotte.delete(id_mascotte, client);
        res.status(200).json({
            message: 'Mascotte supprimée avec succès',
            mascotte: deletedMascotte
        });
    });

    getMascotteByUserId = withClient(async (req, res, client) => {
        const id_utilisateur = req.params.id_utilisateur;
        const mascotte = await Mascotte.findByUserId(id_utilisateur, client);
        res.status(200).json({
            message: 'Mascotte récupérée avec succès',
            mascotte: mascotte
        });
    });
}

module.exports = MascotteController;