import pkg from 'pg'
import 'dotenv/config'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

async function migrateVisibleToFriends() {
  console.log('🔄 Début de la migration pour ajouter la colonne visible_to_friends...')
  
  try {
    // Ajouter la colonne visible_to_friends si elle n'existe pas
    await pool.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'slots' AND column_name = 'visible_to_friends') THEN
              ALTER TABLE slots ADD COLUMN visible_to_friends BOOLEAN DEFAULT FALSE;
              RAISE NOTICE 'Colonne visible_to_friends ajoutée à la table slots.';
          ELSE
              RAISE NOTICE 'La colonne visible_to_friends existe déjà dans la table slots.';
          END IF;
      END $$;
    `)
    
    console.log('✅ Migration réussie : colonne visible_to_friends ajoutée ou déjà présente.')
    
    // Vérifier que la colonne existe
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'slots' AND column_name = 'visible_to_friends';
    `)
    
    if (result.rows.length > 0) {
      console.log('✅ Colonne visible_to_friends confirmée en base de données:', result.rows[0])
    } else {
      console.log('❌ Colonne visible_to_friends non trouvée après création')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await pool.end()
  }
}

migrateVisibleToFriends().catch(err => {
  console.error('❌ Échec de la migration:', err)
  process.exit(1)
})
