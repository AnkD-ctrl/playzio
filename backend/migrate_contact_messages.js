const { Pool } = require('pg')

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/playzio'
})

async function createContactMessagesTable() {
  try {
    console.log('🔄 Création de la table contact_messages...')
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_messages (
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
    console.log('✅ Table contact_messages créée avec succès')
    
    // Créer des index pour améliorer les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at 
      ON contact_messages(created_at DESC);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read 
      ON contact_messages(is_read);
    `)
    
    console.log('✅ Index créés avec succès')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table contact_messages:', error)
    throw error
  }
}

async function main() {
  try {
    await createContactMessagesTable()
    console.log('🎉 Migration contact_messages terminée avec succès !')
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

module.exports = { createContactMessagesTable }
