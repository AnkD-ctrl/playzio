import { pool } from './database.js'
import { sendSlotJoinNotification } from './emailService.js'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'

async function testEmailNotificationsFix() {
  try {
    console.log('🧪 Test complet des notifications email...')
    
    // 1. Vérifier que la colonne email_notifications existe
    console.log('🔍 Vérification de la colonne email_notifications...')
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'slots' AND column_name = 'email_notifications'
    `)
    
    if (columnCheck.rows.length === 0) {
      console.log('❌ La colonne email_notifications n\'existe pas encore')
      console.log('💡 Il faut redémarrer le serveur pour que la migration soit appliquée')
      return
    }
    
    console.log('✅ Colonne email_notifications trouvée')
    
    // 2. Vérifier le profil de Jack
    console.log('👤 Vérification du profil de Jack...')
    const jackUser = await pool.query('SELECT * FROM users WHERE prenom = $1', ['Jack'])
    
    if (jackUser.rows.length === 0) {
      console.log('❌ Utilisateur Jack non trouvé')
      return
    }
    
    const jack = jackUser.rows[0]
    console.log('📧 Email de Jack:', jack.email || 'NON CONFIGURÉ')
    
    if (!jack.email) {
      console.log('⚠️  Jack n\'a pas d\'email configuré - les notifications ne fonctionneront pas')
      console.log('💡 Il faut ajouter un email au profil de Jack')
      return
    }
    
    // 3. Trouver un slot de Jack avec email_notifications activé
    console.log('🎯 Recherche d\'un slot de Jack...')
    const jackSlots = await pool.query(`
      SELECT id, created_by, email_notifications, custom_activity, date, heure_debut, heure_fin, type, lieu
      FROM slots 
      WHERE created_by = 'Jack' 
      ORDER BY created_at DESC 
      LIMIT 1
    `)
    
    if (jackSlots.rows.length === 0) {
      console.log('❌ Aucun slot trouvé pour Jack')
      return
    }
    
    const slot = jackSlots.rows[0]
    console.log('📊 Slot trouvé:', {
      id: slot.id,
      createdBy: slot.created_by,
      emailNotifications: slot.email_notifications,
      customActivity: slot.custom_activity
    })
    
    // 4. Activer les notifications email pour ce slot si nécessaire
    if (!slot.email_notifications) {
      console.log('🔧 Activation des notifications email pour ce slot...')
      await pool.query(`
        UPDATE slots 
        SET email_notifications = true 
        WHERE id = $1
      `, [slot.id])
      console.log('✅ Notifications email activées')
    }
    
    // 5. Tester l'envoi d'email
    console.log('📧 Test d\'envoi de notification email...')
    try {
      const result = await sendSlotJoinNotification(
        jack.email,
        jack.prenom,
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
      console.log('✅ Email envoyé avec succès:', result)
    } catch (emailError) {
      console.log('❌ Erreur lors de l\'envoi de l\'email:', emailError.message)
    }
    
    // 6. Tester le processus complet de join
    console.log('🔄 Test du processus complet de join...')
    
    // Retirer Jack du slot s'il y est déjà
    const currentParticipants = slot.participants || []
    if (currentParticipants.includes('Jack')) {
      console.log('ℹ️  Jack est déjà participant, on va d\'abord le retirer')
      const newParticipants = currentParticipants.filter(p => p !== 'Jack')
      await pool.query(`
        UPDATE slots 
        SET participants = $1 
        WHERE id = $2
      `, [newParticipants, slot.id])
      console.log('✅ Jack retiré du slot')
    }
    
    // Simuler le join
    console.log('🔄 Simulation de l\'inscription de Jack...')
    const updatedParticipants = [...(slot.participants || []), 'Jack']
    await pool.query(`
      UPDATE slots 
      SET participants = $1 
      WHERE id = $2
    `, [updatedParticipants, slot.id])
    
    // Vérifier que la notification serait envoyée
    const updatedSlot = await pool.query(`
      SELECT email_notifications, created_by, participants 
      FROM slots 
      WHERE id = $1
    `, [slot.id])
    
    const slotData = updatedSlot.rows[0]
    console.log('📊 État du slot après join:', {
      emailNotifications: slotData.email_notifications,
      createdBy: slotData.created_by,
      participants: slotData.participants
    })
    
    if (slotData.email_notifications && slotData.created_by) {
      console.log('✅ Les conditions pour l\'envoi d\'email sont remplies')
      console.log('📧 Une notification serait envoyée à:', jack.email)
    } else {
      console.log('❌ Les conditions pour l\'envoi d\'email ne sont pas remplies')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await pool.end()
  }
}

testEmailNotificationsFix()
