import { pool } from './database.js'
import { sendSlotJoinNotification } from './emailService.js'
import dotenv from 'dotenv'

dotenv.config()

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

async function testNotificationFix() {
  try {
    console.log('🧪 Test de correction des notifications email...')
    
    // 1. Créer un slot avec emailNotifications activé
    console.log('📅 Création d\'un slot de test...')
    const slotResult = await pool.query(`
      INSERT INTO slots (id, date, heure_debut, heure_fin, type, created_by, email_notifications, participants)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      'test-notification-' + Date.now(),
      '2025-01-20',
      '10:00',
      '12:00',
      JSON.stringify(['Tennis']),
      'Jack',
      true,
      []
    ])
    
    const slot = slotResult.rows[0]
    console.log('✅ Slot créé:', slot.id)
    console.log('📧 Email notifications:', slot.email_notifications)
    
    // 2. Vérifier que Jack a un email
    const jackResult = await pool.query('SELECT email FROM users WHERE prenom = $1', ['Jack'])
    const jack = jackResult.rows[0]
    
    if (!jack || !jack.email) {
      console.log('❌ Jack n\'a pas d\'email configuré')
      console.log('💡 Ajoutons un email de test pour Jack...')
      
      await pool.query('UPDATE users SET email = $1 WHERE prenom = $2', ['jack@example.com', 'Jack'])
      console.log('✅ Email ajouté pour Jack: jack@example.com')
    } else {
      console.log('✅ Jack a un email:', jack.email)
    }
    
    // 3. Tester l'envoi d'email directement
    console.log('📧 Test d\'envoi d\'email direct...')
    try {
      const emailResult = await sendSlotJoinNotification(
        jack.email || 'jack@example.com',
        'Jack',
        'TestUser',
        {
          date: slot.date,
          heureDebut: slot.heure_debut,
          heureFin: slot.heure_fin,
          type: slot.type,
          customActivity: slot.custom_activity,
          lieu: slot.lieu
        }
      )
      console.log('✅ Email envoyé avec succès:', emailResult)
    } catch (emailError) {
      console.log('❌ Erreur lors de l\'envoi d\'email:', emailError.message)
    }
    
    // 4. Tester le processus complet de join via API
    console.log('🔄 Test du processus complet de join...')
    const joinResponse = await fetch(`${API_BASE_URL}/api/slots/${slot.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ participant: 'TestUser' })
    })
    
    if (joinResponse.ok) {
      const result = await joinResponse.json()
      console.log('✅ Join réussi:', result)
    } else {
      const error = await joinResponse.json()
      console.log('❌ Erreur lors du join:', error)
    }
    
    // 5. Nettoyer
    await pool.query('DELETE FROM slots WHERE id = $1', [slot.id])
    console.log('🧹 Slot de test supprimé')
    
    await pool.end()
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testNotificationFix()
