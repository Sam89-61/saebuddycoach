const Equipement = require('../models/equipementExo');
const { withTransaction } = require('../utils/controllerWrapper');

class EquipementController {
    create = withTransaction(async (req, res, client) => {
        const { list_equipement } = req.body;
        const newEquipement = await Equipement.create({ list_equipement }, client);
        res.status(201).json({
            message: 'Équipement créé avec succès',
            equipement: newEquipement
        });
    });

    updateEquipement = withTransaction(async (req, res, client) => {
        const id_categorie_equipement = req.params.id;
        const { list_equipement } = req.body;
        const updatedEquipement = await Equipement.update(id_categorie_equipement, { list_equipement }, client);
        res.status(200).json({
            message: 'Équipement mis à jour avec succès',
            equipement: updatedEquipement
        });
    });

    deleteEquipement = withTransaction(async (req, res, client) => {
        const id_categorie_equipement = req.params.id;
        const deletedEquipement = await Equipement.delete(id_categorie_equipement, client);
        res.status(200).json({
            message: 'Équipement supprimé avec succès',
            equipement: deletedEquipement
        });
    });
}
module.exports = EquipementController;