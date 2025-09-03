const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/playzio'
})

async function createMessagesTable() {
  try {
    console.log('🔄 Création de la table messages...')
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_user VARCHAR(255) NOT NULL,
        from_email VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        admin_response TEXT,
        admin_response_at TIMESTAMP
      );
    `
    
    await pool.query(createTableQuery)
    console.log('✅ Table messages créée avec succès')
    
    // Créer un index pour améliorer les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at 
      ON messages(created_at DESC);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_is_read 
      ON messages(is_read);
    `)
    
    console.log('✅ Index créés avec succès')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table messages:', error)
    throw error
  }
}

async function main() {
  try {
    await createMessagesTable()
    console.log('🎉 Migration terminée avec succès !')
  } catch (error) {
    console.error('💥 Échec de la migration:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main()
}

module.exports = { createMessagesTable }
