import { pool } from './database.js'

async function addEmailNotificationsColumn() {
  try {
    console.log('Ajout de la colonne email_notifications à la table slots...')
    
    // Vérifier si la colonne existe déjà
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'slots' AND column_name = 'email_notifications'
    `)
    
    if (checkColumn.rows.length === 0) {
      // Ajouter la colonne email_notifications
      await pool.query(`
        ALTER TABLE slots 
        ADD COLUMN email_notifications BOOLEAN DEFAULT FALSE
      `)
      console.log('✅ Colonne email_notifications ajoutée avec succès')
    } else {
      console.log('ℹ️  Colonne email_notifications existe déjà')
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la colonne email_notifications:', error)
    throw error
  }
}

async function main() {
  try {
    await addEmailNotificationsColumn()
    console.log('✅ Migration terminée avec succès')
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
