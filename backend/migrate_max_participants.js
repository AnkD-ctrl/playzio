import pkg from 'pg'
import { fileURLToPath } from 'url'
import path from 'path'

const { Pool } = pkg

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

async function migrateMaxParticipants() {
  try {
    console.log('🔄 Début de la migration pour ajouter la colonne max_participants...')
    
    // Vérifier si la colonne existe déjà
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'slots' AND column_name = 'max_participants'
    `
    
    const checkResult = await pool.query(checkColumnQuery)
    
    if (checkResult.rows.length > 0) {
      console.log('✅ La colonne max_participants existe déjà')
      return
    }
    
    // Ajouter la colonne max_participants
    const addColumnQuery = `
      ALTER TABLE slots ADD COLUMN max_participants INTEGER DEFAULT NULL
    `
    
    await pool.query(addColumnQuery)
    console.log('✅ Colonne max_participants ajoutée avec succès')
    
    // Optionnel : Créer un index pour améliorer les performances
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_slots_max_participants ON slots(max_participants) WHERE max_participants IS NOT NULL
    `
    
    await pool.query(createIndexQuery)
    console.log('✅ Index sur max_participants créé avec succès')
    
    console.log('🎉 Migration terminée avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

// Exécuter la migration si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateMaxParticipants()
    .then(() => {
      console.log('✅ Migration complétée')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Échec de la migration:', error)
      process.exit(1)
    })
}

export { migrateMaxParticipants }
