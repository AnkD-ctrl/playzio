import { sendSlotJoinNotification } from './emailService.js'

async function testSendGridDirect() {
  try {
    console.log('🧪 Test direct de SendGrid...')
    
    // Vérifier les variables d'environnement
    console.log('🔍 Vérification des variables d\'environnement:')
    console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Configuré' : '❌ Manquant')
    console.log('SENDGRID_FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || '❌ Manquant')
    
    if (!process.env.SENDGRID_API_KEY) {
      console.log('❌ SENDGRID_API_KEY non configurée')
      console.log('💡 Il faut configurer cette variable dans Railway')
      return
    }
    
    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.log('❌ SENDGRID_FROM_EMAIL non configurée')
      console.log('💡 Il faut configurer cette variable dans Railway')
      return
    }
    
    // Test d'envoi d'email
    console.log('📧 Test d\'envoi d\'email...')
    const result = await sendSlotJoinNotification(
      'jack@example.com', // Email de test
      'Jack',
      'TestUser',
      {
        date: '2025-01-15',
        heureDebut: '10:00',
        heureFin: '13:00',
        type: 'Tennis',
        customActivity: null,
        lieu: 'Parc de la Tête d\'Or'
      }
    )
    
    console.log('✅ Résultat:', result)
    
  } catch (error) {
    console.error('❌ Erreur lors du test SendGrid:', error)
    console.error('Détails:', error.message)
  }
}

testSendGridDirect()
