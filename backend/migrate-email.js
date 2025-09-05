import pkg from 'pg'

const { Pool } = pkg

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

async function migrateEmailColumn() {
  try {
    console.log('🚀 Début de la migration email...')
    
    // Vérifier si la colonne email existe déjà
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `)
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ La colonne email existe déjà')
      return
    }
    
    // Ajouter la colonne email
    console.log('📧 Ajout de la colonne email...')
    await pool.query(`
      ALTER TABLE users ADD COLUMN email VARCHAR(255)
    `)
    
    console.log('✅ Colonne email ajoutée avec succès')
    
    // Vérifier que la colonne a été ajoutée
    const verifyColumn = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `)
    
    console.log('🔍 Vérification:', verifyColumn.rows[0])
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Exécuter la migration
migrateEmailColumn()
  .then(() => {
    console.log('🎉 Migration terminée avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migration échouée:', error)
    process.exit(1)
  })
