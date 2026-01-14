const Programme = require('../models/Programme');
const ProgrammeSportif = require('../models/Programme_sportif');
const ProgrammeAlimentaire = require('../models/Programme_alimentaire');
const ProgrammeGeneratorSport = require('../services/programmesGeneratorSport');
const ProgrammeGeneratorAlimentaire = require('../services/programmesGeneratorAlimentaire');
const Profil = require('../models/Profil');
const Objectif = require('../models/Objectif');
const SessionSport = require('../models/Session_sport');
const SessionRepas = require('../models/Session_repas');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class ProgrammeController {
    getMyProgramme = withClient(async (req, res, client) => {
        console.log('GET /mon-programme called. User:', req.user);
        // 1. Récupérer le Profil de l'utilisateur connecté
        const userId = req.user.id;
        const profils = await Profil.findByUserId(userId, client);
        
        if (!profils || profils.length === 0) {
            console.log('No profil found for user', userId);
            return res.status(404).json({ message: 'Aucun profil trouvé pour cet utilisateur.' });
        }
        const profil = profils[0]; // On prend le premier profil par défaut
        console.log('Profil found:', profil.id_profil);

        // 2. Récupérer le Programme global
        const programme = await Programme.findByProfilId(profil.id_profil, client);
        if (!programme) {
            console.log('No programme found for profil', profil.id_profil);
            return res.status(404).json({ message: 'Aucun programme généré pour ce profil.' });
        }

        // 3. Récupérer le Programme Sportif (Partie Sport)
        const programmeSportif = await ProgrammeSportif.findByProgrammeId(programme.id_programme, client);
        
        // 4. Récupérer les Sessions Sport (si programme sportif existe)
        let sessions = [];
        if (programmeSportif) {
            sessions = await SessionSport.findByProgrammeSportifId(programmeSportif.id_programme_sportif, client);
        }

        // 5. Récupérer le Programme Alimentaire (Partie Alimentation)
        const programmeAlimentaire = await ProgrammeAlimentaire.findById(programme.id_programme, client);
        // 6. Récupérer les Sessions Repas (si programme alimentaire existe)
        let sessionRepas = [];
        if (programmeAlimentaire) {
            sessionRepas = await SessionRepas.findByProgrammeAlimentaireId(programmeAlimentaire.id_programme_a, client);
            console.log('Sessions Repas found:', sessionRepas.length);
        }

        res.status(200).json({
            programme,
            programmeSportif,
            sessions,
            programmeAlimentaire,
            sessionRepas
        });
    });

    createProgramme = withTransaction(async (req, res, client) => {
        const { nom, description, date_debut, date_fin, id_profil } = req.body;
        const newProgramme = await Programme.create({ nom, description, date_debut, date_fin, id_profil }, client);

        res.status(201).json({
            message: 'Programme créé avec succès',
            programme: newProgramme
        });
    });

    deleteProgramme = withTransaction(async (req, res, client) => {
        const id_programme = req.params.id;
        const deletedProgramme = await Programme.delete(id_programme, client);
        res.status(200).json({
            message: 'Programme supprimé avec succès',
            programme: deletedProgramme
        });
    });

    updateProgramme = withTransaction(async (req, res, client) => {
        const id_programme = req.params.id;
        const { nom, description, date_debut, date_fin, id_profil } = req.body;
        const updatedProgramme = await Programme.update(id_programme, { nom, description, date_debut, date_fin, id_profil }, client);
        res.status(200).json({
            message: 'Programme mis à jour avec succès',
            programme: updatedProgramme
        });
    });

    getProgrammeById = withClient(async (req, res, client) => {
        const id_programme = req.params.id;
        const programme = await Programme.findById(id_programme, client);
        if (!programme) {
            return res.status(404).json({ message: 'Programme non trouvé' });
        }
        res.status(200).json({ programme });
    });

    createProgrammeAlimentaire = withTransaction(async (req, res, client) => {
        const { nom, description, id_programme } = req.body;
        const newProgrammeAlimentaire = await ProgrammeAlimentaire.create({ nom, description, id_programme }, client);

        res.status(201).json({
            message: 'Programme alimentaire créé avec succès',
            programmeAlimentaire: newProgrammeAlimentaire
        });
    });

    updateProgrammeAlimentaire = withTransaction(async (req, res, client) => {
        const id_programme_a = req.params.id;
        const { nom, description, id_programme } = req.body;
        const updatedProgrammeAllimentaire = await ProgrammeAlimentaire.update(id_programme_a, { nom, description, id_programme }, client);
        res.status(200).json({
            message: 'Programme alimentaire mis à jour avec succès',
            programmeAllimentaire: updatedProgrammeAllimentaire
        });
    });

    deleteProgrammeAlimentaire = withTransaction(async (req, res, client) => {
        const id_programme_a = req.params.id;
        const deletedProgrammeAllimentaire = await ProgrammeAlimentaire.delete(id_programme_a, client);
        res.status(200).json({
            message: 'Programme alimentaire supprimé avec succès',
            programmeAllimentaire: deletedProgrammeAllimentaire
        });
    });

    getProgrammeAlimentaireById = withClient(async (req, res, client) => {
        const id_programme = req.params.id;
        const programmeAlimentaire = await ProgrammeAlimentaire.findById(id_programme, client);
        if (!programmeAlimentaire) {
            return res.status(404).json({ message: 'Programme alimentaire non trouvé' });
        }
        res.status(200).json({ programmeAlimentaire });
    });

    createProgrammeSportif = withTransaction(async (req, res, client) => {
        const { nom, description, id_programme } = req.body;
        const newProgrammeSportif = await ProgrammeSportif.create({ nom, description, id_programme }, client);
        res.status(201).json({
            message: 'Programme sportif créé avec succès',
            programmeSportif: newProgrammeSportif
        });
    });

    updateProgrammeSportif = withTransaction(async (req, res, client) => {
        const id_programme_sportif = req.params.id;
        const { nom, description, id_programme } = req.body;
        const updatedProgrammeSportif = await ProgrammeSportif.update(id_programme_sportif, { nom, description, id_programme }, client);
        res.status(200).json({
            message: 'Programme sportif mis à jour avec succès',
            programmeSportif: updatedProgrammeSportif
        });
    });

    deleteProgrammeSportif = withTransaction(async (req, res, client) => {
        const id_programme_sportif = req.params.id;
        const deletedProgrammeSportif = await ProgrammeSportif.delete(id_programme_sportif, client);
        res.status(200).json({
            message: 'Programme sportif supprimé avec succès',
            programmeSportif: deletedProgrammeSportif
        });
    });

    getProgrammeSportifById = withClient(async (req, res, client) => {
        const id_programme = req.params.id;
        const programmeSportif = await ProgrammeSportif.findById(id_programme, client);
        if (!programmeSportif) {
            return res.status(404).json({ message: 'Programme sportif non trouvé' });
        }
        res.status(200).json({ programmeSportif });
    });

    generateAuto = withTransaction(async (req, res, client) => {
        const id_profil = req.params.id_profil;

        // 1. Récupération des données nécessaires
        const profil = await Profil.findById(id_profil, client);
        if (!profil) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }

        const objectif = await Objectif.findByProfilId(profil.id_profil, client);
        if (!objectif) {
            return res.status(404).json({ message: 'Objectif non trouvé pour ce profil' });
        }

        // 2. Création du Programme Parent UNIQUE
        const createdProgramme = await Programme.create({
            nom: 'Programme Complet ' + objectif.categorie_obj,
            description: `Programme généré automatiquement pour ${objectif.categorie_obj} (${profil.objectif_poids || 'Santé'})`,
            date_debut: objectif.date_debut,
            date_fin: objectif.date_fin,
            id_profil: id_profil
        }, client);

        const programme_id = createdProgramme.id_programme;

        // 3. Génération du volet SPORTIF
        const programmeSportif = await ProgrammeGeneratorSport.generateProgrammeSports(profil, objectif, programme_id, client);
        await ProgrammeGeneratorSport.generateSessionSports(programmeSportif.id_programme_sportif, profil, objectif, client);

        // 4. Génération du volet ALIMENTAIRE
        const programmeAlimentaire = await ProgrammeGeneratorAlimentaire.generateProgrammeAlimentaire(profil, objectif, programme_id, client);
        // Important: on passe l'objet programmeAlimentaire complet ici car il contient les données calculées (calories, etc.)
        await ProgrammeGeneratorAlimentaire.generateSessionsRepas(programmeAlimentaire, profil, objectif, client);

        res.status(201).json({
            message: 'Programme complet (Sport + Alimentation) généré avec succès !',
            programme: createdProgramme,
            sport: programmeSportif,
            alimentation: programmeAlimentaire
        });
    });
}

module.exports = ProgrammeController;