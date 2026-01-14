const Exos = require('../models/Exos');
const PostureReference = require('../models/Posture_references');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ExosController {

    createExo = withTransaction(async (req, res, client) => {
        const { nom, description, muscle_cibles, difficulte, video_tutoriel, img, id_equipement } = req.body;

        const newExo = await Exos.create({ nom, description, difficulte, muscle_cibles, video_tutoriel, img, id_equipement }, client);
        res.status(201).json({
            message: 'Exercice créé avec succès',
            exo: newExo
        });
    });

    updateExo = withTransaction(async (req, res, client) => {
        const id_exo = req.params.id;
        const { nom, description, difficulte, muscle_cibles, video_tutoriel, img, id_equipement } = req.body;
        const updatedExo = await Exos.update(id_exo, { nom, description, difficulte, muscle_cibles, video_tutoriel, img, id_equipement }, client);
        if (!updatedExo) {
            res.status(404).json({ message: 'Exercice non trouvé' });
            return;
        }
        res.status(200).json({
            message: 'Exercice mis à jour avec succès',
            exo: updatedExo
        });
    });

    deleteExo = withTransaction(async (req, res, client) => {
        const id_exo = req.params.id;
        const deletedExo = await Exos.delete(id_exo, client);
        if (!deletedExo) {
            res.status(404).json({ message: 'Exercice non trouvé' });
            return;
        }
        res.status(200).json({
            message: 'Exercice supprimé avec succès',
            exo: deletedExo
        });
    });

    getAllExos = withClient(async (req, res, client) => {
        const exos = await Exos.findAll(client);
        res.status(200).json(exos);
    });

    createPostureReference = withTransaction(async (req, res, client) => {
        const { id_exo, nom, description, score_cible, url_video_reference, points_cles } = req.body;
        const newPostureReference = await PostureReference.create({ id_exo, nom, description, score_cible, url_video_reference, points_cles }, client);
        res.status(201).json({
            message: 'Posture de référence créée avec succès',
            postureReference: newPostureReference
        });
    });

    updatePostureReference = withTransaction(async (req, res, client) => {
        const id_posture_reference = req.params.id;
        const { id_exo, nom, description, score_cible, url_video_reference, points_cles } = req.body;
        const updatedPostureReference = await PostureReference.update(id_posture_reference, { id_exo, nom, description, score_cible, url_video_reference, points_cles }, client);
        res.status(200).json({
            message: 'Posture de référence mise à jour avec succès',
            postureReference: updatedPostureReference
        });
    });

    deletePostureReference = withTransaction(async (req, res, client) => {
        const id_posture_reference = req.params.id;
        const deletedPostureReference = await PostureReference.delete(id_posture_reference, client);
        res.status(200).json({
            message: 'Posture de référence supprimée avec succès',
            postureReference: deletedPostureReference
        });
    });

    getPosturesByExo = withClient(async (req, res, client) => {
        const id_exo = req.params.id;
        const postureReference = await PostureReference.findByExoId(id_exo, client);
        res.status(200).json({
            message: 'Posture de référence récupérée avec succès',
            postureReference: postureReference
        });
    });
}
module.exports = ExosController;