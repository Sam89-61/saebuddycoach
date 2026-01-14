const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function dropDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🗑️  Suppression des tables...');

    // ========================================
    // SUPPRESSION DES TABLES DANS L'ORDRE INVERSE DES DÉPENDANCES
    // ========================================
    
    // Tables avec le plus de dépendances en premier
    await client.query('DROP TABLE IF EXISTS public.classement_user CASCADE;');
    console.log('✅ Table classement_user supprimée');

    await client.query('DROP TABLE IF EXISTS public.modeles_seance_exos CASCADE;');
    console.log('✅ Table modeles_seance_exos supprimée');

    await client.query('DROP TABLE IF EXISTS public.modeles_seance CASCADE;');
    console.log('✅ Table modeles_seance supprimée');

    await client.query('DROP TABLE IF EXISTS public.classement CASCADE;');
    console.log('✅ Table classement supprimée');

    await client.query('DROP TABLE IF EXISTS public.session_repas_plats CASCADE;');
    console.log('✅ Table session_repas_plats supprimée');

    await client.query('DROP TABLE IF EXISTS public.profil CASCADE;');
    console.log('✅ Table profil supprimée');

    await client.query('DROP TABLE IF EXISTS public.session_sport_exos CASCADE;');
    console.log('✅ Table session_sport_exos supprimée');

    await client.query('DROP TABLE IF EXISTS public.posture_reference CASCADE;');
    console.log('✅ Table posture_reference supprimée');

    await client.query('DROP TABLE IF EXISTS public.record CASCADE;');
    console.log('✅ Table record supprimée');

    await client.query('DROP TABLE IF EXISTS public.mascotte CASCADE;');
    console.log('✅ Table mascotte supprimée');

    await client.query('DROP TABLE IF EXISTS public.session_repas CASCADE;');
    console.log('✅ Table session_repas supprimée');

    await client.query('DROP TABLE IF EXISTS public.session_sport CASCADE;');
    console.log('✅ Table session_sport supprimée');

    await client.query('DROP TABLE IF EXISTS public.programme_sportif CASCADE;');
    console.log('✅ Table programme_sportif supprimée');

    await client.query('DROP TABLE IF EXISTS public.programme_alimentaire CASCADE;');
    console.log('✅ Table programme_alimentaire supprimée');

    await client.query('DROP TABLE IF EXISTS public.programme CASCADE;');
    console.log('✅ Table programme supprimée');

    await client.query('DROP TABLE IF EXISTS public.participation CASCADE;');
    console.log('✅ Table participation supprimée');

    await client.query('DROP TABLE IF EXISTS public.objectif CASCADE;');
    console.log('✅ Table objectif supprimée');

    await client.query('DROP TABLE IF EXISTS public.exos CASCADE;');
    console.log('✅ Table exos supprimée');

    // Tables sans dépendances (ou presque)
    await client.query('DROP TABLE IF EXISTS public.regime_alimentaire CASCADE;');
    console.log('✅ Table regime_alimentaire supprimée');

    await client.query('DROP TABLE IF EXISTS public.information_sante CASCADE;');
    console.log('✅ Table information_sante supprimée');

    await client.query('DROP TABLE IF EXISTS public.plat CASCADE;');
    console.log('✅ Table plat supprimée');

    await client.query('DROP TABLE IF EXISTS public.evenement CASCADE;');
    console.log('✅ Table evenement supprimée');

    await client.query('DROP TABLE IF EXISTS public.entree CASCADE;');
    console.log('✅ Table entree supprimée');

    await client.query('DROP TABLE IF EXISTS public.dessert CASCADE;');
    console.log('✅ Table dessert supprimée');

    await client.query('DROP TABLE IF EXISTS public.categorie_objectif CASCADE;');
    console.log('✅ Table categorie_objectif supprimée');

    await client.query('DROP TABLE IF EXISTS public.categorie_equipement CASCADE;');
    console.log('✅ Table categorie_equipement supprimée');

    await client.query('DROP TABLE IF EXISTS public.equipementExo CASCADE;');
    console.log('✅ Table equipementExo supprimée');

    await client.query('DROP TABLE IF EXISTS public.utilisateurs CASCADE;');
    console.log('✅ Table utilisateurs supprimée');

    // ========================================
    // SUPPRESSION DES SÉQUENCES
    // ========================================
    console.log('\n🗑️  Suppression des séquences...');

    // On utilise une requête dynamique pour supprimer toutes les séquences
    const sequences = await client.query(`
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public';
    `);

    for (const seq of sequences.rows) {
        await client.query(`DROP SEQUENCE IF EXISTS public.${seq.sequence_name} CASCADE;`);
        console.log(`✅ Séquence ${seq.sequence_name} supprimée`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 Toutes les tables et séquences ont été supprimées avec succès !');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la suppression:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

dropDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
