import pkg from 'pg'
import { fileURLToPath } from 'url'
import path from 'path'

const { Pool } = pkg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

async function migrateFounderColumn() {
  try {
    console.log('🔄 Début de la migration pour ajouter la colonne is_founder...')
    
    // Vérifier si la colonne existe déjà
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_founder'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La colonne is_founder existe déjà')
      return
    }
    
    // Ajouter la colonne is_founder
    await pool.query(`
      ALTER TABLE users ADD COLUMN is_founder BOOLEAN DEFAULT FALSE
    `)
    
    console.log('✅ Colonne is_founder ajoutée avec succès')
    
    // Marquer les 1000 premiers utilisateurs comme membres premium
    const result = await pool.query(`
      UPDATE users 
      SET is_founder = TRUE 
      WHERE id IN (
        SELECT id FROM users 
        ORDER BY created_at ASC 
        LIMIT 1000
      )
    `)
    
    console.log(`✅ ${result.rowCount} utilisateurs marqués comme membres premium`)
    
    // Afficher les statistiques
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_founder = TRUE THEN 1 END) as founder_count
      FROM users
    `)
    
    const { total_users, founder_count } = stats.rows[0]
    console.log(`📊 Statistiques finales:`)
    console.log(`   - Total utilisateurs: ${total_users}`)
    console.log(`   - Membres premium: ${founder_count}`)
    console.log(`   - Places restantes: ${Math.max(0, 1000 - founder_count)}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Exécuter la migration si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateFounderColumn()
    .then(() => {
      console.log('🎉 Migration terminée avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration échouée:', error)
      process.exit(1)
    })
}

export { migrateFounderColumn }
