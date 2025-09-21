import pkg from 'pg'
import 'dotenv/config'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

async function migratePasswordResetTokens() {
  console.log('🔄 Début de la migration pour créer la table password_reset_tokens...')
  
  try {
    // Créer la table password_reset_tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id VARCHAR(50) PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    // Créer les index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email 
      ON password_reset_tokens(user_email);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
      ON password_reset_tokens(token);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires 
      ON password_reset_tokens(expires_at);
    `)
    
    console.log('✅ Migration réussie : table password_reset_tokens créée avec succès.')
    
    // Vérifier que la table existe
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'password_reset_tokens';
    `)
    
    if (result.rows.length > 0) {
      console.log('✅ Table password_reset_tokens confirmée en base de données')
    } else {
      console.log('❌ Table password_reset_tokens non trouvée après création')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await pool.end()
  }
}

migratePasswordResetTokens().catch(err => {
  console.error('❌ Échec de la migration:', err)
  process.exit(1)
})
