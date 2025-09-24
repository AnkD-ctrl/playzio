import { pool } from './database.js'
import dotenv from 'dotenv'

dotenv.config()

async function checkRailwayConfig() {
  try {
    console.log('🔍 Vérification de la configuration Railway...')
    
    // Vérifier les variables d'environnement
    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Configurée (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : '❌ Manquante')
    console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Manquante')
    
    // Vérifier un slot existant avec email_notifications
    const slotsResult = await pool.query('SELECT id, created_by, email_notifications FROM slots WHERE email_notifications = true LIMIT 3')
    console.log('📧 Slots avec notifications activées:', slotsResult.rows)
    
    // Vérifier que les organisateurs ont des emails
    for (const slot of slotsResult.rows) {
      const userResult = await pool.query('SELECT prenom, email FROM users WHERE prenom = $1', [slot.created_by])
      const user = userResult.rows[0]
      console.log(`👤 ${slot.created_by}: ${user ? (user.email || 'Pas d\'email') : 'Utilisateur non trouvé'}`)
    }
    
    await pool.end()
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkRailwayConfig()
