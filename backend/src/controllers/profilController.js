const Profil = require('../models/Profil');
const CategoryEquipement = require('../models/CategoryEquipement');
const InformationSante = require('../models/Information_santé');
const RegimeAlimentaire = require('../models/Regime_Alimentaire');
const Objectif = require('../models/Objectif');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ProfilController {
    createProfil = withTransaction(async (req, res, client) => {
        const {
            age,
            taille,
            poids,
            niveau,
            frequence,
            id_utilisateur,
            categorie_objectif,
            date_fin,
            sexe,
            jour_disponible,
            heure_disponible,
            equipement,
            conditions_medicales,
            condition_physique,
            regime_alimentaire,
            restrictions_alimentaires
        } = req.body;

        const resultEquipement = await CategoryEquipement.create(equipement, client);
        const resultInfoSante = await InformationSante.create({ conditions_medicales, condition_physique }, client);
        const resultRegime = await RegimeAlimentaire.create({ regime_alimentaire, restrictions_alimentaires }, client);
        const resultObjectif = await Objectif.create({ categorie_objectif, date_fin }, client);

        const profilData = {
            age,
            taille,
            poids,
            niveau,
            frequence,
            sexe,
            jour_disponible: JSON.stringify(jour_disponible), // Conversion explicite en JSON string
            heure_disponible,
            id_equipement: resultEquipement.id_categorie_equipement,
            id_utilisateur,
            objectif_id: resultObjectif.id_objectif,
            id_information_sante: resultInfoSante.id_information_sante,
            regime_id: resultRegime.id_regime
        };

        const profil = await Profil.create(profilData, client);

        res.status(201).json({
            message: 'Profil créé avec succès',
            data: profil
        });
    });

    updateProfil = withTransaction(async (req, res, client) => {
        const profilId = req.params.id_profil;
        const {
            age,
            taille,
            poids,
            niveau,
            frequence,
            categorie_objectif,
            date_fin,
            sexe,
            jour_disponible,
            heure_disponible,
            equipement,
            conditions_medicales,
            condition_physique,
            regime_alimentaire,
            restrictions_alimentaires
        } = req.body;

        const equipementId = await Profil.findEquipementId(profilId, client);
        const infoSanteId = await Profil.findInfoSanteId(profilId, client);
        const regimeId = await Profil.findRegimeId(profilId, client);
        const objectifId = await Profil.findObjectifId(profilId, client);

        const resultEquipement = await CategoryEquipement.update(equipementId.id_equipement, equipement, client);
        const resultInfoSante = await InformationSante.update(infoSanteId.id_information_sante, { conditions_medicales, condition_physique }, client);
        const resultRegime = await RegimeAlimentaire.update(regimeId.regime_id, { regime_alimentaire, restrictions_alimentaires }, client);
        const resultObjectif = await Objectif.update(objectifId.objectif_id, { categorie_objectif, date_fin }, client);

        const profilData = {
            age,
            taille,
            poids,
            niveau,
            sexe,
            frequence,
            jour_disponible,
            heure_disponible,
            id_equipement: resultEquipement.id_categorie_equipement,
            objectif_id: resultObjectif.id_objectif,
            id_information_sante: resultInfoSante.id_information_sante,
            regime_id: resultRegime.id_regime
        };
        const profil = await Profil.update(profilId, profilData, client);

        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            data: profil
        });
    });

    deleteProfil = withTransaction(async (req, res, client) => {
        const profilId = req.params.id_profil;
        const deletedProfil = await Profil.delete(profilId, client);
        await CategoryEquipement.delete(deletedProfil.id_equipement, client);
        await InformationSante.delete(deletedProfil.id_information_sante, client);
        await RegimeAlimentaire.delete(deletedProfil.regime_id, client);
        await Objectif.delete(deletedProfil.objectif_id, client);

        res.status(200).json({
            message: 'Profil supprimé avec succès',
            data: deletedProfil
        });
    });

    getProfilById = withClient(async (req, res, client) => {
        const profilId = req.params.id;
        const profil = await Profil.findById(profilId, client);
        res.status(200).json({
            message: 'Profil récupéré avec succès',
            data: profil
        });
    });

    getProfilByUserId = withClient(async (req, res, client) => {
        const userId = req.params.id;
        const profil = await Profil.findByUserId(userId, client);
        res.status(200).json({
            message: 'Profil récupéré avec succès',
            data: profil
        });
    });
}

module.exports = ProfilController;