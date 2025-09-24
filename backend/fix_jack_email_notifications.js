import { pool } from './database.js'

async function fixJackEmailNotifications() {
  try {
    const client = await pool.connect()
    try {
      // Mettre à jour tous les slots de Jack pour activer les notifications email
      const result = await client.query(`
        UPDATE slots 
        SET email_notifications = true 
        WHERE created_by = 'Jack' AND email_notifications IS NULL
      `)
      
      console.log(`✅ ${result.rowCount} slots de Jack mis à jour avec email_notifications = true`)
      
      // Vérifier le résultat
      const checkResult = await client.query(`
        SELECT id, created_by, email_notifications, custom_activity 
        FROM slots 
        WHERE created_by = 'Jack'
      `)
      
      console.log('📊 Slots de Jack après mise à jour:')
      checkResult.rows.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.custom_activity || 'Activité'} - email_notifications: ${slot.email_notifications}`)
      })
      
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    throw error
  }
}

async function main() {
  try {
    await fixJackEmailNotifications()
    console.log('✅ Mise à jour terminée')
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await pool.end()
  }
}

main()
