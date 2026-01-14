const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function insertScenario() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🚀 Démarrage du scénario d\'insertion COMPLET et RÉVISÉ...');

    const passwordHash = await bcrypt.hash('12345678', 10);
    const email = 'johndoe@test.com';

    // 0. NETTOYAGE COMPLET
    console.log('🧹 Nettoyage des anciennes données...');
    await client.query(`DELETE FROM modeles_seance_exos`);
    await client.query(`DELETE FROM modeles_seance`);
    await client.query(`DELETE FROM classement_user`);
    await client.query(`DELETE FROM classement`);
    await client.query(`DELETE FROM record`);
    await client.query(`DELETE FROM mascotte`);
    await client.query(`DELETE FROM session_repas_plats`);
    await client.query(`DELETE FROM session_repas`);
    await client.query(`DELETE FROM session_sport_exos`);
    await client.query(`DELETE FROM session_sport`);
    await client.query(`DELETE FROM programme_alimentaire`);
    await client.query(`DELETE FROM programme_sportif`);
    await client.query(`DELETE FROM programme`);
    await client.query(`DELETE FROM profil WHERE id_utilisateur IN (SELECT id_utilisateur FROM utilisateurs WHERE email = $1 OR email LIKE 'bot%@test.com')`, [email]);
    await client.query(`DELETE FROM utilisateurs WHERE email = $1 OR email LIKE 'bot%@test.com'`, [email]);

    // =============================================
    // 1. DONNÉES DE RÉFÉRENCE
    // =============================================
    await client.query(`INSERT INTO categorie_objectif (nom, description) VALUES ('Perte de poids', 'Desc'), ('Prise de masse', 'Desc'), ('Endurance', 'Desc') ON CONFLICT (nom) DO NOTHING;`);
    
    const catEquipRes = await client.query(`INSERT INTO categorie_equipement (list_equipement) VALUES ('["Haltères", "Banc", "Salle de sport", "Aucun"]'::json) RETURNING id_categorie_equipement;`);
    const idCatEquip = catEquipRes.rows[0].id_categorie_equipement;

    const idsEq = {};
    const typesEq = ["Aucun", "Barre", "Haltères", "Machine", "Poulie", "Cable", "Presse", "Banc"];
    for(const t of typesEq) {
        const res = await client.query(`INSERT INTO equipementExo (list_equipement) VALUES ($1::json) RETURNING id_equipement;`, [JSON.stringify([t])]);
        idsEq[t] = res.rows[0].id_equipement;
    }

    const infoSanteRes = await client.query(`INSERT INTO information_sante (conditions_medicales, condition_physique) VALUES ('[]'::json, '[]'::json) RETURNING id_information_sante;`);
    const idInfoSante = infoSanteRes.rows[0].id_information_sante;

    const regimeRes = await client.query(`INSERT INTO regime_alimentaire (alimentation, restrictions_alimentaires) VALUES ('Omnivore', '[]'::json) RETURNING id_regime;`);
    const idRegime = regimeRes.rows[0].id_regime;

    // =============================================
    // 2. UTILISATEUR & PROFIL PRINCIPAL
    // =============================================
    const userRes = await client.query(`INSERT INTO utilisateurs (pseudo, email, password, role) VALUES ('JohnDoe', $1, $2, 'admin') RETURNING id_utilisateur;`, [email, passwordHash]);
    const userId = userRes.rows[0].id_utilisateur;

    const objRes = await client.query(`INSERT INTO objectif (description, categorie_obj, actif, date_debut, date_fin) VALUES ('Objectif Test', 'Perte de poids', true, CURRENT_DATE, CURRENT_DATE + 30) RETURNING id_objectif;`);
    const idObjectif = objRes.rows[0].id_objectif;

    const profilRes = await client.query(`INSERT INTO profil (age, taille, poids, niveau, sexe, frequence, jour_disponible, heure_disponible, id_equipement, id_utilisateur, objectif_id, id_information_sante, regime_id) VALUES (30, 180, 85, 'Débutant', 'Homme', 3, '["Lundi", "Mercredi", "Vendredi"]'::jsonb, '18:30', $1, $2, $3, $4, $5) RETURNING id_profil;`, [idCatEquip, userId, idObjectif, idInfoSante, idRegime]);
    const idProfil = profilRes.rows[0].id_profil;

    // =============================================
    // 2.1 ÉVÉNEMENTS DE TEST (NOUVEAU)
    // =============================================
    console.log('📅 Insertion des événements...');
    await client.query(`
        INSERT INTO evenement (nom, description, lieu, date, heure, duree, organisateur_id, categorie) 
        VALUES 
        ('Session Crossfit Plage', 'Séance intensive sur le sable', 'Plage de Ouistreham', CURRENT_DATE + 5, '10:00', 90, $1, 'Crossfit'),
        ('Yoga au Parc', 'Détente et souplesse', 'Parc de la Colline', CURRENT_DATE + 2, '18:00', 60, $1, 'Yoga');
    `, [userId]);

    // =============================================
    // 3. ALIMENTATION MASSIVE (25 x 3)
    // =============================================
    console.log('🍎 Insertion des 75 aliments avec moments et macros...');
    
    const entreesData = [
        { n: "Salade César", rec: "Mélanger la laitue, les croûtons, le parmesan et la sauce César. Ajouter le poulet grillé.", cal: 180, p: 12, g: 5, l: 12, reg: "Omnivore", res: ["Viande", "Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Soupe Oignon", rec: "Faire revenir les oignons émincés. Ajouter bouillon et cuire 20min. Gratiné au four.", cal: 120, p: 3, g: 15, l: 5, reg: "Végétarien", res: ["Gluten"], mom: ["Dîner"] },
        { n: "Carpaccio", rec: "Trancher finement le boeuf. Assaisonner avec huile olive, citron, basilic et copeaux de parmesan.", cal: 150, p: 20, g: 0, l: 8, reg: "Omnivore", res: ["Viande"], mom: ["Déjeuner", "Dîner"] },
        { n: "Taboulé", rec: "Préparer la semoule. Mélanger avec tomates, concombres, menthe, persil, citron et huile d'olive.", cal: 210, p: 4, g: 35, l: 8, reg: "Végétalien", res: ["Gluten"], mom: ["Déjeuner"] },
        { n: "Oeufs Mimosa", rec: "Cuire les oeufs durs. Mélanger les jaunes avec de la mayonnaise. Farcir les blancs.", cal: 190, p: 10, g: 2, l: 16, reg: "Végétarien", res: ["Oeufs"], mom: ["Déjeuner"] },
        { n: "Gaspacho", rec: "Mixer tomates, poivrons, concombres, ail, huile d'olive et vinaigre. Servir très frais.", cal: 90, p: 2, g: 12, l: 4, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Rillettes Thon", rec: "Mélanger thon émietté avec fromage frais, ciboulette et jus de citron. Servir frais.", cal: 240, p: 18, g: 2, l: 18, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner"] },
        { n: "Salade Caprese", rec: "Alterner tranches de tomates et mozzarella. Ajouter basilic frais, huile d'olive et sel.", cal: 220, p: 12, g: 4, l: 16, reg: "Végétarien", res: ["Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Velouté Potiron", rec: "Cuire potiron et oignon dans bouillon. Mixer avec un peu de crème (optionnel). Assaisonner.", cal: 80, p: 2, g: 10, l: 2, reg: "Végétalien", res: [], mom: ["Dîner"] },
        { n: "Tartare Saumon", rec: "Couper le saumon frais en dés. Mélanger avec échalote, aneth, citron et huile d'olive.", cal: 170, p: 18, g: 0, l: 10, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner", "Dîner"] },
        { n: "Foie Gras", rec: "Servir le foie gras frais sur du pain grillé avec confit d'oignon ou de figue.", cal: 350, p: 5, g: 2, l: 35, reg: "Omnivore", res: ["Viande"], mom: ["Dîner"] },
        { n: "Salade Chèvre", rec: "Toast de chèvre chaud sur lit de salade verte avec noix et vinaigrette au miel.", cal: 280, p: 14, g: 20, l: 18, reg: "Végétarien", res: ["Lait", "Gluten"], mom: ["Déjeuner", "Dîner"] },
        { n: "Crevettes", rec: "Crevettes cuites servies fraîches avec mayonnaise ou aïoli maison.", cal: 140, p: 22, g: 4, l: 4, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner"] },
        { n: "Melon Jambon", rec: "Servir des tranches de melon frais avec du jambon cru de parme ou serrano.", cal: 160, p: 8, g: 22, l: 4, reg: "Omnivore", res: ["Viande"], mom: ["Déjeuner"] },
        { n: "Caviar Aubergine", rec: "Cuire aubergines au four. Récupérer la chair, mixer avec ail, citron et huile d'olive.", cal: 110, p: 2, g: 8, l: 8, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Salade Grecque", rec: "Tomates, concombres, olives noires, oignon rouge et feta. Origan et huile d'olive.", cal: 190, p: 6, g: 8, l: 15, reg: "Végétarien", res: ["Lait"], mom: ["Déjeuner"] },
        { n: "Rouleaux Printemps", rec: "Galette de riz garnie de vermicelles, crevettes ou tofu, menthe, coriandre et laitue.", cal: 130, p: 6, g: 18, l: 2, reg: "Végétalien", res: [], mom: ["Déjeuner"] },
        { n: "Asperges", rec: "Cuire les asperges à la vapeur ou à l'eau. Servir avec vinaigrette ou sauce mousseline.", cal: 70, p: 2, g: 4, l: 5, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Terrine", rec: "Terrine de campagne servie avec cornichons et pain de campagne.", cal: 260, p: 12, g: 2, l: 22, reg: "Omnivore", res: ["Viande"], mom: ["Déjeuner"] },
        { n: "Bouchées Reine", rec: "Feuilleté garni d'une sauce blanche aux champignons, poulet et quenelles.", cal: 320, p: 12, g: 25, l: 20, reg: "Omnivore", res: ["Viande", "Gluten"], mom: ["Déjeuner"] },
        { n: "Salade Lentilles", rec: "Lentilles cuites froides, échalotes, carottes et vinaigrette moutardée.", cal: 230, p: 12, g: 30, l: 6, reg: "Végétalien", res: [], mom: ["Déjeuner"] },
        { n: "Quiche", rec: "Pâte brisée garnie d'un appareil à crème prise (oeufs, crème) et lardons/légumes.", cal: 310, p: 12, g: 22, l: 20, reg: "Omnivore", res: ["Viande", "Gluten", "Oeufs"], mom: ["Déjeuner", "Dîner"] },
        { n: "Avocat Crevette", rec: "Demi-avocat garni de crevettes cocktails et sauce cocktail (mayo-ketchup).", cal: 290, p: 12, g: 4, l: 25, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner"] },
        { n: "Samoussa", rec: "Feuille de brick pliée en triangle garnie de légumes épicés ou viande. Frit ou au four.", cal: 180, p: 4, g: 22, l: 10, reg: "Végétarien", res: ["Gluten"], mom: ["Déjeuner"] },
        { n: "Tzatziki", rec: "Yaourt grec mélangé avec concombre râpé dégorgé, ail, aneth et huile d'olive.", cal: 160, p: 6, g: 18, l: 6, reg: "Végétarien", res: ["Lait"], mom: ["Déjeuner"] }
    ];
    let firstEntreeId;
    for (const e of entreesData) {
        const res = await client.query(`INSERT INTO entree (nom, description, recette, calorie, proteine, glucide, lipide, moment_repas, regime_alimentaire, restrictions_alimentaires) VALUES ($1, 'Une délicieuse entrée', $2, $3, $4, $5, $6, $7::jsonb, $8, $9::json) RETURNING id_entree;`, [e.n, e.rec, e.cal, e.p, e.g, e.l, JSON.stringify(e.mom), e.reg, JSON.stringify(e.res)]);
        if (!firstEntreeId) firstEntreeId = res.rows[0].id_entree;
    }

    const platsData = [
        { n: "Poulet Basquaise", rec: "Poulet mijoté avec poivrons, tomates, oignons, ail et piment d'Espelette.", cal: 450, p: 40, g: 30, l: 15, reg: "Omnivore", res: ["Viande"], mom: ["Déjeuner", "Dîner"] },
        { n: "Steak Frites", rec: "Steak de boeuf grillé accompagné de frites maison au four ou frites.", cal: 750, p: 45, g: 60, l: 40, reg: "Omnivore", res: ["Viande"], mom: ["Déjeuner"] },
        { n: "Saumon Riz", rec: "Pavé de saumon grillé ou vapeur servi avec du riz blanc ou complet citronné.", cal: 500, p: 35, g: 40, l: 20, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner", "Dîner"] },
        { n: "Curry Tofu", rec: "Dés de tofu sautés avec légumes dans une sauce curry coco. Servir avec riz.", cal: 380, p: 25, g: 45, l: 12, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Omelette Légumes", rec: "Battre les oeufs, ajouter poivrons, champignons, oignons sautés. Cuire à la poêle.", cal: 320, p: 20, g: 5, l: 22, reg: "Végétarien", res: ["Oeufs"], mom: ["Déjeuner", "Dîner", "Petit-déjeuner"] },
        { n: "Salade de Thon", rec: "Grande salade composée avec thon, maïs, tomates, oeufs durs et crudités.", cal: 350, p: 30, g: 10, l: 20, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner"] },
        { n: "Colin Vapeur", rec: "Filet de colin cuit à la vapeur avec herbes de provence et filet de citron.", cal: 280, p: 35, g: 5, l: 5, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner", "Dîner"] },
        { n: "Bowl Quinoa", rec: "Bol composé de quinoa, avocat, pois chiches, patate douce rôtie et graines.", cal: 420, p: 15, g: 50, l: 18, reg: "Végétalien", res: [], mom: ["Déjeuner"] },
        { n: "Lasagnes Boeuf", rec: "Couches de pâtes, sauce bolognaise maison et béchamel. Gratiné au fromage.", cal: 650, p: 30, g: 60, l: 30, reg: "Omnivore", res: ["Viande", "Gluten"], mom: ["Déjeuner", "Dîner"] },
        { n: "Lasagnes Epinards", rec: "Lasagnes végétariennes avec épinards, ricotta et sauce tomate.", cal: 550, p: 25, g: 55, l: 25, reg: "Végétarien", res: ["Gluten", "Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Risotto Champis", rec: "Riz arborio cuit lentement avec bouillon, vin blanc et champignons. Terminer avec parmesan.", cal: 480, p: 12, g: 60, l: 18, reg: "Végétarien", res: ["Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Wok Crevettes", rec: "Crevettes sautées au wok avec légumes croquants, sauce soja et nouilles.", cal: 340, p: 28, g: 40, l: 8, reg: "Omnivore", res: ["Poisson"], mom: ["Déjeuner", "Dîner"] },
        { n: "Chili Vegan", rec: "Mijoté de haricots rouges, maïs, tomates, poivrons et protéines de soja texturées.", cal: 410, p: 20, g: 55, l: 12, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Mignon Porc", rec: "Filet mignon de porc rôti au four avec moutarde et herbes.", cal: 480, p: 40, g: 10, l: 25, reg: "Omnivore", res: ["Viande"], mom: ["Dîner"] },
        { n: "Burger Maison", rec: "Pain burger, steak haché, cheddar, salade, tomate, oignon. Sauce au choix.", cal: 700, p: 35, g: 50, l: 35, reg: "Omnivore", res: ["Viande", "Gluten"], mom: ["Déjeuner"] },
        { n: "Ratatouille Riz", rec: "Mijoté provencal de courgettes, aubergines, poivrons, tomates. Servir avec riz.", cal: 350, p: 8, g: 60, l: 10, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Tartiflette", rec: "Gratin de pommes de terre, reblochon, lardons et oignons. Crémeux et riche.", cal: 850, p: 30, g: 50, l: 55, reg: "Omnivore", res: ["Viande", "Lait"], mom: ["Dîner"] },
        { n: "Hachis", rec: "Purée de pommes de terre sur lit de viande hachée revenue aux oignons. Gratiné.", cal: 550, p: 30, g: 50, l: 25, reg: "Omnivore", res: ["Viande"], mom: ["Déjeuner", "Dîner"] },
        { n: "Falafels", rec: "Boulettes de pois chiches frites ou au four. Servir dans pita ou salade.", cal: 520, p: 20, g: 55, l: 22, reg: "Végétalien", res: [], mom: ["Déjeuner"] },
        { n: "Blanquette", rec: "Veau mijoté dans une sauce blanche crémée avec carottes et champignons.", cal: 620, p: 40, g: 20, l: 45, reg: "Omnivore", res: ["Viande", "Lait"], mom: ["Déjeuner"] },
        { n: "Dhal Lentilles", rec: "Curry de lentilles corail au lait de coco et épices indiennes.", cal: 390, p: 22, g: 55, l: 10, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Pizza Reine", rec: "Pâte à pizza, sauce tomate, mozzarella, jambon, champignons.", cal: 750, p: 30, g: 85, l: 30, reg: "Omnivore", res: ["Gluten", "Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Pizza 4 Fro", rec: "Pâte à pizza, sauce tomate, mozzarella, chèvre, gorgonzola, emmental.", cal: 1000, p: 35, g: 90, l: 50, reg: "Végétarien", res: ["Gluten", "Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Bourguignon", rec: "Boeuf mariné au vin rouge et mijoté longuement avec carottes et lardons.", cal: 580, p: 45, g: 15, l: 30, reg: "Omnivore", res: ["Viande"], mom: ["Dîner"] },
        { n: "Pancakes Prot", rec: "Pancakes à base de flocons d'avoine, oeufs, fromage blanc et whey protéine.", cal: 380, p: 30, g: 40, l: 10, reg: "Végétarien", res: ["Oeufs", "Gluten"], mom: ["Petit-déjeuner"] }
    ];
    let firstPlatId;
    for (const p of platsData) {
        const res = await client.query(`INSERT INTO plat (nom, description, recette, calorie, proteine, glucide, lipide, moment_repas, regime_alimentaire, restrictions_alimentaires) VALUES ($1, 'Un plat savoureux', $2, $3, $4, $5, $6, $7::jsonb, $8, $9::json) RETURNING id_plat;`, [p.n, p.rec, p.cal, p.p, p.g, p.l, JSON.stringify(p.mom), p.reg, JSON.stringify(p.res)]);
        if (!firstPlatId) firstPlatId = res.rows[0].id_plat;
    }

    const dessertsData = [
        { n: "Yaourt Nature", rec: "Yaourt nature simple. Peut être sucré avec miel ou fruits.", cal: 60, p: 5, g: 6, l: 2, reg: "Végétarien", res: ["Lait"], mom: ["Petit-déjeuner", "Collation"] },
        { n: "Mousse Choco", rec: "Faire fondre chocolat. Monter blancs en neige. Incorporer délicatement. Réfrigérer.", cal: 280, p: 4, g: 25, l: 18, reg: "Végétarien", res: ["Oeufs", "Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Salade Fruits", rec: "Couper fruits de saison en morceaux. Ajouter jus d'orange et menthe.", cal: 80, p: 1, g: 18, l: 0, reg: "Végétalien", res: [], mom: ["Petit-déjeuner", "Collation"] },
        { n: "Tarte Pommes", rec: "Pâte brisée, compote, tranches de pommes. Cuire au four.", cal: 250, p: 2, g: 40, l: 10, reg: "Végétarien", res: ["Gluten"], mom: ["Déjeuner", "Dîner", "Collation"] },
        { n: "Ile Flottante", rec: "Blancs en neige pochés sur une crème anglaise vanille.", cal: 180, p: 6, g: 30, l: 4, reg: "Végétarien", res: ["Oeufs", "Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Crème Brûlée", rec: "Crème riche vanille cuite au four. Saupoudrer de sucre et caraméliser au chalumeau.", cal: 320, p: 4, g: 22, l: 25, reg: "Végétarien", res: ["Lait", "Oeufs"], mom: ["Déjeuner", "Dîner"] },
        { n: "Fondant Choco", rec: "Gâteau chocolat avec coeur coulant. Cuisson rapide et précise.", cal: 380, p: 5, g: 35, l: 22, reg: "Végétarien", res: ["Gluten", "Lait", "Oeufs"], mom: ["Déjeuner", "Dîner"] },
        { n: "Compote", rec: "Pommes cuites doucement avec un peu d'eau et cannelle. Mixer ou écraser.", cal: 70, p: 0, g: 18, l: 0, reg: "Végétalien", res: [], mom: ["Petit-déjeuner", "Collation"] },
        { n: "Fromage Blanc", rec: "Fromage blanc nature ou battu.", cal: 110, p: 10, g: 12, l: 2, reg: "Végétarien", res: ["Lait"], mom: ["Petit-déjeuner", "Collation"] },
        { n: "Tiramisu", rec: "Biscuits café, crème mascarpone oeufs sucre. Cacao en poudre.", cal: 350, p: 6, g: 30, l: 20, reg: "Végétarien", res: ["Lait", "Oeufs", "Gluten"], mom: ["Déjeuner", "Dîner"] },
        { n: "Panna Cotta", rec: "Crème cuite avec gélatine/agar et vanille. Servir avec coulis fruits rouges.", cal: 280, p: 3, g: 22, l: 18, reg: "Végétarien", res: ["Lait"], mom: ["Déjeuner", "Dîner"] },
        { n: "Sorbet Citron", rec: "Glace à l'eau, sucre et jus de citron.", cal: 90, p: 0, g: 22, l: 0, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner", "Collation"] },
        { n: "Glace Vanille", rec: "Crème glacée à la vanille.", cal: 160, p: 3, g: 18, l: 8, reg: "Végétarien", res: ["Lait", "Oeufs"], mom: ["Déjeuner", "Dîner", "Collation"] },
        { n: "Eclair", rec: "Pâte à choux fourrée crème pâtissière chocolat ou café. Glaçage dessus.", cal: 240, p: 4, g: 22, l: 14, reg: "Végétarien", res: ["Gluten", "Lait", "Oeufs"], mom: ["Déjeuner", "Collation"] },
        { n: "Macarons (2)", rec: "Petits gâteaux à l'amande garnis de ganache.", cal: 180, p: 3, g: 25, l: 10, reg: "Végétarien", res: ["Oeufs"], mom: ["Collation"] },
        { n: "Riz au Lait", rec: "Riz rond cuit dans du lait sucré vanillé.", cal: 190, p: 5, g: 32, l: 5, reg: "Végétarien", res: ["Lait"], mom: ["Petit-déjeuner", "Collation"] },
        { n: "Banana Bread", rec: "Cake à la banane écrasée, souvent avec noix ou pépites chocolat.", cal: 220, p: 4, g: 38, l: 8, reg: "Végétarien", res: ["Gluten", "Oeufs"], mom: ["Petit-déjeuner", "Collation"] },
        { n: "Cookies (2)", rec: "Biscuits aux pépites de chocolat croustillants et moelleux.", cal: 290, p: 3, g: 35, l: 15, reg: "Végétarien", res: ["Gluten", "Lait", "Oeufs"], mom: ["Collation"] },
        { n: "Orange Givrée", rec: "Orange évidée remplie de son jus sorbet.", cal: 110, p: 1, g: 25, l: 0, reg: "Végétalien", res: [], mom: ["Déjeuner", "Dîner"] },
        { n: "Poire Hélène", rec: "Poire pochée sirop, servie avec glace vanille et sauce chocolat chaud.", cal: 240, p: 2, g: 30, l: 12, reg: "Végétarien", res: ["Lait"], mom: ["Dîner"] },
        { n: "Flan", rec: "Flan pâtissier sur pâte brisée.", cal: 210, p: 5, g: 30, l: 7, reg: "Végétarien", res: ["Gluten", "Lait", "Oeufs"], mom: ["Déjeuner", "Dîner"] },
        { n: "Crêpe Sucre", rec: "Crêpe fine au sucre ou confiture.", cal: 150, p: 4, g: 22, l: 5, reg: "Végétarien", res: ["Gluten", "Lait", "Oeufs"], mom: ["Collation", "Petit-déjeuner"] },
        { n: "Gaufre Nut", rec: "Gaufre de Bruxelles ou Liège avec pâte à tartiner.", cal: 380, p: 5, g: 45, l: 18, reg: "Végétarien", res: ["Gluten", "Lait", "Oeufs"], mom: ["Collation"] },
        { n: "Chia Pudding", rec: "Graines de chia gonflées dans lait végétal. Fruits dessus.", cal: 180, p: 6, g: 12, l: 10, reg: "Végétalien", res: [], mom: ["Petit-déjeuner"] },
        { n: "Choco Noir", rec: "Carrés de chocolat noir 70% min.", cal: 60, p: 1, g: 4, l: 4, reg: "Végétalien", res: [], mom: ["Collation", "Dîner"] }
    ];
    let firstDessertId;
    for (const d of dessertsData) {
        const res = await client.query(`INSERT INTO dessert (nom, description, recette, calorie, proteine, glucide, lipide, moment_repas, regime_alimentaire, restrictions_alimentaires) VALUES ($1, 'Un dessert gourmand', $2, $3, $4, $5, $6, $7::jsonb, $8, $9::json) RETURNING id_dessert;`, [d.n, d.rec, d.cal, d.p, d.g, d.l, JSON.stringify(d.mom), d.reg, JSON.stringify(d.res)]);
        if (!firstDessertId) firstDessertId = res.rows[0].id_dessert;
    }

    // =============================================
    // 4. EXERCICES
    // =============================================
    console.log('💪 Insertion des exercices...');
    const exercices = [
      { nom: "Pompes", diff: "Débutant", muscles: ["Pectoraux", "Triceps"], eq: idsEq["Aucun"] },
      { nom: "Pompes Diamant", diff: "Intermédiaire", muscles: ["Pectoraux", "Triceps"], eq: idsEq["Aucun"] },
      { nom: "Dev Couché Barre", diff: "Intermédiaire", muscles: ["Pectoraux"], eq: idsEq["Barre"] },
      { nom: "Tractions", diff: "Intermédiaire", muscles: ["Dos", "Biceps"], eq: idsEq["Aucun"] },
      { nom: "Squat Barre", diff: "Intermédiaire", muscles: ["Quadriceps", "Fessiers"], eq: idsEq["Barre"] },
      { nom: "Squat au poids du corps", diff: "Débutant", muscles: ["Quadriceps", "Fessiers"], eq: idsEq["Aucun"] },
      { nom: "Fentes", diff: "Débutant", muscles: ["Jambes", "Fessiers"], eq: idsEq["Aucun"] },
      { nom: "Burpees", diff: "Avancé", muscles: ["Cardio", "Corps entier"], eq: idsEq["Aucun"] },
      { nom: "Jumping Jacks", diff: "Débutant", muscles: ["Cardio"], eq: idsEq["Aucun"] },
      { nom: "Planche", diff: "Débutant", muscles: ["Abdominaux"], eq: idsEq["Aucun"] }
    ];
    const exoMap = new Map();
    for (const exo of exercices) {
      const res = await client.query(`INSERT INTO exos (nom_exercice, description, difficulte, muscle_cibles, url_video_exemple, img, id_equipement) VALUES ($1, 'Desc', $2, $3, 'url', '["default.jpg"]'::json, $4) RETURNING id;`, [exo.nom, exo.diff, JSON.stringify(exo.muscles), exo.eq]);
      exoMap.set(exo.nom, res.rows[0].id);
    }

    // =============================================
    // 5. PROGRAMMES & SESSIONS (CORRECTION FK)
    // =============================================
    console.log('📅 Création Programme Parent & Sessions...');
    const mainProgRes = await client.query(`INSERT INTO programme (nom, date_debut, date_fin, id_profil) VALUES ('Transformation John', CURRENT_DATE, CURRENT_DATE + 30, $1) RETURNING id_programme;`, [idProfil]);
    const idMainProg = mainProgRes.rows[0].id_programme;

    const progSportRes = await client.query(`INSERT INTO programme_sportif (nom, id_programme) VALUES ('Routine Test', $1) RETURNING id_programme_sportif;`, [idMainProg]);
    const idProgSport = progSportRes.rows[0].id_programme_sportif;

    const progAlimRes = await client.query(`INSERT INTO programme_alimentaire (nom, id_programme) VALUES ('Plan Test', $1) RETURNING id_programme_a;`, [idMainProg]);
    const idProgAlim = progAlimRes.rows[0].id_programme_a;

    const sessSportRes = await client.query(`INSERT INTO session_sport (nom, date_session, heure_session, duree_minutes, id_programme_sportif) VALUES ('Séance 1', CURRENT_DATE, '18:00', 60, $1) RETURNING id_session_sport;`, [idProgSport]);
    await client.query(`INSERT INTO session_sport_exos (id_session_sport, id_exo, ordre, repetitions, series, temps_repos_secondes) VALUES ($1, $2, 1, 12, 4, 90);`, [sessSportRes.rows[0].id_session_sport, exoMap.get('Pompes')]);

    const sessRepasRes = await client.query(`INSERT INTO session_repas (nom, type_repas, date_repas, heure_repas, id_programme_a) VALUES ('Dîner Lundi', 'Dîner', CURRENT_DATE, '19:30', $1) RETURNING id_session_repas;`, [idProgAlim]);
    await client.query(`INSERT INTO session_repas_plats (id_session_repas, id_entree, id_plat, id_dessert, ordre, quantite) VALUES ($1, $2, $3, $4, 1, 1);`, [sessRepasRes.rows[0].id_session_repas, firstEntreeId, firstPlatId, firstDessertId]);

    // =============================================
    // 6. GAMIFICATION
    // =============================================
    console.log('🏆 Gamification & Bots...');
    await client.query(`INSERT INTO mascotte (experience, niveau, apparence, id_utilisateur) VALUES (100, 2, '{"color": "blue"}'::jsonb, $1);`, [userId]);
    await client.query(`INSERT INTO record (type_record, score, id_utilisateur, id_exo) VALUES ('Max Reps', 50, $1, $2);`, [userId, exoMap.get('Pompes')]);

    for (let i = 1; i <= 3; i++) {
        const bot = await client.query(`INSERT INTO utilisateurs (pseudo, email, password, role) VALUES ($1, $2, 'hash', 'utilisateur') RETURNING id_utilisateur;`, [`Bot_${i}`, `bot${i}@test.com`]);
        await client.query(`INSERT INTO profil (age, taille, poids, niveau, sexe, frequence, id_utilisateur, id_equipement, objectif_id, id_information_sante, regime_id) VALUES (25, 175, 75, 'Intermédiaire', 'Homme', 3, $1, $2, $3, $4, $5);`, [bot.rows[0].id_utilisateur, idCatEquip, idObjectif, idInfoSante, idRegime]);
    }

    const chal = await client.query(`INSERT INTO classement (nom, description, type_challenge, id_exo, unite_mesure, actif) VALUES ('Le Roi des Pompes', 'Max reps', 'Endurance', $1, 'reps', true) RETURNING id_classement;`, [exoMap.get('Pompes')]);
    await client.query(`INSERT INTO classement_user (id_classement, id_utilisateur, score, statut_validation) VALUES ($1, $2, 45, 'VALIDE');`, [chal.rows[0].id_classement, userId]);

    // =============================================
    // 7. CATALOGUE
    // =============================================
    console.log('🏋️ Catalogue...');
    
    // Modèle Full Body
    const modelFullBody = await client.query(`INSERT INTO modeles_seance (nom, description, tags_zone_corps, tags_equipement, duree_minutes, difficulte) VALUES ('Full Body Express', 'Séance rapide pour tout le corps', '["Corps entier"]', '["Aucun"]', 30, 'Débutant') RETURNING id;`);
    await client.query(`INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions) VALUES ($1, $2, 1, 3, 15);`, [modelFullBody.rows[0].id, exoMap.get('Pompes')]);

    // Modèle Buste
    const modelBuste = await client.query(`INSERT INTO modeles_seance (nom, description, tags_zone_corps, tags_equipement, duree_minutes, difficulte) VALUES ('Séance Buste', 'Travail complet du buste et du haut du corps', '["buste"]', '["Aucun"]', 45, 'Débutant') RETURNING id;`);
    await client.query(`INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions) VALUES ($1, $2, 1, 4, 15);`, [modelBuste.rows[0].id, exoMap.get('Pompes')]);
    await client.query(`INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions) VALUES ($1, $2, 2, 3, 8);`, [modelBuste.rows[0].id, exoMap.get('Tractions')]);

    // Modèle Cardio
    const modelCardio = await client.query(`INSERT INTO modeles_seance (nom, description, tags_zone_corps, tags_equipement, duree_minutes, difficulte) VALUES ('Cardio Intense', 'Brûlez des calories rapidement', '["cardio", "Corps entier"]', '["Aucun"]', 20, 'Intermédiaire') RETURNING id;`);
    await client.query(`INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions) VALUES ($1, $2, 1, 3, 30);`, [modelCardio.rows[0].id, exoMap.get('Jumping Jacks')]);
    await client.query(`INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions) VALUES ($1, $2, 2, 3, 10);`, [modelCardio.rows[0].id, exoMap.get('Burpees')]);

    // Modèle Jambes
    const modelJambes = await client.query(`INSERT INTO modeles_seance (nom, description, tags_zone_corps, tags_equipement, duree_minutes, difficulte) VALUES ('Séance Jambes', 'Focus sur le bas du corps', '["jambe"]', '["Aucun", "Barre"]', 40, 'Intermédiaire') RETURNING id;`);
    await client.query(`INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions) VALUES ($1, $2, 1, 4, 12);`, [modelJambes.rows[0].id, exoMap.get('Squat Barre')]);
    await client.query(`INSERT INTO modeles_seance_exos (id_modele_seance, id_exo, ordre, series, repetitions) VALUES ($1, $2, 2, 3, 15);`, [modelJambes.rows[0].id, exoMap.get('Fentes')]);

    await client.query('COMMIT');
    console.log('\n🎉 INSERTION RÉUSSIE : Environnement de test complet restauré !');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de l\'insertion :', error);
  } finally {
    client.release();
    await pool.end();
  }
}

insertScenario();
