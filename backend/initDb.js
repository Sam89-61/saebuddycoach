const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ========================================
    // 1. CRÉATION DES SÉQUENCES
    // ========================================
    console.log('Création des séquences...');

    await client.query(`CREATE SEQUENCE IF NOT EXISTS categorie_equipement_id_categorie_equipement_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS categorie_objectif_id_categorie_obj_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS equipementExo_id_equipement_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS utilisateurs_id_utilisateur_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS dessert_id_dessert_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS entree_id_entree_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS evenement_id_evenement_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS exos_id_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS classement_id_classement_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS classement_user_id_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS information_sante_id_information_sante_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS mascotte_id_mascotte_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS objectif_id_objectif_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS plat_id_plat_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS posture_reference_id_posture_reference_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS profil_id_profil_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS programme_id_programme_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS programme_alimentaire_id_programme_a_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS programme_sportif_id_programme_sportif_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS record_id_record_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS regime_alimentaire_id_regime_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS session_repas_id_session_repas_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS session_repas_plats_id_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS session_sport_id_session_sport_seq;`);
    await client.query(`CREATE SEQUENCE IF NOT EXISTS session_sport_exos_id_session_sport_exos_seq;`);

    console.log('✅ Séquences créées');

    // ========================================
    // 2. CRÉATION DES TABLES SANS DÉPENDANCES
    // ========================================
    console.log('Création des tables de base...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.utilisateurs (
      id_utilisateur integer NOT NULL DEFAULT nextval('utilisateurs_id_utilisateur_seq'::regclass),
      pseudo character varying NOT NULL,
      email character varying NOT NULL UNIQUE,
      password character varying,
      date_inscription date NOT NULL DEFAULT CURRENT_DATE,
      role character varying NOT NULL DEFAULT 'utilisateur'::character varying,
      CONSTRAINT utilisateurs_pkey PRIMARY KEY (id_utilisateur)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.categorie_equipement (
      id_categorie_equipement integer NOT NULL DEFAULT nextval('categorie_equipement_id_categorie_equipement_seq'::regclass),
      list_equipement json NOT NULL,
      CONSTRAINT categorie_equipement_pkey PRIMARY KEY (id_categorie_equipement)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.equipementExo (
      id_equipement integer NOT NULL DEFAULT nextval('equipementExo_id_equipement_seq'::regclass),
      list_equipement json NOT NULL,
      CONSTRAINT equipementExo_pkey PRIMARY KEY (id_equipement)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.categorie_objectif (
      nom character varying NOT NULL,
      description text,
      CONSTRAINT categorie_objectif_pkey PRIMARY KEY (nom)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.dessert (
      id_dessert integer NOT NULL DEFAULT nextval('dessert_id_dessert_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      recette text,
      calorie numeric,
      proteine numeric,
      glucide numeric,
      lipide numeric,
      restrictions_alimentaires json,
      regime_alimentaire character varying,
      objectif character varying,
      moment_repas jsonb,
      img json,

      CONSTRAINT dessert_pkey PRIMARY KEY (id_dessert)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.entree (
      id_entree integer NOT NULL DEFAULT nextval('entree_id_entree_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      recette text,
      calorie numeric,
      proteine numeric,
      glucide numeric,
      lipide numeric,
      restrictions_alimentaires json,
      regime_alimentaire character varying,
      objectif character varying,
      moment_repas jsonb,
      img json,
      CONSTRAINT entree_pkey PRIMARY KEY (id_entree)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.evenement (
      id_evenement integer NOT NULL DEFAULT nextval('evenement_id_evenement_seq'::regclass),
      nom character varying NOT NULL,
      description character varying,
      lieu character varying,
      date date,
      heure time without time zone,
      duree integer,
      organisateur_id integer,
      categorie character varying,
      CONSTRAINT evenement_pkey PRIMARY KEY (id_evenement),
      CONSTRAINT evenement_organisateur_id_fkey FOREIGN KEY (organisateur_id)
        REFERENCES public.utilisateurs(id_utilisateur) ON DELETE SET NULL
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.plat (
      id_plat integer NOT NULL DEFAULT nextval('plat_id_plat_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      recette text,
      calorie numeric,
      proteine numeric,
      glucide numeric,
      lipide numeric,
      restrictions_alimentaires json,
      regime_alimentaire character varying,
      objectif character varying,
      moment_repas jsonb,
      img json,
      CONSTRAINT plat_pkey PRIMARY KEY (id_plat)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.information_sante (
      id_information_sante integer NOT NULL DEFAULT nextval('information_sante_id_information_sante_seq'::regclass),
      conditions_medicales json,
      condition_physique json,
      CONSTRAINT information_sante_pkey PRIMARY KEY (id_information_sante)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.regime_alimentaire (
      id_regime integer NOT NULL DEFAULT nextval('regime_alimentaire_id_regime_seq'::regclass),
      alimentation character varying NOT NULL,
      restrictions_alimentaires json,
      CONSTRAINT regime_alimentaire_pkey PRIMARY KEY (id_regime)
    );`);

    console.log('✅ Tables de base créées');

    // ========================================
    // 3. TABLES AVEC PREMIÈRE DÉPENDANCE
    // ========================================
    console.log('Création des tables avec dépendances niveau 1...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.exos (
      id integer NOT NULL DEFAULT nextval('exos_id_seq'::regclass),
      nom_exercice character varying NOT NULL,
      description text,
      muscle_cibles json,
      difficulte character varying,
      url_video_exemple character varying,
      img json,
      id_equipement integer,
      CONSTRAINT exos_pkey PRIMARY KEY (id),
      CONSTRAINT exos_id_equipement_fkey FOREIGN KEY (id_equipement) 
        REFERENCES public.equipementExo(id_equipement)
    );`)

    await client.query(`CREATE TABLE IF NOT EXISTS public.objectif (
      id_objectif integer NOT NULL DEFAULT nextval('objectif_id_objectif_seq'::regclass),
      description text,
      categorie_obj character varying NOT NULL,
      actif boolean,
      date_debut date NOT NULL,
      date_fin date NOT NULL,
      CONSTRAINT objectif_pkey PRIMARY KEY (id_objectif),
      CONSTRAINT objectif_id_categorie_obj_fkey FOREIGN KEY (categorie_obj) 
        REFERENCES public.categorie_objectif(nom)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.participation (
      id_evenement integer NOT NULL,
      id_utilisateur integer NOT NULL,
      statut character varying,
      CONSTRAINT participation_pkey PRIMARY KEY (id_evenement, id_utilisateur),
      CONSTRAINT participation_id_evenement_fkey FOREIGN KEY (id_evenement) 
        REFERENCES public.evenement(id_evenement),
      CONSTRAINT participation_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) 
        REFERENCES public.utilisateurs(id_utilisateur)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.mascotte (
      id_mascotte integer NOT NULL DEFAULT nextval('mascotte_id_mascotte_seq'::regclass),
      experience integer NOT NULL DEFAULT 0,
      niveau integer NOT NULL DEFAULT 1,
      apparence jsonb,
      date_mise_a_jour timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
      id_utilisateur integer NOT NULL,
      CONSTRAINT mascotte_pkey PRIMARY KEY (id_mascotte),
      CONSTRAINT mascotte_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) 
        REFERENCES public.utilisateurs(id_utilisateur)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.record (
      id_record integer NOT NULL DEFAULT nextval('record_id_record_seq'::regclass),
      type_record character varying NOT NULL, 
      score integer NOT NULL,
      date_record timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
      id_utilisateur integer NOT NULL,
      id_exo integer NOT NULL,
      CONSTRAINT record_pkey PRIMARY KEY (id_record),
      CONSTRAINT record_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) 
        REFERENCES public.utilisateurs(id_utilisateur),
      CONSTRAINT record_id_exo_fkey FOREIGN KEY (id_exo) 
        REFERENCES public.exos(id)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.posture_reference (
      id_posture_reference integer NOT NULL DEFAULT nextval('posture_reference_id_posture_reference_seq'::regclass),
      id_exo integer NOT NULL,
      nom character varying NOT NULL,
      description text,
      score_cible numeric,
      url_video_reference character varying,
      points_cles jsonb, 
      date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT posture_reference_pkey PRIMARY KEY (id_posture_reference),
      CONSTRAINT posture_reference_id_exo_fkey FOREIGN KEY (id_exo) 
        REFERENCES public.exos(id)
    );`);

    console.log('✅ Tables avec dépendances niveau 1 créées');

    // ========================================
    // 4. TABLE PROFIL
    // ========================================
    console.log('Création de la table profil...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.profil (
      id_profil integer NOT NULL DEFAULT nextval('profil_id_profil_seq'::regclass),
      age integer CHECK (age > 0 AND age < 150) NOT NULL,
      taille double precision CHECK (taille > 0::double precision) NOT NULL,
      poids double precision CHECK (poids > 0::double precision) NOT NULL,
      niveau character varying NOT NULL,
      frequence integer CHECK (frequence >= 1 AND frequence <= 7) NOT NULL,
      sexe character varying NOT NULL,
      jour_disponible jsonb,
      heure_disponible character varying,
      id_equipement integer NOT NULL,
      id_utilisateur integer NOT NULL,
      objectif_id integer NOT NULL,
      id_information_sante integer NOT NULL,
      regime_id integer NOT NULL,
      CONSTRAINT profil_pkey PRIMARY KEY (id_profil),
      CONSTRAINT profil_objectif_id_fkey FOREIGN KEY (objectif_id) 
        REFERENCES public.objectif(id_objectif),
      CONSTRAINT profil_id_equipement_fkey FOREIGN KEY (id_equipement) 
        REFERENCES public.categorie_equipement(id_categorie_equipement),
      CONSTRAINT profil_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) 
        REFERENCES public.utilisateurs(id_utilisateur),
      CONSTRAINT profil_id_information_sante_fkey FOREIGN KEY (id_information_sante) 
        REFERENCES public.information_sante(id_information_sante),
      CONSTRAINT profil_regime_id_fkey FOREIGN KEY (regime_id) 
        REFERENCES public.regime_alimentaire(id_regime)
    );`);

    console.log('✅ Table profil créée');

    // ========================================
    // 5. TABLE PROGRAMME
    // ========================================
    console.log('Création de la table programme...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.programme (
      id_programme integer NOT NULL DEFAULT nextval('programme_id_programme_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      date_debut date,
      date_fin date,
      id_profil integer,
      CONSTRAINT programme_pkey PRIMARY KEY (id_programme),
      CONSTRAINT programme_id_profil_fkey FOREIGN KEY (id_profil) 
        REFERENCES public.profil(id_profil) ON DELETE CASCADE
    );`);

    console.log('✅ Table programme créée');

    // ========================================
    // 6. TABLES PROGRAMME_ALIMENTAIRE ET PROGRAMME_SPORTIF
    // ========================================
    console.log('Création des tables programme_alimentaire et programme_sportif...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.programme_alimentaire (
      id_programme_a integer NOT NULL DEFAULT nextval('programme_alimentaire_id_programme_a_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      id_programme integer,
      CONSTRAINT programme_alimentaire_pkey PRIMARY KEY (id_programme_a),
      CONSTRAINT programme_alimentaire_id_programme_fkey FOREIGN KEY (id_programme) 
        REFERENCES public.programme(id_programme) ON DELETE CASCADE
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.programme_sportif (
      id_programme_sportif integer NOT NULL DEFAULT nextval('programme_sportif_id_programme_sportif_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      id_programme integer,
      CONSTRAINT programme_sportif_pkey PRIMARY KEY (id_programme_sportif),
      CONSTRAINT programme_sportif_id_programme_fkey FOREIGN KEY (id_programme) 
        REFERENCES public.programme(id_programme) ON DELETE CASCADE
    );`);

    console.log('✅ Tables programme_alimentaire et programme_sportif créées');

    // ========================================
    // 7. TABLES SESSION_SPORT ET SESSION_REPAS
    // ========================================
    console.log('Création des tables session_sport et session_repas...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.session_sport (
      id_session_sport integer NOT NULL DEFAULT nextval('session_sport_id_session_sport_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      date_session date,
      heure_session time without time zone,
      duree_minutes integer CHECK (duree_minutes > 0),
      finish boolean DEFAULT false,
      id_programme_sportif integer NOT NULL,
      CONSTRAINT session_sport_pkey PRIMARY KEY (id_session_sport),
      CONSTRAINT session_sport_id_programme_sportif_fkey FOREIGN KEY (id_programme_sportif) 
        REFERENCES public.programme_sportif(id_programme_sportif) ON DELETE CASCADE
    );`);

    // TABLE SESSION_REPAS MODIFIÉE - Plus flexible pour tous types de repas
    await client.query(`CREATE TABLE IF NOT EXISTS public.session_repas (
      id_session_repas integer NOT NULL DEFAULT nextval('session_repas_id_session_repas_seq'::regclass),
      nom character varying NOT NULL,
      type_repas character varying NOT NULL,
      date_repas date NOT NULL,
      heure_repas time without time zone,
      id_programme_a integer NOT NULL,
      notes text,
      CONSTRAINT session_repas_pkey PRIMARY KEY (id_session_repas),
      CONSTRAINT session_repas_id_programme_a_fkey FOREIGN KEY (id_programme_a) 
        REFERENCES public.programme_alimentaire(id_programme_a) ON DELETE CASCADE
    );`);

    console.log('✅ Tables session_sport et session_repas créées');

    // ========================================
    // 8. TABLE SESSION_SPORT_EXOS
    // ========================================
    console.log('Création de la table session_sport_exos...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.session_sport_exos (
      id_session_sport_exos integer NOT NULL DEFAULT nextval('session_sport_exos_id_session_sport_exos_seq'::regclass),
      id_session_sport integer NOT NULL,
      id_exo integer NOT NULL,
      ordre integer NOT NULL,
      repetitions integer,
      series integer,
      temps_repos_secondes integer,
      notes text,
      CONSTRAINT session_sport_exos_pkey PRIMARY KEY (id_session_sport_exos),
      CONSTRAINT session_sport_exos_id_session_sport_fkey FOREIGN KEY (id_session_sport) 
        REFERENCES public.session_sport(id_session_sport) ON DELETE CASCADE,
      CONSTRAINT session_sport_exos_id_exo_fkey FOREIGN KEY (id_exo) 
        REFERENCES public.exos(id)
    );`);

    console.log('✅ Table session_sport_exos créée');

    // ========================================
    // 9. TABLE SESSION_REPAS_PLATS (MODIFIÉE)
    // ========================================
    console.log('Création de la table session_repas_plats...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.session_repas_plats (
      id_session_repas_plats integer NOT NULL DEFAULT nextval('session_repas_plats_id_seq'::regclass),
      id_session_repas integer NOT NULL,
      id_entree integer,
      id_plat integer,
      id_dessert integer,
      ordre integer NOT NULL,
      quantite numeric DEFAULT 1 CHECK (quantite > 0),
      notes text,
      CONSTRAINT session_repas_plats_pkey PRIMARY KEY (id_session_repas_plats),
      CONSTRAINT session_repas_plats_id_session_repas_fkey FOREIGN KEY (id_session_repas) 
        REFERENCES public.session_repas(id_session_repas) ON DELETE CASCADE,
      CONSTRAINT session_repas_plats_id_entree_fkey FOREIGN KEY (id_entree) 
        REFERENCES public.entree(id_entree) ON DELETE SET NULL,
      CONSTRAINT session_repas_plats_id_plat_fkey FOREIGN KEY (id_plat) 
        REFERENCES public.plat(id_plat) ON DELETE SET NULL,
      CONSTRAINT session_repas_plats_id_dessert_fkey FOREIGN KEY (id_dessert) 
        REFERENCES public.dessert(id_dessert) ON DELETE SET NULL
    );`);

    console.log('✅ Table session_repas_plats créée');

    // ========================================
    // 10. TABLE CLASSEMENT (définition des challenges)
    // ========================================
    console.log('Création de la table classement...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.classement (
      id_classement integer NOT NULL DEFAULT nextval('classement_id_classement_seq'::regclass),
      nom character varying NOT NULL,
      description text,
      type_challenge character varying NOT NULL,
      id_exo integer NOT NULL,
      unite_mesure character varying NOT NULL,
      periode character varying,
      date_debut date,
      date_fin date,
      actif boolean DEFAULT true,
      CONSTRAINT classement_pkey PRIMARY KEY (id_classement),
      CONSTRAINT classement_id_exo_fkey FOREIGN KEY (id_exo) 
        REFERENCES public.exos(id)
    );`);

    console.log('✅ Table classement créée');

    // ========================================
    // 11. TABLE CLASSEMENT_USER (participations des utilisateurs)
    // ========================================
    console.log('Création de la table classement_user...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.classement_user (
      id_classement_user integer NOT NULL DEFAULT nextval('classement_user_id_seq'::regclass),
      id_classement integer NOT NULL,
      id_utilisateur integer NOT NULL,
      score numeric NOT NULL,
      url_video_preuve character varying,
      statut_validation character varying NOT NULL DEFAULT 'en_attente',
      commentaire_validation text,
      validateur_id integer,
      date_soumission timestamp without time zone DEFAULT CURRENT_TIMESTAMP,      
      CONSTRAINT classement_user_pkey PRIMARY KEY (id_classement_user),
      CONSTRAINT classement_user_id_classement_fkey FOREIGN KEY (id_classement) 
        REFERENCES public.classement(id_classement) ON DELETE CASCADE,
      CONSTRAINT classement_user_id_utilisateur_fkey FOREIGN KEY (id_utilisateur) 
        REFERENCES public.utilisateurs(id_utilisateur),
      CONSTRAINT classement_user_validateur_fkey FOREIGN KEY (validateur_id) 
        REFERENCES public.utilisateurs(id_utilisateur)
    );`);

    console.log('✅ Table classement_user créée');

    // ========================================
    // 12. TABLES SÉANCES PRÉDÉFINIES (CATALOGUE)
    // ========================================
    console.log('Création des tables de séances prédéfinies...');

    await client.query(`CREATE TABLE IF NOT EXISTS public.modeles_seance (
      id SERIAL PRIMARY KEY,
      nom character varying NOT NULL,
      description text,
      tags_zone_corps json,
      tags_equipement json,
      duree_minutes integer,
      difficulte character varying,
      img json,
      video_url character varying
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS public.modeles_seance_exos (
      id SERIAL PRIMARY KEY,
      id_modele_seance integer NOT NULL,
      id_exo integer NOT NULL,
      ordre integer,
      series integer,
      repetitions integer,
      temps_repos_secondes integer,
      notes text,
      CONSTRAINT modeles_seance_exos_id_modele_fkey FOREIGN KEY (id_modele_seance) 
        REFERENCES public.modeles_seance(id) ON DELETE CASCADE,
      CONSTRAINT modeles_seance_exos_id_exo_fkey FOREIGN KEY (id_exo) 
        REFERENCES public.exos(id) ON DELETE CASCADE
    );`);

    console.log('✅ Tables séances prédéfinies créées');

    await client.query('COMMIT');
    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📝 Modifications apportées :');
    console.log('   - session_repas : ajout de "type_repas" et "notes"');
    console.log('   - session_repas_plats : nouvelle table pour gérer la composition des repas');
    console.log('   - Flexibilité : petit-déjeuner, déjeuner, dîner, collations maintenant possibles');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de l\'initialisation:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });