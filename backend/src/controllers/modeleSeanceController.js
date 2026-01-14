const ModeleSeance = require('../models/ModeleSeance');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ModeleSeanceController {

    // Récupérer tous les modèles
    getAllModeles = withClient(async (req, res, client) => {
        const modeles = await ModeleSeance.findAll(client);
        res.status(200).json(modeles);
    });

    // Récupérer un modèle par ID
    getModeleById = withClient(async (req, res, client) => {
        const { id } = req.params;
        const modele = await ModeleSeance.findById(id, client);
        if (!modele) {
            return res.status(404).json({ message: 'Modèle de séance non trouvé' });
        }
        res.status(200).json(modele);
    });

    // Récupérer les exercices d'un modèle
    getModeleExos = withClient(async (req, res, client) => {
        const { id } = req.params;
        const exos = await ModeleSeance.getExosByModeleId(id, client);
        res.status(200).json(exos);
    });

    // Créer un nouveau modèle
    createModele = withTransaction(async (req, res, client) => {
        const newModele = await ModeleSeance.create(req.body, client);
        res.status(201).json({
            message: 'Modèle de séance créé avec succès',
            modele: newModele
        });
    });

    // Ajouter un exercice à un modèle
    addExoToModele = withTransaction(async (req, res, client) => {
        const newExoLink = await ModeleSeance.addExo(req.body, client);
        res.status(201).json({
            message: 'Exercice ajouté au modèle avec succès',
            lien: newExoLink
        });
    });
}

module.exports = new ModeleSeanceController();
