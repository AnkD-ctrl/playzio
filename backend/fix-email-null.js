import pkg from 'pg'

const { Pool } = pkg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

async function fixEmailNull() {
  try {
    console.log('🔧 Correction de la colonne email pour accepter NULL...')
    const client = await pool.connect()
    
    // Vérifier l'état actuel de la colonne
    const checkColumnQuery = `
      SELECT 
        column_name, 
        is_nullable, 
        data_type,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `
    const res = await client.query(checkColumnQuery)
    
    if (res.rows.length === 0) {
      console.log('❌ Colonne email n\'existe pas')
      return
    }
    
    const column = res.rows[0]
    console.log('📊 État actuel de la colonne email:', column)
    
    // Si la colonne n'accepte pas NULL, la corriger
    if (column.is_nullable === 'NO') {
      console.log('🔧 Modification de la colonne pour accepter NULL...')
      await client.query('ALTER TABLE users ALTER COLUMN email DROP NOT NULL')
      console.log('✅ Colonne email modifiée pour accepter NULL')
    } else {
      console.log('✅ Colonne email accepte déjà NULL')
    }
    
    // Vérifier le nouvel état
    const newRes = await client.query(checkColumnQuery)
    const newColumn = newRes.rows[0]
    console.log('📊 Nouvel état de la colonne email:', newColumn)
    
    client.release()
    console.log('✅ Correction terminée avec succès')
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
    throw error
  } finally {
    await pool.end()
  }
}

fixEmailNull().catch(e => {
  console.error('💥 Correction échouée:', e)
  process.exit(1)
})
