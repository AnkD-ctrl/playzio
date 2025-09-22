const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testNewSlotCreation() {
  try {
    console.log('🧪 Test de création d\'un nouveau slot avec emailNotifications...')
    
    // Créer un nouveau slot avec emailNotifications activé
    const slotData = {
      date: '2025-01-20',
      heureDebut: '14:00',
      heureFin: '16:00',
      type: ['Tennis'],
      customActivity: null,
      description: 'Test de notification email',
      lieu: 'Court de test',
      maxParticipants: 4,
      createdBy: 'Jack',
      visibleToGroups: [],
      visibleToAll: true,
      visibleToFriends: false,
      participants: [],
      emailNotifications: true
    }
    
    console.log('📝 Création du slot de test...')
    const createResponse = await fetch(`${API_BASE_URL}/api/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slotData)
    })
    
    if (!createResponse.ok) {
      const error = await createResponse.json()
      console.log('❌ Erreur lors de la création:', error)
      return
    }
    
    const newSlot = await createResponse.json()
    console.log('✅ Slot créé:', {
      id: newSlot.id,
      emailNotifications: newSlot.emailNotifications,
      createdBy: newSlot.createdBy
    })
    
    // Maintenant tester l'inscription
    console.log('🔄 Test d\'inscription au nouveau slot...')
    const joinResponse = await fetch(`${API_BASE_URL}/api/slots/${newSlot.id}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ participant: 'TestUser' })
    })
    
    if (joinResponse.ok) {
      const result = await joinResponse.json()
      console.log('✅ Inscription réussie')
      console.log('📊 Résultat:', result)
      console.log('💡 Vérifiez les logs Railway pour voir si la notification a été envoyée')
    } else {
      const error = await joinResponse.json()
      console.log('❌ Erreur lors de l\'inscription:', error)
    }
    
    // Nettoyer - supprimer le slot de test
    console.log('🧹 Nettoyage du slot de test...')
    const deleteResponse = await fetch(`${API_BASE_URL}/api/slots/${newSlot.id}`, {
      method: 'DELETE'
    })
    
    if (deleteResponse.ok) {
      console.log('✅ Slot de test supprimé')
    } else {
      console.log('⚠️  Impossible de supprimer le slot de test')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testNewSlotCreation()
