const API_BASE_URL = 'https://playzio-production.up.railway.app'

async function createTestSlotsOtherUsers() {
  try {
    console.log('🔧 Création de slots de test avec d\'autres utilisateurs...')
    
    // Créer des slots pour Cynthia
    const cynthiaSlots = [
      {
        date: '2025-10-30',
        heureDebut: '14:00',
        heureFin: '17:00',
        type: 'tennis',
        description: 'Cynthia - Slot public',
        createdBy: 'Cynthia',
        visibleToAll: true,
        visibleToFriends: false,
        visibleToGroups: [],
        emailNotifications: true
      },
      {
        date: '2025-10-30',
        heureDebut: '18:00',
        heureFin: '21:00',
        type: 'padel',
        description: 'Cynthia - Slot amis',
        createdBy: 'Cynthia',
        visibleToAll: false,
        visibleToFriends: true,
        visibleToGroups: [],
        emailNotifications: true
      }
    ]
    
    // Créer des slots pour U
    const uSlots = [
      {
        date: '2025-10-30',
        heureDebut: '15:00',
        heureFin: '18:00',
        type: 'tennis',
        description: 'U - Slot groupe test',
        createdBy: 'U',
        visibleToAll: false,
        visibleToFriends: false,
        visibleToGroups: ['SgsZj9aDWUtYX35FPgmw2'], // Groupe "test"
        emailNotifications: true
      }
    ]
    
    // Créer les slots de Cynthia
    console.log('\n👩 Création des slots de Cynthia...')
    for (const slot of cynthiaSlots) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/slots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slot)
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Slot créé: ${slot.description}`)
        } else {
          console.log(`❌ Erreur création slot: ${slot.description}`)
        }
      } catch (error) {
        console.log(`❌ Erreur: ${slot.description} - ${error.message}`)
      }
    }
    
    // Créer les slots de U
    console.log('\n👨 Création des slots de U...')
    for (const slot of uSlots) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/slots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slot)
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ Slot créé: ${slot.description}`)
        } else {
          console.log(`❌ Erreur création slot: ${slot.description}`)
        }
      } catch (error) {
        console.log(`❌ Erreur: ${slot.description} - ${error.message}`)
      }
    }
    
    // Vérifier le résultat
    console.log('\n📊 Vérification des slots créés...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
    const allSlots = await allSlotsResponse.json()
    
    console.log(`Total slots: ${allSlots.length}`)
    allSlots.forEach(slot => {
      console.log(`- ${slot.description} (${slot.createdBy}) - visibleToAll: ${slot.visibleToAll}, visibleToFriends: ${slot.visibleToFriends}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

createTestSlotsOtherUsers()
