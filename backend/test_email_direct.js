import { sendSlotJoinNotification } from './emailService.js'
import dotenv from 'dotenv'

dotenv.config()

async function testEmailDirect() {
  try {
    console.log('🧪 Test direct d\'envoi d\'email...')
    
    // Vérifier les variables d'environnement
    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Configurée' : '❌ Manquante')
    console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Manquante')
    
    if (!process.env.SENDGRID_API_KEY) {
      console.log('❌ SENDGRID_API_KEY non configurée')
      console.log('💡 Il faut configurer cette variable sur Railway')
      return
    }
    
    // Test d'envoi d'email
    console.log('📧 Test d\'envoi d\'email...')
    const result = await sendSlotJoinNotification(
      'jacques.maarek@gmail.com', // Email de test
      'Jack',
      'TestUser',
      {
        date: '2025-01-20',
        heureDebut: '10:00',
        heureFin: '12:00',
        type: 'Tennis',
        customActivity: null,
        lieu: 'Parc de la Tête d\'Or'
      }
    )
    
    console.log('✅ Résultat:', result)
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'email:', error)
    console.error('Détails:', error.message)
  }
}

testEmailDirect()
