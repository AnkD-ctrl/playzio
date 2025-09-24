// Script pour tester les notifications email en simulant une jointure

const API_BASE_URL = 'https://playzio-production.up.railway.app'

async function testEmailNotification() {
  try {
    console.log('🧪 Test des notifications email...')
    
    // 1. Récupérer le slot de Jack
    const getResponse = await fetch(`${API_BASE_URL}/api/slots?public_only=true`)
    const slots = await getResponse.json()
    const jackSlot = slots.find(s => s.createdBy === 'Jack')
    
    if (!jackSlot) {
      console.error('❌ Slot de Jack non trouvé')
      return
    }
    
    console.log('📊 Slot de Jack trouvé:', {
      id: jackSlot.id,
      createdBy: jackSlot.createdBy,
      emailNotifications: jackSlot.emailNotifications,
      customActivity: jackSlot.customActivity,
      participants: jackSlot.participants
    })
    
    // 2. Vérifier si Jack est déjà participant
    if (jackSlot.participants.includes('Jack')) {
      console.log('ℹ️ Jack est déjà participant, on va d\'abord le retirer')
      
      // Retirer Jack du slot
      const leaveResponse = await fetch(`${API_BASE_URL}/api/slots/${jackSlot.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant: 'Jack'
        })
      })
      
      if (leaveResponse.ok) {
        console.log('✅ Jack retiré du slot')
      } else {
        console.log('❌ Erreur lors du retrait de Jack')
      }
    }
    
    // 3. Faire rejoindre Jack au slot pour déclencher la notification
    console.log('🔄 Jack rejoint le slot pour déclencher la notification...')
    
    const joinResponse = await fetch(`${API_BASE_URL}/api/slots/${jackSlot.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        participant: 'Jack'
      })
    })
    
    if (joinResponse.ok) {
      const result = await joinResponse.json()
      console.log('✅ Jack a rejoint le slot')
      console.log('📧 Résultat:', result)
    } else {
      const error = await joinResponse.json()
      console.log('❌ Erreur lors de la jointure:', error)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testEmailNotification()

