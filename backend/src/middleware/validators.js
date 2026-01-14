const { body, param, validationResult } = require('express-validator');
const { update } = require('../models/Exos');

// Middleware pour vérifier les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erreur de validation',
      errors: errors.array()
    });
  }
  next();
};

// ============================================
// VALIDATEURS POUR AUTH
// ============================================
const authValidators = {
  register: [
    body('pseudo')
      .trim()
      .notEmpty().withMessage('Le pseudo est requis')
      .isLength({ min: 3, max: 50 }).withMessage('Le pseudo doit contenir entre 3 et 50 caractères'),
    body('email')
      .trim()
      .notEmpty().withMessage('L\'email est requis')
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis')
      .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
    body('role')
      .isIn(['utilisateur', 'admin']).withMessage('Rôle invalide'),
    validate
  ],
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('L\'email est requis')
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Le mot de passe est requis'),
    validate
  ],
  updateUser: [
    body('email')
      .optional()
      .isEmail().withMessage('Email invalide')
      .normalizeEmail(),
    body('pseudo')
      .optional()
      .trim()
      .isLength({ min: 2 }).withMessage('Le pseudo doit contenir au moins 2 caractères'),
    body('newPassword')
      .optional()
      .isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
    validate
  ]
};

const profilValidators = {
  create: [
    body('id_utilisateur').isInt({ min: 1 }).withMessage('ID utilisateur invalide'),
    body('age').isInt({ min: 0 }).withMessage('Âge invalide'),
    body('poids').isFloat({ min: 0 }).withMessage('Poids invalide'),
    body('taille').isFloat({ min: 0 }).withMessage('Taille invalide'),
    body('sexe').isIn(['Homme', 'Femme', 'Autre']).withMessage('Sexe invalide'),
    body('niveau').isIn(['Débutant', 'Intermédiaire', 'Avancé']).withMessage('Niveau invalide'),
    body('frequence').isInt({ min: 0, max: 7 }).withMessage('Fréquence invalide'),
    body('jour_disponible').isIn(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']).withMessage('Jour disponible invalide'),
    body('heure_disponible').matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage('Heure disponible invalide (format HH:MM)'),
    body('categorie_objectif').notEmpty().withMessage('Catégorie d\'objectif requise'),
    body('date_fin').isInt({ min: 1, max: 365 }).withMessage('Date de fin invalide (nombre de jours entre 1 et 365)'),
    body('equipement').isArray().withMessage('Équipement invalide'),
    body('conditions_medicales').isArray().withMessage('Conditions médicales invalides'),
    body('condition_physique').isArray().withMessage('Condition physique invalide'),
    body('regime_alimentaire').notEmpty().withMessage('Régime alimentaire requis'),
    body('restrictions_alimentaires').isArray().withMessage('Restrictions alimentaires invalides'),
    validate
  ],
  update: [
    param('id_profil').isInt({ min: 1 }).withMessage('ID invalide'),
    body('age').isInt({ min: 0 }).withMessage('Âge invalide'),
    body('poids').isFloat({ min: 0 }).withMessage('Poids invalide'),
    body('taille').isFloat({ min: 0 }).withMessage('Taille invalide'),
    body('sexe').isIn(['Homme', 'Femme', 'Autre']).withMessage('Sexe invalide'),
    body('niveau').isIn(['Débutant', 'Intermédiaire', 'Avancé']).withMessage('Niveau invalide'),
    body('frequence').isInt({ min: 0, max: 7 }).withMessage('Fréquence invalide'),
    body('categorie_objectif').notEmpty().withMessage('Catégorie d\'objectif requise'),
    body('date_fin').isInt({ min: 1, max: 365 }).withMessage('Date de fin invalide (nombre de jours entre 1 et 365)'),
    body('equipement').isArray().withMessage('Équipement invalide'),
    body('conditions_medicales').isArray().withMessage('Conditions médicales invalides'),
    body('condition_physique').isArray().withMessage('Condition physique invalide'),
    body('regime_alimentaire').notEmpty().withMessage('Régime alimentaire requis'),
    body('restrictions_alimentaires').isArray().withMessage('Restrictions alimentaires invalides'),
    validate
  ],
  delete: [
    param('id_profil').isInt({ min: 1 }).withMessage('ID invalide'),
    validate
  ]
};

const sessionSportValidator = {
  create: [
    body('nom').trim().notEmpty().withMessage('Le nom est requis'),
    body('description').trim().notEmpty().withMessage('La description est requise'),
    body('date_session').isISO8601().withMessage('Date de session invalide'),
    body('heure_session').matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage('Heure de session invalide (format HH:MM)'),
    body('duree_minutes').isInt({ min: 1 }).withMessage('Durée invalide'),
    body('id_programme_sportif').isInt({ min: 1 }).withMessage('ID programme sportif invalide'),
    validate
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    body('nom').trim().notEmpty().withMessage('Le nom est requis'),
    body('description').trim().notEmpty().withMessage('La description est requise'),
    body('date_session').isISO8601().withMessage('Date de session invalide'),
    body('heure_session').matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage('Heure de session invalide (format HH:MM)'),
    body('duree_minutes').isInt({ min: 1 }).withMessage('Durée invalide'),
    body('id_programme_sportif').isInt({ min: 1 }).withMessage('ID programme sportif invalide'),
    validate
  ],
  delete: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide'),
    validate
  ],
  add: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide de session sportive'),
    body('id_exo').isInt({ min: 1 }).withMessage('ID exercice invalide'),
    body('ordre').isInt({ min: 1 }).withMessage('Ordre invalide'),
    body('repetitions').isInt({ min: 1 }).withMessage('Répétitions invalides'),
    body('series').isInt({ min: 1 }).withMessage('Séries invalides'),
    body('temps_repos_secondes').isInt({ min: 0 }).withMessage('Temps de repos invalide'),
    body('notes').isString().withMessage('Notes invalides'),
    validate
  ],
  exoUpdate: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide de session sportive exercice'),
    body('id_exo').isInt({ min: 1 }).withMessage('ID exercice invalide'),
    body('id_session_sport').isInt({ min: 1 }).withMessage('ID session sportive invalide'),
    body('ordre').isInt({ min: 1 }).withMessage('Ordre invalide'),
    body('repetitions').isInt({ min: 1 }).withMessage('Répétitions invalides'),
    body('series').isInt({ min: 1 }).withMessage('Séries invalides'),
    body('temps_repos_secondes').isInt({ min: 0 }).withMessage('Temps de repos invalide'),
    body('notes').isString().withMessage('Notes invalides'),
    validate
  ],
  exoDelete: [
    param('id').isInt({ min: 1 }).withMessage('ID invalide de session sportive exercice'),
    validate
  ]
};

const sessionRepasValidator = {
  create: [
    body('id_programme_a')
      .isInt({ min: 1 }).withMessage('ID du programme alimentaire requis et invalide'),
    body('id_entree')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID entrée invalide'),
    body('id_plat')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID plat invalide'),
    body('id_dessert')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID dessert invalide'),
    body('date_repas')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date de repas invalide (format YYYY-MM-DD)'),
    body('heure_repas')
      .optional({ nullable: true, checkFalsy: true })
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage('Heure de repas invalide (format HH:MM)'),
    validate
  ],
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de session repas invalide'),
    body('id_programme_a')
      .isInt({ min: 1 }).withMessage('ID du programme alimentaire invalide'),
    body('id_entree')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID entrée invalide'),
    body('id_plat')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID plat invalide'),
    body('id_dessert')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID dessert invalide'),
    body('date_repas')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date de repas invalide'),
    body('heure_repas')
      .optional({ nullable: true, checkFalsy: true })
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/).withMessage('Heure de repas invalide (format HH:MM)'),
    validate
  ],
  delete: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de session repas invalide'),
    validate
  ],
  addPlat: [
    param('id').isInt({ min: 1 }).withMessage('ID de session repas invalide'),
    body('type_element').isIn(['entree', 'plat', 'dessert']).withMessage('Type élément invalide'),
    body('id_element').isInt({ min: 1 }).withMessage('ID élément invalide'),
    body('ordre').isInt({ min: 1 }).withMessage('Ordre invalide'),
    body('quantite').isFloat({ min: 0 }).withMessage('Quantité invalide'),
    body('notes').optional().isString().withMessage('Notes invalides'),
    validate
  ],
  updatePlat: [
    param('id').isInt({ min: 1 }).withMessage('ID de session repas plat invalide'),
    body('id_session_repas').isInt({ min: 1 }).withMessage('ID session repas invalide'),
    body('type_element').isIn(['entree', 'plat', 'dessert']).withMessage('Type élément invalide'),
    body('id_element').isInt({ min: 1 }).withMessage('ID élément invalide'),
    body('ordre').isInt({ min: 1 }).withMessage('Ordre invalide'),
    body('quantite').isFloat({ min: 0 }).withMessage('Quantité invalide'),
    body('notes').optional().isString().withMessage('Notes invalides'),
    validate
  ],
  deletePlat: [
    param('id').isInt({ min: 1 }).withMessage('ID de session repas plat invalide'),
    validate
  ]
};

const recordValidator = {
  create: [
    body('type_record')
      .trim()
      .notEmpty().withMessage('Le type de record est requis (ex: Poids, Répétitions, Temps)'),
    body('score')
      .notEmpty().withMessage('Le score est requis')
      .isInt().withMessage('Le score doit être un nombre entier'),
    body('id_utilisateur')
      .isInt({ min: 1 }).withMessage('ID utilisateur invalide'),
    body('id_exo')
      .isInt({ min: 1 }).withMessage('ID exercice invalide'),
    body('date_record')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date du record invalide (format YYYY-MM-DD ou ISO8601)'),
    validate
  ],
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID du record invalide'),
    body('type_record')
      .trim()
      .notEmpty().withMessage('Le type de record ne peut pas être vide'),
    body('score')
      .isInt().withMessage('Le score doit être un nombre entier'),
    body('id_utilisateur')
      .isInt({ min: 1 }).withMessage('ID utilisateur invalide'),
    body('id_exo')
      .isInt({ min: 1 }).withMessage('ID exercice invalide'),
    body('date_record')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date du record invalide'),
    validate
  ],
  delete: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID du record invalide'),
    validate
  ]
};

const programmeValidator = {
  // ========================
  // PROGRAMME PRINCIPAL
  // ========================
  create: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom du programme est requis'),
    body('description')
      .trim()
      .isString(),
    body('date_debut')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date de début invalide (format YYYY-MM-DD)'),
    body('date_fin')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date de fin invalide (format YYYY-MM-DD)'),
    body('id_profil')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID profil invalide'),
    validate
  ],
  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID programme invalide'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('date_debut')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date de début invalide'),
    body('date_fin')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601().withMessage('Date de fin invalide'),
    body('id_profil')
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }).withMessage('ID profil invalide'),
    validate
  ],

  // ========================
  // PROGRAMME ALIMENTAIRE
  // ========================
  createAlim: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom du programme alimentaire est requis'),
    body('description')
      .trim(),
    body('id_programme')
      .isInt({ min: 1 }).withMessage('ID du programme parent requis'),
    validate
  ],
  updateAlim: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID programme alimentaire invalide'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('id_programme')
      .isInt({ min: 1 }).withMessage('ID du programme parent invalide'),
    validate
  ],

  // ========================
  // PROGRAMME SPORTIF
  // ========================
  createSport: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom du programme sportif est requis'),
    body('description')
      .trim(),
    body('id_programme')
      .isInt({ min: 1 }).withMessage('ID du programme parent requis'),
    validate
  ],
  updateSport: [
    param('id')
      .isInt({ min: 1 }).withMessage('ID programme sportif invalide'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('id_programme')
      .isInt({ min: 1 }).withMessage('ID du programme parent invalide'),
    validate
  ]
};

// ============================================
// VALIDATEURS POUR ALIMENTATION
// ============================================
const alimentationValidators = {
  createPlat: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom du plat est requis')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description trop longue'),
    body('calorie')
      .isFloat({ min: 0, max: 10000 }).withMessage('Les calories doivent être entre 0 et 10000'),
    body('proteine')
      .isFloat({ min: 0, max: 1000 }).withMessage('Les protéines doivent être entre 0 et 1000g'),
    body('glucide')
      .isFloat({ min: 0, max: 1000 }).withMessage('Les glucides doivent être entre 0 et 1000g'),
    body('lipide')
      .isFloat({ min: 0, max: 1000 }).withMessage('Les lipides doivent être entre 0 et 1000g'),
    body('restrictions_alimentaires')
      .isArray().withMessage('Les restrictions alimentaires doivent être un tableau'),
    body('regime_alimentaire')
      .trim()
      .isLength({ max: 255 }).withMessage('Le régime alimentaire ne peut pas dépasser 255 caractères'),
    body('objectif')
      .trim()
      .isLength({ max: 255 }).withMessage('L\'objectif ne peut pas dépasser 255 caractères'),
    validate
  ],
  createEntree: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom de l\'entrée est requis')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('calorie').isFloat({ min: 0, max: 10000 }).withMessage('Calories invalides'),
    body('proteine').isFloat({ min: 0, max: 1000 }).withMessage('Protéines invalides'),
    body('glucide').isFloat({ min: 0, max: 1000 }).withMessage('Glucides invalides'),
    body('lipide').isFloat({ min: 0, max: 1000 }).withMessage('Lipides invalides'),
    body('restrictions_alimentaires')
      .isArray().withMessage('Les restrictions alimentaires doivent être un tableau'),
    body('regime_alimentaire')
      .trim()
      .isLength({ max: 255 }).withMessage('Le régime alimentaire ne peut pas dépasser 255 caractères'),
    body('objectif')
      .trim()
      .isLength({ max: 255 }).withMessage('L\'objectif ne peut pas dépasser 255 caractères'),
    validate
  ],
  createDessert: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom du dessert est requis')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('calorie').isFloat({ min: 0, max: 10000 }).withMessage('Calories invalides'),
    body('proteine').isFloat({ min: 0, max: 1000 }).withMessage('Protéines invalides'),
    body('glucide').isFloat({ min: 0, max: 1000 }).withMessage('Glucides invalides'),
    body('lipide').isFloat({ min: 0, max: 1000 }).withMessage('Lipides invalides'),
    body('restrictions_alimentaires')
      .isArray().withMessage('Les restrictions alimentaires doivent être un tableau'),
    body('regime_alimentaire')
      .trim()
      .isLength({ max: 255 }).withMessage('Le régime alimentaire ne peut pas dépasser 255 caractères'),
    body('objectif')
      .trim()
      .isLength({ max: 255 }).withMessage('L\'objectif ne peut pas dépasser 255 caractères'),
    validate
  ]
};

// ============================================
// VALIDATEURS POUR EXERCICES
// ============================================
const exosValidators = {
  create: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom de l\'exercice est requis')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description ne peut pas dépasser 5000 caractères'),
    body('difficulte')
      .isIn(['Débutant', 'Intermédiaire', 'Avancé']).withMessage('Difficulté invalide'),
    body('muscle_cibles')
      .isArray().withMessage('muscle_cibles doit être un tableau'),
    body('video_tutoriel')
      .isURL().withMessage('URL de vidéo invalide'),
    body('id_equipement')
      .isInt({ min: 1 }).withMessage('ID équipement invalide'),
    validate
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID exercice invalide'),
    body('nom').trim().isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('description').trim().isLength({ max: 5000 }).withMessage('La description trop longue'),
    body('difficulte').isIn(['Débutant', 'Intermédiaire', 'Avancé']).withMessage('Difficulté invalide'),
    body('muscle_cibles').isArray().withMessage('muscle_cibles doit être un tableau'),
    body('video_tutoriel').isURL().withMessage('URL de vidéo invalide'),
    validate
  ],
  createPosture: [
    body('id_exos')
      .isInt({ min: 1 }).withMessage('ID exercice invalide'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom de la posture est requis')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description trop longue'),
    body('score_cible')
      .isFloat({ min: 0, max: 100 }).withMessage('Le score cible doit être entre 0 et 100'),
    body('url_video_reference')
      .isURL().withMessage('URL de vidéo invalide'),
    body('points_cles')
      .isArray().withMessage('points_cles doit être un tableau'),
    validate
  ]
};

// ============================================
// VALIDATEURS POUR MASCOTTE
// ============================================
const mascotteValidators = {
  create: [
    body('experience')
      .isInt({ min: 0, max: 1000000 }).withMessage('L\'expérience doit être entre 0 et 1000000'),
    body('niveau')
      .isInt({ min: 1, max: 100 }).withMessage('Le niveau doit être entre 1 et 100'),
    body('apparence')
      .isObject().withMessage('L\'apparence doit être un objet JSON'),
    body('id_utilisateur')
      .isInt({ min: 1 }).withMessage('ID utilisateur invalide'),
    validate
  ]
};

// ============================================
// VALIDATEURS POUR OBJECTIFS
// ============================================
const objectifValidators = {
  create: [
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description trop longue'),
    body('categorie_obj')
      .trim()
      .notEmpty().withMessage('La catégorie est requise'),
    body('actif')
      .isBoolean().withMessage('actif doit être un booléen'),
    body('date_debut')
      .isISO8601().withMessage('Date de début invalide'),
    body('date_fin')
      .isISO8601().withMessage('Date de fin invalide')
      .custom((dateFin, { req }) => {
        if (new Date(dateFin) <= new Date(req.body.date_debut)) {
          throw new Error('La date de fin doit être après la date de début');
        }
        return true;
      }),
    validate
  ],
  createCategorie: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom de la catégorie est requis')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description trop longue'),
    validate
  ]
};

// ============================================
// VALIDATEURS POUR CLASSEMENT
// ============================================
const classementValidators = {
  create: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom du classement est requis')
      .isLength({ max: 255 }).withMessage('Le nom trop long'),
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description trop longue'),
    body('type_challenge')
      .isIn(['force', 'endurance', 'flexibilité', 'vitesse']).withMessage('Type de challenge invalide'),
    body('id_exo')
      .isInt({ min: 1 }).withMessage('ID exercice invalide'),
    body('unite_mesure')
      .isIn(['repetitions', 'secondes', 'minutes', 'kg', 'km']).withMessage('Unité de mesure invalide'),
    body('periode')
      .isIn(['journalier', 'hebdomadaire', 'mensuel', 'permanent']).withMessage('Période invalide'),
    body('date_debut')
      .isISO8601().withMessage('Date de début invalide'),
    body('date_fin')
      .isISO8601().withMessage('Date de fin invalide'),
    body('actif')
      .isBoolean().withMessage('actif doit être un booléen'),
    validate
  ],
  submitScore: [
    body('id_classement')
      .isInt({ min: 1 }).withMessage('ID classement invalide'),
    body('id_utilisateur')
      .isInt({ min: 1 }).withMessage('ID utilisateur invalide'),
    body('score')
      .isFloat({ min: 0 }).withMessage('Le score doit être positif'),
    body('url_video_preuve')
      .isURL().withMessage('URL de vidéo invalide'),
    body('statut_validation')
      .isIn(['en_attente', 'validé', 'rejeté']).withMessage('Statut de validation invalide'),
    validate
  ]
};

// ============================================
// VALIDATEURS POUR ÉVÉNEMENTS
// ============================================
const evenementValidators = {
  create: [
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom de l\'événement est requis')
      .isLength({ max: 255 }).withMessage('Le nom ne peut pas dépasser 255 caractères'),
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description trop longue'),
    body('lieu')
      .trim()
      .isLength({ max: 255 }).withMessage('Le lieu ne peut pas dépasser 255 caractères'),
    body('date')
      .isISO8601().withMessage('Date invalide'),
    validate
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID événement invalide'),
    body('nom')
      .trim()
      .notEmpty().withMessage('Le nom ne peut pas être vide')
      .isLength({ max: 255 }).withMessage('Le nom trop long'),
    body('description')
      .trim()
      .isLength({ max: 5000 }).withMessage('La description trop longue'),
    body('lieu')
      .trim()
      .isLength({ max: 255 }).withMessage('Le lieu trop long'),
    body('date')
      .isISO8601().withMessage('Date invalide'),
    validate
  ]
};

// ============================================
// VALIDATEURS POUR ÉQUIPEMENT
// ============================================
const equipementValidators = {
  create: [
    body('list_equipement')
      .isArray().withMessage('list_equipement doit être un tableau')
      .notEmpty().withMessage('La liste d\'équipement ne peut pas être vide'),
    validate
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID équipement invalide'),
    body('list_equipement')
      .isArray().withMessage('list_equipement doit être un tableau')
      .notEmpty().withMessage('La liste d\'équipement ne peut pas être vide'),
    validate
  ]
};

const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  validate
];

module.exports = {
  authValidators,
  profilValidators,
  sessionSportValidator,
  sessionRepasValidator,
  recordValidator,
  programmeValidator,
  alimentationValidators,
  exosValidators,
  mascotteValidators,
  objectifValidators,
  classementValidators,
  evenementValidators,
  equipementValidators,
  idValidator,
  validate
};