const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testJackSlots30Oct() {
  try {
    console.log('🧪 Test des slots de Jack pour le 30/10/2025...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // 1. Récupérer tous les slots
    console.log('\n📊 1. Récupération de tous les slots...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    
    if (!allSlotsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des slots:', allSlotsResponse.status)
      return
    }
    
    const allSlots = await allSlotsResponse.json()
    console.log('📋 Tous les slots récupérés:', allSlots.length)
    
    // 2. Filtrer les slots de Jack pour le 30/10/2025
    console.log('\n🎯 2. Slots de Jack pour le 30/10/2025...')
    const jackSlots30Oct = allSlots.filter(slot => 
      slot.createdBy === 'Jack' && 
      slot.date === '2025-10-30'
    )
    
    console.log('📊 Nombre de slots de Jack pour le 30/10/2025:', jackSlots30Oct.length)
    
    if (jackSlots30Oct.length === 0) {
      console.log('❌ Aucun slot trouvé pour Jack le 30/10/2025')
      
      // Vérifier tous les slots de Jack
      const allJackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
      console.log('\n📋 Tous les slots de Jack:')
      allJackSlots.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - Date: ${slot.date}`)
      })
      
      return
    }
    
    // 3. Afficher les détails de chaque slot
    console.log('\n📋 3. Détails des slots de Jack pour le 30/10/2025:')
    jackSlots30Oct.forEach((slot, index) => {
      console.log(`\n--- Slot ${index + 1} ---`)
      console.log(`ID: ${slot.id}`)
      console.log(`Date: ${slot.date}`)
      console.log(`Heure: ${slot.heureDebut} - ${slot.heureFin}`)
      console.log(`Activité: ${slot.customActivity || 'Activité par défaut'}`)
      console.log(`Type: ${JSON.stringify(slot.type)}`)
      console.log(`Description: ${slot.description || 'Aucune'}`)
      console.log(`Lieu: ${slot.lieu || 'Aucun'}`)
      console.log(`Max participants: ${slot.maxParticipants || 'Illimité'}`)
      console.log(`Créé par: ${slot.createdBy}`)
      console.log(`Visible à tous: ${slot.visibleToAll}`)
      console.log(`Visible aux amis: ${slot.visibleToFriends}`)
      console.log(`Visible aux groupes: ${JSON.stringify(slot.visibleToGroups)}`)
      console.log(`Participants: ${JSON.stringify(slot.participants)}`)
      console.log(`Notifications email: ${slot.emailNotifications}`)
    })
    
    // 4. Vérifier les différents types de visibilité
    console.log('\n🔍 4. Analyse des types de visibilité:')
    const publicSlots = jackSlots30Oct.filter(slot => slot.visibleToAll === true)
    const friendsSlots = jackSlots30Oct.filter(slot => slot.visibleToFriends === true)
    const groupSlots = jackSlots30Oct.filter(slot => slot.visibleToGroups && slot.visibleToGroups.length > 0)
    
    console.log(`📊 Slots publics: ${publicSlots.length}`)
    console.log(`📊 Slots amis: ${friendsSlots.length}`)
    console.log(`📊 Slots groupes: ${groupSlots.length}`)
    
    // 5. Vérifier les groupes
    console.log('\n👥 5. Groupes de Jack:')
    const groupsResponse = await fetch(`${API_BASE_URL}/api/groups?user=Jack`)
    if (groupsResponse.ok) {
      const groups = await groupsResponse.json()
      console.log('📊 Groupes de Jack:', groups.length)
      groups.forEach(group => {
        console.log(`  - ${group.name} (${group.id})`)
      })
    }
    
    // 6. Vérifier les amis
    console.log('\n👥 6. Amis de Jack:')
    const friendsResponse = await fetch(`${API_BASE_URL}/api/friends/Jack`)
    if (friendsResponse.ok) {
      const friendsData = await friendsResponse.json()
      console.log('📊 Amis de Jack:', friendsData.friends?.length || 0)
      if (friendsData.friends) {
        friendsData.friends.forEach(friend => {
          console.log(`  - ${friend}`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testJackSlots30Oct()
