const Profil = require('../models/Profil');
const Objectif = require('../models/Objectif');
const Programme = require('../models/Programme');
const Programme_al = require('../models/Programme_alimentaire');
const Plat = require('../models/Plat');
const Entree = require('../models/Entree');
const Dessert = require('../models/Dessert');
const InformationSante = require('../models/Information_santé');
const RegimeAlimentaire = require('../models/Regime_Alimentaire');
const Session_repas = require('../models/Session_repas');
const Session_repas_plat = require('../models/Session_repas_plat');

const { pool } = require('../config/database');

class DecisionNode {
    constructor(attribute, operator, value, trueNode, falseNode, result = null) {
        this.attribute = attribute;
        this.operator = operator;
        this.value = value;
        this.trueNode = trueNode;
        this.falseNode = falseNode;
        this.result = result;
    }

    evaluate(data) {
        if (this.result !== null) {
            return this.result;
        }

        const attrValue = data[this.attribute];
        let condition = false;

        switch (this.operator) {
            case '<=': condition = attrValue <= this.value; break;
            case '>=': condition = attrValue >= this.value; break;
            case '==': condition = attrValue == this.value; break;
            case '<': condition = attrValue < this.value; break;
            case '>': condition = attrValue > this.value; break;
            case 'includes':
                if (Array.isArray(attrValue)) {
                    condition = attrValue.includes(this.value)
                } else if (typeof attrValue === 'string') {
                    condition = attrValue.includes(this.value);
                }
                break;

            case 'intersects':
                if (Array.isArray(attrValue) && Array.isArray(this.value)) {
                    condition = this.value.some(item => attrValue.includes(item));
                }
                break;

            default: condition = false;
        }

        return condition ? this.trueNode.evaluate(data) : this.falseNode.evaluate(data);
    }
}

class ProgrammeAlimentaireGenerator {

    // ARBRE 1 : CALCUL DES BESOINS CALORIQUES (Métabolisme de Base)
    static buildMetabolismeBaseTree() {
        // Formule de Harris-Benedict revisitée
        // Hommes: MB = 88.362 + (13.397 × poids en kg) + (4.799 × taille en cm) - (5.677 × âge en années)
        // Femmes: MB = 447.593 + (9.247 × poids en kg) + (3.098 × taille en cm) - (4.330 × âge en années)

        const hommeFormula = new DecisionNode(null, null, null, null, null, {
            formule: (poids, taille, age) => 88.362 + (13.397 * poids) + (4.799 * taille) - (5.677 * age)
        });

        const femmeFormula = new DecisionNode(null, null, null, null, null, {
            formule: (poids, taille, age) => 447.593 + (9.247 * poids) + (3.098 * taille) - (4.330 * age)
        });

        const root = new DecisionNode('sexe', '==', 'Homme', hommeFormula, femmeFormula);

        return root;
    }

    // ARBRE 2 : COEFFICIENT D'ACTIVITÉ (NAP - Niveau d'Activité Physique)
    static buildCoefficientActiviteTree() {
        // Sédentaire: 1.2
        const sedentaire = new DecisionNode(null, null, null, null, null, 1.2);

        // Légèrement actif (1-3 fois/semaine): 1.375
        const legerementActif = new DecisionNode(null, null, null, null, null, 1.375);

        // Modérément actif (3-5 fois/semaine): 1.55
        const moderementActif = new DecisionNode(null, null, null, null, null, 1.55);

        // Très actif (6-7 fois/semaine): 1.725
        const tresActif = new DecisionNode(null, null, null, null, null, 1.725);

        // Extrêmement actif (7+ fois/semaine ou bi-quotidien): 1.9
        const extremementActif = new DecisionNode(null, null, null, null, null, 1.9);

        // Arbre de décision restructuré (Correction du bug de priorité)
        // Logique : Si >= 1 -> On vérifie si >= 3 -> Si oui, on vérifie si >= 6 -> Si oui, on vérifie si >= 7

        const freq7Node = new DecisionNode('frequence', '>=', 7, extremementActif, tresActif);
        const freq6Node = new DecisionNode('frequence', '>=', 6, freq7Node, moderementActif);
        const freq3Node = new DecisionNode('frequence', '>=', 3, freq6Node, legerementActif);
        const rootNode = new DecisionNode('frequence', '>=', 1, freq3Node, sedentaire);

        return rootNode;
    }

    // ARBRE 3 : AJUSTEMENT SELON L'OBJECTIF
    static buildAjustementObjectifTree() {
        // Prise de masse: +300 à +500 calories
        const priseMasse = new DecisionNode(null, null, null, null, null, {
            ajustement: 400,
            nom: 'Surplus calorique pour prise de masse'
        });

        // Perte de poids: -300 à -500 calories
        const pertePoids = new DecisionNode(null, null, null, null, null, {
            ajustement: -400,
            nom: 'Déficit calorique pour perte de poids'
        });

        // Maintien/Remise en forme: +/- 0 calories
        const maintien = new DecisionNode(null, null, null, null, null, {
            ajustement: 0,
            nom: 'Maintien calorique'
        });

        const masseNode = new DecisionNode('objectif', '==', 'Prise de masse', priseMasse, maintien);
        const rootNode = new DecisionNode('objectif', '==', 'Perte de poids', pertePoids, masseNode);

        return rootNode;
    }

    // ARBRE 4 : RÉPARTITION DES MACRONUTRIMENTS
    static buildRepartitionMacrosTree() {
        // Prise de masse: Protéines 25%, Glucides 50%, Lipides 25%
        const macrosMasse = new DecisionNode(null, null, null, null, null, {
            proteines: 0.25,  // 25% des calories
            glucides: 0.50,   // 50% des calories
            lipides: 0.25     // 25% des calories
        });

        // Perte de poids: Protéines 35%, Glucides 35%, Lipides 30%
        const macrosPerte = new DecisionNode(null, null, null, null, null, {
            proteines: 0.35,
            glucides: 0.35,
            lipides: 0.30
        });

        // Maintien: Protéines 30%, Glucides 40%, Lipides 30%
        const macrosMaintien = new DecisionNode(null, null, null, null, null, {
            proteines: 0.30,
            glucides: 0.40,
            lipides: 0.30
        });

        const masseNode = new DecisionNode('objectif', '==', 'Prise de masse', macrosMasse, macrosMaintien);
        const rootNode = new DecisionNode('objectif', '==', 'Perte de poids', macrosPerte, masseNode);

        return rootNode;
    }

    // ARBRE 5 : NOMBRE DE REPAS PAR JOUR
    static buildNombreRepasTree() {
        // Prise de masse: 5-6 repas (facilite l'apport calorique)
        const masseManyMeals = new DecisionNode(null, null, null, null, null, {
            nombre: 5,
            repartition: ['Petit-déjeuner', 'Collation matin', 'Déjeuner', 'Collation après-midi', 'Dîner']
        });

        // Perte de poids: 3-4 repas (facilite le déficit)
        const perteFewMeals = new DecisionNode(null, null, null, null, null, {
            nombre: 4,
            repartition: ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']
        });

        // Maintien: 4-5 repas
        const maintienMeals = new DecisionNode(null, null, null, null, null, {
            nombre: 4,
            repartition: ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']
        });

        const masseNode = new DecisionNode('objectif', '==', 'Prise de masse', masseManyMeals, maintienMeals);
        const rootNode = new DecisionNode('objectif', '==', 'Perte de poids', perteFewMeals, masseNode);

        return rootNode;
    }

    // ARBRE 6 : RESTRICTIONS ALIMENTAIRES
    static evaluateRestrictionsAlimentaires(context) {
        let alimentsInterdits = [];
        let categoriesInterdites = [];

        // Règle 1: Végétarien
        const vegetarienRule = new DecisionNode(
            'regime', 'includes', 'Végétarien',
            new DecisionNode(null, null, null, null, null, {
                aliments: ['Viande', 'Poisson', 'Fruits de mer'],
                categories: ['Viandes', 'Poissons']
            }),
            new DecisionNode(null, null, null, null, null, { aliments: [], categories: [] })
        );

        // Règle 2: Végétalien (Vegan)
        const veganRule = new DecisionNode(
            'regime', 'includes', 'Végétalien',
            new DecisionNode(null, null, null, null, null, {
                aliments: ['Viande', 'Poisson', 'Fruits de mer', 'Œufs', 'Lait', 'Fromage', 'Yaourt', 'Beurre'],
                categories: ['Viandes', 'Poissons', 'Produits laitiers']
            }),
            new DecisionNode(null, null, null, null, null, { aliments: [], categories: [] })
        );

        // Règle 3: Sans gluten
        const glutenRule = new DecisionNode(
            'allergies', 'includes', 'Gluten',
            new DecisionNode(null, null, null, null, null, {
                aliments: ['Blé', 'Pain', 'Pâtes', 'Orge', 'Seigle'],
                categories: ['Céréales avec gluten']
            }),
            new DecisionNode(null, null, null, null, null, { aliments: [], categories: [] })
        );

        // Règle 4: Sans lactose
        const lactoseRule = new DecisionNode(
            'allergies', 'includes', 'Lactose',
            new DecisionNode(null, null, null, null, null, {
                aliments: ['Lait', 'Fromage', 'Yaourt', 'Crème'],
                categories: ['Produits laitiers']
            }),
            new DecisionNode(null, null, null, null, null, { aliments: [], categories: [] })
        );

        // Règle 5: Sans noix
        const noixRule = new DecisionNode(
            'allergies', 'includes', 'Noix',
            new DecisionNode(null, null, null, null, null, {
                aliments: ['Noix', 'Noisettes', 'Amandes', 'Cacahuètes', 'Pistaches', 'Noix de cajou', 'Noix de pécan'],
                categories: ['Fruits à coque']
            }),
            new DecisionNode(null, null, null, null, null, { aliments: [], categories: [] })
        );

        // Règle 6: Diabète (limiter sucres rapides)
        const diabeteRule = new DecisionNode(
            'conditions_medicales', 'includes', 'Diabète',
            new DecisionNode(null, null, null, null, null, {
                aliments: ['Sucre blanc', 'Bonbons', 'Sodas', 'Pâtisseries'],
                categories: ['Sucreries']
            }),
            new DecisionNode(null, null, null, null, null, { aliments: [], categories: [] })
        );

        // Exécution de tous les arbres
        const rules = [vegetarienRule, veganRule, glutenRule, lactoseRule, noixRule, diabeteRule];

        rules.forEach(rule => {
            const result = rule.evaluate(context);
            if (result && result.aliments.length > 0) {
                alimentsInterdits = [...alimentsInterdits, ...result.aliments];
                categoriesInterdites = [...categoriesInterdites, ...result.categories];
            }
        });

        return { alimentsInterdits, categoriesInterdites };
    }

    // ARBRE 7 : AJUSTEMENT IMC POUR L'ALIMENTATION
    static buildIMCAjustementAlimentaireTree() {
        // Obésité (IMC > 30): Réduction supplémentaire de 200 calories
        const obesity = new DecisionNode(null, null, null, null, null, -200);

        // Surpoids (IMC 25-30): Réduction de 100 calories
        const overweight = new DecisionNode(null, null, null, null, null, -100);

        // Poids normal: Pas d'ajustement
        const normal = new DecisionNode(null, null, null, null, null, 0);

        // Maigreur (IMC < 18.5): Augmentation de 150 calories
        const underweight = new DecisionNode(null, null, null, null, null, 150);

        const imc18Node = new DecisionNode('imcValue', '<', 18.5, underweight, normal);
        const imc25Node = new DecisionNode('imcValue', '>', 25, overweight, imc18Node);
        const rootNode = new DecisionNode('imcValue', '>', 30, obesity, imc25Node);

        return rootNode;
    }

    // MÉTHODE PRINCIPALE DE GÉNÉRATION
    static async generateProgramme(profilId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const profil = await Profil.findById(profilId, client);
            console.log('Profil récupéré pour génération :', profil);
            if (!profil) throw new Error('Profil non trouvé');

            const objectif = await Objectif.findByProfilId(profil.id_profil, client);
            if (!objectif) throw new Error('Objectif non trouvé pour ce profil');

            const createdProgramme = await Programme.create({
                nom: 'Programme de ' + objectif.categorie_obj,
                description: objectif.description,
                date_debut: objectif.date_debut,
                date_fin: objectif.date_fin,
                id_profil: profilId
            }, client);

            const programme_id = createdProgramme.id_programme;

            const programmeAlimentaire = await this.generateProgrammeAlimentaire(profil, objectif, programme_id, client);
            await this.generateSessionsRepas(programmeAlimentaire, profil, objectif, client);

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erreur lors de la génération du programme :', error);
            throw error;
        } finally {
            client.release();
        }
    }

    static async generateProgrammeAlimentaire(profil, objectif, programme_id, client) {
        // Calcul de l'IMC
        const tailleMetre = profil.taille > 3 ? profil.taille / 100 : profil.taille;
        const imcValue = profil.poids / (tailleMetre * tailleMetre);

        // Récupération des informations de santé (Conditions médicales)
        const infoSanteObj = await InformationSante.findById(profil.id_information_sante, client);
        const conditionsMedicales = infoSanteObj ? infoSanteObj.conditions_medicales : [];

        // Récupération du Régime Alimentaire (Type + Restrictions/Allergies)
        // Note: profil.regime_id est la clé étrangère
        const regimeData = await RegimeAlimentaire.findById(profil.regime_id, client);

        // On normalise en tableau pour l'arbre de décision
        const regimeAlimentaire = regimeData ? [regimeData.alimentation] : [];
        // Les restrictions (allergies, intolérances) sont stockées dans le JSON restrictions_alimentaires
        const allergies = regimeData ? regimeData.restrictions_alimentaires : [];

        // Contexte pour les arbres de décision
        const context = {
            sexe: profil.sexe,
            age: profil.age,
            poids: profil.poids,
            taille: profil.taille > 3 ? profil.taille : profil.taille * 100, // en cm
            frequence: profil.frequence,
            objectif: objectif.categorie_obj,
            imcValue: imcValue,
            regime: regimeAlimentaire || [],
            allergies: allergies || [],
            conditions_medicales: conditionsMedicales || []
        };

        console.log('Contexte alimentaire:', context);

        // ARBRE 1: Métabolisme de base
        const mbTree = this.buildMetabolismeBaseTree();
        const mbResult = mbTree.evaluate(context);
        const metabolismeBase = mbResult.formule(context.poids, context.taille, context.age);
        console.log('Métabolisme de base calculé:', {
            sexe: context.sexe,
            poids: context.poids,
            taille: context.taille,
            age: context.age,
            resultat: metabolismeBase,
            formule: context.sexe === 'Homme'
                ? '88.362 + (13.397 × poids) + (4.799 × taille) - (5.677 × âge)'
                : '447.593 + (9.247 × poids) + (3.098 × taille) - (4.330 × âge)'
        });
        // ARBRE 2: Coefficient d'activité
        const activityTree = this.buildCoefficientActiviteTree();
        const coefficientActivite = activityTree.evaluate(context);

        // Calories de maintien
        const caloriesMaintien = metabolismeBase * coefficientActivite;

        // ARBRE 3: Ajustement objectif
        const objectifTree = this.buildAjustementObjectifTree();
        const ajustementObjectif = objectifTree.evaluate(context);

        // ARBRE 7: Ajustement IMC
        const imcTree = this.buildIMCAjustementAlimentaireTree();
        const ajustementIMC = imcTree.evaluate(context);

        // Calories totales
        const caloriesJournalieres = Math.round(caloriesMaintien + ajustementObjectif.ajustement + ajustementIMC);

        // ARBRE 4: Répartition des macros
        const macrosTree = this.buildRepartitionMacrosTree();
        const macros = macrosTree.evaluate(context);

        // Calcul des macronutriments en grammes
        const macrosGrammes = {
            proteines: Math.round((caloriesJournalieres * macros.proteines) / 4), // 4 cal/g
            glucides: Math.round((caloriesJournalieres * macros.glucides) / 4),   // 4 cal/g
            lipides: Math.round((caloriesJournalieres * macros.lipides) / 9)      // 9 cal/g
        };

        // ARBRE 5: Nombre de repas
        const repasTree = this.buildNombreRepasTree();
        const planRepas = repasTree.evaluate(context);

        // ARBRE 6: Restrictions
        const restrictions = this.evaluateRestrictionsAlimentaires(context);

        const description = `Programme alimentaire personnalisé :
        - ${caloriesJournalieres} calories par jour
        - Protéines: ${macrosGrammes.proteines}g | Glucides: ${macrosGrammes.glucides}g | Lipides: ${macrosGrammes.lipides}g
        - ${planRepas.nombre} repas par jour
        ${restrictions.alimentsInterdits.length > 0 ? `- Restrictions: ${restrictions.alimentsInterdits.join(', ')}` : ''}`;

        const programme_alimentaire = await Programme_al.create({
            nom: 'Programme Alimentaire de ' + objectif.categorie_obj,
            description: description,
            id_programme: programme_id
        }, client);

        // Attacher les données calculées pour utilisation ultérieure
        programme_alimentaire.caloriesJournalieres = caloriesJournalieres;
        programme_alimentaire.macros = macrosGrammes;
        programme_alimentaire.planRepas = planRepas;
        programme_alimentaire.restrictions = restrictions;

        return programme_alimentaire;
    }

    static async generateSessionsRepas(programmeData, profil, objectif, client) {
        // programmeData contient déjà l'objet enrichi retourné par generateProgrammeAlimentaire

        // Si pas de données détaillées, on arrête
        if (!programmeData.caloriesJournalieres) {
            console.log('Erreur: Données nutritionnelles manquantes pour la génération des sessions.');
            return;
        }

        const { id_programme_a } = programmeData;
        const { caloriesJournalieres, macros, planRepas, restrictions } = programmeData;

        console.log('Génération des sessions pour planRepas:', planRepas);

        if (!planRepas || !planRepas.repartition) {
            console.error('Erreur: planRepas.repartition est indéfini');
            return;
        }

        const caloriesParRepas = Math.round(caloriesJournalieres / planRepas.nombre);

        const debut = new Date(objectif.date_debut);
        const fin = new Date(objectif.date_fin);
        const joursDuration = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24));

        // Génération des sessions repas pour chaque jour
        for (let jour = 0; jour < joursDuration; jour++) {
            const dateRepas = new Date(debut);
            dateRepas.setDate(dateRepas.getDate() + jour);

            for (let i = 0; i < planRepas.repartition.length; i++) {
                const typeRepas = planRepas.repartition[i] || 'Repas';

                const sessionRepasData = {
                    nom: `${typeRepas} - Jour ${jour + 1}`,
                    type_repas: typeRepas,
                    description: `${typeRepas} personnalisé (${caloriesParRepas} cal)`,
                    date_repas: dateRepas,
                    heure_repas: this.getHeureRepas(typeRepas),
                    id_programme_a: id_programme_a
                };

                const newSessionRepas = await Session_repas.create(sessionRepasData, client);

                // Sélection des plats selon le type de repas et les restrictions
                await this.ajouterPlatsAuRepas(
                    newSessionRepas.id_session_repas,
                    typeRepas,
                    caloriesParRepas,
                    restrictions,
                    client
                );
            }
        }
    }


    static getHeureRepas(typeRepas) {
        const heures = {
            'Petit-déjeuner': '08:00',
            'Collation matin': '10:30',
            'Déjeuner': '12:30',
            'Collation': '16:00',
            'Collation après-midi': '16:00',
            'Dîner': '19:30'
        };
        return heures[typeRepas] || '12:00';
    }

    static async ajouterPlatsAuRepas(sessionRepasId, typeRepas, caloriesCible, restrictions, client) {
        let ordre = 1;
        let caloriesRestantes = caloriesCible;

        console.log(`--- Génération repas : ${typeRepas} (${caloriesCible} kcal) ---`);

        // 1. ÉTAPE : LE PLAT PRINCIPAL (Indispensable pour Déjeuner/Dîner/Petit-déj)
        let hasMainPlat = (typeRepas !== 'Collation' && typeRepas !== 'Collation matin' && typeRepas !== 'Collation après-midi');
        let mainElement = null;

        if (hasMainPlat) {
            // Le plat doit faire environ 70% du repas
            const ciblePlat = caloriesCible * 0.7;
            // On autorise un plat qui fait jusqu'à 90% des calories cible
            mainElement = await Plat.findCompatible(caloriesCible * 0.9, restrictions.alimentsInterdits, typeRepas, client);

            if (mainElement) {
                await Session_repas_plat.create({
                    id_session_repas: sessionRepasId,
                    id_plat: mainElement.id_plat,
                    ordre: ordre++,
                    quantite: 1
                }, client);
                caloriesRestantes -= parseFloat(mainElement.calorie);
                console.log(`   ✅ Plat trouvé : ${mainElement.nom} (${mainElement.calorie} kcal)`);
            } else {
                console.log(`   ⚠️ Aucun plat trouvé pour ${typeRepas} sous ${caloriesCible * 0.9} kcal`);
            }
        }

        // 2. ÉTAPE : ENTRÉE ET/OU DESSERT (Selon les calories restantes)
        // On essaie de compléter si on a encore de la place
        if (caloriesRestantes > 50) {

            // Pour le petit-déjeuner ou collation, on cherche uniquement un dessert (fruit, yaourt)
            if (typeRepas.includes('Collation') || typeRepas === 'Petit-déjeuner') {
                const sideElement = await Dessert.findCompatible(caloriesRestantes, restrictions.alimentsInterdits, typeRepas, client);
                if (sideElement) {
                    await Session_repas_plat.create({
                        id_session_repas: sessionRepasId,
                        id_dessert: sideElement.id_dessert,
                        ordre: ordre++,
                        quantite: 1
                    }, client);
                    caloriesRestantes -= parseFloat(sideElement.calorie);
                    console.log(`   ✅ Dessert/Collation ajouté : ${sideElement.nom} (${sideElement.calorie} kcal)`);
                }
            }
            // Pour Déjeuner/Dîner, on essaie de mettre Entrée ET Dessert si possible
            else {
                // Tentative Entrée
                const entree = await Entree.findCompatible(caloriesRestantes * 0.6, restrictions.alimentsInterdits, typeRepas, client); // On garde de la place pour le dessert
                if (entree) {
                    await Session_repas_plat.create({
                        id_session_repas: sessionRepasId,
                        id_entree: entree.id_entree,
                        ordre: ordre++,
                        quantite: 1
                    }, client);
                    caloriesRestantes -= parseFloat(entree.calorie);
                    console.log(`   ✅ Entrée ajoutée : ${entree.nom} (${entree.calorie} kcal)`);
                }

                // Tentative Dessert (avec ce qu'il reste)
                if (caloriesRestantes > 50) {
                    const dessert = await Dessert.findCompatible(caloriesRestantes, restrictions.alimentsInterdits, typeRepas, client);
                    if (dessert) {
                        await Session_repas_plat.create({
                            id_session_repas: sessionRepasId,
                            id_dessert: dessert.id_dessert,
                            ordre: ordre++,
                            quantite: 1
                        }, client);
                        caloriesRestantes -= parseFloat(dessert.calorie);
                        console.log(`   ✅ Dessert ajouté : ${dessert.nom} (${dessert.calorie} kcal)`);
                    }
                }
            }
        }

        // 3. CAS DÉGRADÉ : Si on n'a strictement rien trouvé
        if (ordre === 1) {
            // Si c'est une collation, on cherche d'abord un Dessert ou une Entrée en backup
            if (typeRepas.includes('Collation') || typeRepas.includes('Goûter')) {
                let backupSnack = await Dessert.findCompatible(caloriesCible, [], typeRepas, client);
                if (!backupSnack) {
                    backupSnack = await Entree.findCompatible(caloriesCible, [], typeRepas, client);
                }

                if (backupSnack) {
                    await Session_repas_plat.create({
                        id_session_repas: sessionRepasId,
                        id_dessert: backupSnack.id_dessert || null,
                        id_entree: backupSnack.id_entree || null,
                        ordre: ordre++,
                        quantite: 1
                    }, client);
                    console.log(`   🚨 Backup Collation utilisé : ${backupSnack.nom}`);
                    return; // On a trouvé, on quitte
                }
            }

            // Sinon (ou si échec backup collation), on cherche un Plat
            const backup = await Plat.findCompatible(caloriesCible, [], typeRepas, client);
            if (backup) {
                await Session_repas_plat.create({
                    id_session_repas: sessionRepasId,
                    id_plat: backup.id_plat,
                    ordre: ordre++,
                    quantite: 1
                }, client);
                console.log(`   🚨 Backup Plat utilisé : ${backup.nom}`);
            }
        }
    }

    static getStructureRepas(typeRepas) {
        const structures = {
            'Petit-déjeuner': [
                { type: 'plat', proportion: 0.7 },
                { type: 'dessert', proportion: 0.3 }
            ],
            'Collation matin': [
                { type: 'dessert', proportion: 1.0 }
            ],
            'Déjeuner': [
                { type: 'entree', proportion: 0.2 },
                { type: 'plat', proportion: 0.6 },
                { type: 'dessert', proportion: 0.2 }
            ],
            'Collation': [
                { type: 'dessert', proportion: 1.0 }
            ],
            'Collation après-midi': [
                { type: 'dessert', proportion: 1.0 }
            ],
            'Dîner': [
                { type: 'entree', proportion: 0.2 },
                { type: 'plat', proportion: 0.6 },
                { type: 'dessert', proportion: 0.2 }
            ]
        };
        return structures[typeRepas] || [{ type: 'plat', proportion: 1.0 }];
    }
}

module.exports = ProgrammeAlimentaireGenerator;

