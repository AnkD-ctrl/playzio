import { pool } from './database.js'

export async function ensureEmailNotificationsColumn() {
  try {
    console.log('🔍 Vérification de la colonne email_notifications...')
    
    // Vérifier si la colonne existe déjà
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'slots' AND column_name = 'email_notifications'
    `)
    
    if (checkColumn.rows.length === 0) {
      console.log('➕ Ajout de la colonne email_notifications à la table slots...')
      
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
    console.error('❌ Erreur lors de la vérification/ajout de la colonne email_notifications:', error)
    // Ne pas faire échouer le démarrage du serveur
    console.log('⚠️  Le serveur continuera sans la fonctionnalité de notifications email')
  }
}
