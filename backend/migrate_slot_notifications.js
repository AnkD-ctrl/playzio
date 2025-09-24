import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL
})

async function createSlotNotificationsTable() {
  try {
    console.log('🔧 Création de la table slot_notifications...')
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS slot_notifications (
        id SERIAL PRIMARY KEY,
        slot_id VARCHAR(50) NOT NULL,
        participant VARCHAR(100) NOT NULL,
        organizer_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ Table slot_notifications créée')
    
    // Créer les index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_slot_notifications_slot_participant 
      ON slot_notifications(slot_id, participant)
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_slot_notifications_created_at 
      ON slot_notifications(created_at)
    `)
    
    console.log('✅ Index créés pour slot_notifications')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table:', error)
  } finally {
    await pool.end()
  }
}

createSlotNotificationsTable()
