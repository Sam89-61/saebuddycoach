const { pool } = require('../config/database');
const Plat = require('../models/Plat');
const Entree = require('../models/Entree');
const Dessert = require('../models/Dessert');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class AlimentationController {
    createPlat = withTransaction(async (req, res, client) => {
        const { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif } = req.body;
        const newPlat = await Plat.create({ nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif }, client);
        res.status(201).json({
            message: 'Plat créé avec succès',
            plat: newPlat
        });
    });

    updatePlat = withTransaction(async (req, res, client) => {
        const id_plat = req.params.id;
        const { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif } = req.body;
        const updatedPlat = await Plat.update(id_plat, { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif }, client);
        res.status(200).json({
            message: 'Plat mis à jour avec succès',
            plat: updatedPlat
        });
    });

    deletePlat = withTransaction(async (req, res, client) => {
        const id_plat = req.params.id;
        const deletedPlat = await Plat.delete(id_plat, client);
        res.status(200).json({
            message: 'Plat supprimé avec succès',
            plat: deletedPlat
        });
    });

    createEntree = withTransaction(async (req, res, client) => {
        const { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif } = req.body;
        const newEntree = await Entree.create({ nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif }, client);
        res.status(201).json({
            message: 'Entrée créée avec succès',
            entree: newEntree
        });
    });

    updateEntree = withTransaction(async (req, res, client) => {
        const id_entree = req.params.id;
        const { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif } = req.body;
        const updatedEntree = await Entree.update(id_entree, { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif }, client);
        res.status(200).json({
            message: 'Entrée mise à jour avec succès',
            entree: updatedEntree
        });
    });

    deleteEntree = withTransaction(async (req, res, client) => {
        const id_entree = req.params.id;
        const deletedEntree = await Entree.delete(id_entree, client);
        res.status(200).json({
            message: 'Entrée supprimée avec succès',
            entree: deletedEntree
        });
    });

    createDessert = withTransaction(async (req, res, client) => {
        const { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif } = req.body;
        const newDessert = await Dessert.create({ nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif }, client);
        res.status(201).json({
            message: 'Dessert créé avec succès',
            dessert: newDessert
        });
    });

    updateDessert = withTransaction(async (req, res, client) => {
        const id_dessert = req.params.id;
        const { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif } = req.body;
        const updatedDessert = await Dessert.update(id_dessert, { nom, description, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif }, client);
        res.status(200).json({
            message: 'Dessert mis à jour avec succès',
            dessert: updatedDessert
        });
    });

    deleteDessert = withTransaction(async (req, res, client) => {
        const id_dessert = req.params.id;
        const deletedDessert = await Dessert.delete(id_dessert, client);
        res.status(200).json({
            message: 'Dessert supprimé avec succès',
            dessert: deletedDessert
        });
    });

    getAllPlats = withClient(async (req, res, client) => {
        const plats = await Plat.findAll(client);
        res.status(200).json({
            message: 'Liste des plats récupérée avec succès',
            plats: plats
        });
    });

    getAllEntrees = withClient(async (req, res, client) => {
        const entrees = await Entree.findAll(client);
        res.status(200).json({
            message: 'Liste des entrées récupérée avec succès',
            entrees: entrees
        });
    });

    getAllDesserts = withClient(async (req, res, client) => {
        const desserts = await Dessert.findAll(client);
        res.status(200).json({
            message: 'Liste des desserts récupérée avec succès',
            desserts: desserts
        });
    });
}

module.exports = AlimentationController;