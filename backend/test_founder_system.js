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

async function testFounderSystem() {
  try {
    console.log('🧪 Test du système de membres premium...\n')
    
    // 1. Vérifier la structure de la table
    console.log('1. Vérification de la structure de la table users:')
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `)
    
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`)
    })
    
    // 2. Statistiques actuelles
    console.log('\n2. Statistiques actuelles:')
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_founder = TRUE THEN 1 END) as founder_count,
        COUNT(CASE WHEN is_founder = FALSE THEN 1 END) as regular_count
      FROM users
    `)
    
    const { total_users, founder_count, regular_count } = stats.rows[0]
    console.log(`   - Total utilisateurs: ${total_users}`)
    console.log(`   - Membres premium: ${founder_count}`)
    console.log(`   - Utilisateurs réguliers: ${regular_count}`)
    console.log(`   - Places restantes: ${Math.max(0, 1000 - founder_count)}`)
    
    // 3. Afficher les premiers membres premium
    console.log('\n3. Premiers membres premium:')
    const founders = await pool.query(`
      SELECT prenom, created_at, is_founder
      FROM users 
      WHERE is_founder = TRUE 
      ORDER BY created_at ASC 
      LIMIT 10
    `)
    
    if (founders.rows.length > 0) {
      founders.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.prenom} (inscrit le ${user.created_at})`)
      })
    } else {
      console.log('   Aucun membre premium trouvé')
    }
    
    // 4. Test de l'API endpoint
    console.log('\n4. Test de l\'endpoint /api/founder-stats:')
    try {
      const response = await fetch('http://localhost:8080/api/founder-stats')
      if (response.ok) {
        const apiStats = await response.json()
        console.log('   ✅ API endpoint fonctionne:')
        console.log(`   - founderCount: ${apiStats.founderCount}`)
        console.log(`   - totalUsers: ${apiStats.totalUsers}`)
        console.log(`   - remainingFounderSlots: ${apiStats.remainingFounderSlots}`)
        console.log(`   - isFounderAvailable: ${apiStats.isFounderAvailable}`)
      } else {
        console.log('   ❌ API endpoint non accessible')
      }
    } catch (error) {
      console.log('   ⚠️  API endpoint non accessible (serveur non démarré?)')
    }
    
    console.log('\n✅ Test terminé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Exécuter le test si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  testFounderSystem()
    .then(() => {
      console.log('🎉 Test terminé!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test échoué:', error)
      process.exit(1)
    })
}

export { testFounderSystem }
