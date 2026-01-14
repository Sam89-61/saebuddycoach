const Objectif = require('../models/Objectif');
const CategorieObjectif = require('../models/Category_Objetif');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ObjectifController {
    createObjectif = withTransaction(async (req, res, client) => {
        const { categorie_objectif, date_fin } = req.body;
        const newObjectif = await Objectif.create({ categorie_objectif, date_fin }, client);
        res.status(201).json({
            message: 'Objectif créé avec succès',
            objectif: newObjectif
        });
    });

    updateObjectif = withTransaction(async (req, res, client) => {
        const id_objectif = req.params.id;
        const { categorie_objectif, date_fin } = req.body;
        const updatedObjectif = await Objectif.update(id_objectif, { categorie_objectif, date_fin }, client);
        res.status(200).json({
            message: 'Objectif mis à jour avec succès',
            objectif: updatedObjectif
        });
    });

    deleteObjectif = withTransaction(async (req, res, client) => {
        const id_objectif = req.params.id;
        const deletedObjectif = await Objectif.delete(id_objectif, client);
        res.status(200).json({
            message: 'Objectif supprimé avec succès',
            objectif: deletedObjectif
        });
    });

    createCategorieObjectif = withTransaction(async (req, res, client) => {
        const { nom, description } = req.body;
        const newCategorie = await CategorieObjectif.create({ nom, description }, client);
        res.status(201).json({
            message: 'Catégorie d\'objectif créée avec succès',
            categorieObjectif: newCategorie
        });
    });

    updateCategorieObjectif = withTransaction(async (req, res, client) => {
        const categorie = req.params.name;
        const { nom, description } = req.body;
        const updatedCategorie = await CategorieObjectif.update(categorie, { nom, description }, client);
        res.status(200).json({
            message: 'Catégorie d\'objectif mise à jour avec succès',
            categorieObjectif: updatedCategorie
        });
    });

    deleteCategorieObjectif = withTransaction(async (req, res, client) => {
        const categorie = req.params.name;
        const deletedCategorie = await CategorieObjectif.delete(categorie, client);
        res.status(200).json({
            message: 'Catégorie d\'objectif supprimée avec succès',
            categorieObjectif: deletedCategorie
        });
    });

    getAllCategoriesObjectif = withClient(async (req, res, client) => {
        const categories = await CategorieObjectif.findAll(client);
        res.status(200).json({
            message: 'Catégories d\'objectif récupérées avec succès',
            categoriesObjectif: categories
        });
    });
}
module.exports = ObjectifController;
