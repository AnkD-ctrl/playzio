const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testSlotNotificationFlow() {
  try {
    console.log('🧪 Test du flux de notification de slot...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // 1. Récupérer les slots de Jack
    console.log('📊 Récupération des slots de Jack...')
    const slotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
    
    if (!slotsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des slots:', slotsResponse.status)
      return
    }
    
    const allSlots = await slotsResponse.json()
    const jackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
    
    console.log('🎯 Slots de Jack trouvés:', jackSlots.length)
    
    if (jackSlots.length === 0) {
      console.log('❌ Aucun slot trouvé pour Jack')
      return
    }
    
    // Prendre le premier slot
    const slot = jackSlots[0]
    console.log('📋 Détails du slot:', {
      id: slot.id,
      createdBy: slot.createdBy,
      emailNotifications: slot.emailNotifications,
      participants: slot.participants,
      customActivity: slot.customActivity
    })
    
    // 2. Vérifier si emailNotifications est activé
    if (!slot.emailNotifications) {
      console.log('⚠️  emailNotifications est désactivé pour ce slot')
      console.log('🔧 Activation des notifications email...')
      
      const enableResponse = await fetch(`${API_BASE_URL}/api/slots/${slot.id}/enable-email-notifications`, {
        method: 'POST'
      })
      
      if (enableResponse.ok) {
        console.log('✅ Notifications email activées')
      } else {
        console.log('❌ Erreur lors de l\'activation:', enableResponse.status)
      }
    } else {
      console.log('✅ emailNotifications est déjà activé')
    }
    
    // 3. Tester l'inscription à un slot
    console.log('🔄 Test d\'inscription au slot...')
    
    // Retirer Jack s'il est déjà participant
    let currentParticipants = slot.participants || []
    if (currentParticipants.includes('Jack')) {
      console.log('ℹ️  Jack est déjà participant, on va d\'abord le retirer')
      const leaveResponse = await fetch(`${API_BASE_URL}/api/slots/${slot.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participant: 'Jack' })
      })
      
      if (leaveResponse.ok) {
        console.log('✅ Jack retiré du slot')
      } else {
        console.log('❌ Erreur lors du retrait:', leaveResponse.status)
      }
    }
    
    // Maintenant faire rejoindre Jack
    console.log('🔄 Jack rejoint le slot...')
    const joinResponse = await fetch(`${API_BASE_URL}/api/slots/${slot.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ participant: 'Jack' })
    })
    
    if (joinResponse.ok) {
      const result = await joinResponse.json()
      console.log('✅ Jack a rejoint le slot')
      console.log('📊 Résultat:', result)
      
      // Vérifier les logs du serveur pour voir si la notification a été tentée
      console.log('💡 Vérifiez les logs du serveur Railway pour voir si la notification a été envoyée')
    } else {
      const error = await joinResponse.json()
      console.log('❌ Erreur lors de l\'inscription:', error)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testSlotNotificationFlow()
