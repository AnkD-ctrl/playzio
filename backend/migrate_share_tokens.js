import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg
dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function createShareTokensTable() {
  try {
    console.log('🔄 Création de la table share_tokens...')
    
    // Créer la table share_tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS share_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(64) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL REFERENCES users(prenom),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Créer les index
    await pool.query('CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_share_tokens_username ON share_tokens(username)')
    await pool.query('CREATE INDEX IF NOT EXISTS idx_share_tokens_expires ON share_tokens(expires_at)')
    
    console.log('✅ Table share_tokens créée avec succès')
    
    // Nettoyer les tokens expirés
    const result = await pool.query('DELETE FROM share_tokens WHERE expires_at < NOW()')
    console.log(`🧹 ${result.rowCount} tokens expirés supprimés`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table share_tokens:', error)
  } finally {
    await pool.end()
  }
}

createShareTokensTable()
