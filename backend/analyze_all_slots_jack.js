const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function analyzeAllSlotsJack() {
  try {
    console.log('🔍 Analyse complète des slots et de leur filtrage pour Jack...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // 1. Récupérer TOUS les slots (sans filtre)
    console.log('\n📊 1. Récupération de TOUS les slots...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
    
    if (!allSlotsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des slots:', allSlotsResponse.status)
      return
    }
    
    const allSlots = await allSlotsResponse.json()
    console.log('📋 Total des slots dans la base:', allSlots.length)
    
    // 2. Analyser les slots de Jack
    console.log('\n🎯 2. Analyse des slots de Jack...')
    const jackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
    console.log('📊 Nombre de slots de Jack:', jackSlots.length)
    
    jackSlots.forEach((slot, index) => {
      console.log(`\n--- SLOT ${index + 1} DE JACK ---`)
      console.log(`ID: ${slot.id}`)
      console.log(`Date: ${slot.date}`)
      console.log(`Heure: ${slot.heureDebut} - ${slot.heureFin}`)
      console.log(`Description: ${slot.description || 'Aucune'}`)
      console.log(`Créé par: ${slot.createdBy}`)
      console.log(`Visible à tous: ${slot.visibleToAll}`)
      console.log(`Visible aux amis: ${slot.visibleToFriends}`)
      console.log(`Visible aux groupes: ${JSON.stringify(slot.visibleToGroups)}`)
      console.log(`Participants: ${JSON.stringify(slot.participants)}`)
      console.log(`Notifications email: ${slot.emailNotifications}`)
      
      // Analyser la logique de filtrage
      console.log('\n🔍 LOGIQUE DE FILTRAGE:')
      console.log(`- "Mes dispo": ${slot.createdBy === 'Jack' ? '✅ OUI' : '❌ NON'}`)
      console.log(`- "Publiques": ${slot.visibleToAll === true && slot.createdBy !== 'Jack' ? '✅ OUI' : '❌ NON'}`)
      console.log(`- "Mes amis": ${slot.createdBy !== 'Jack' && slot.visibleToFriends === true ? '✅ OUI' : '❌ NON'}`)
      console.log(`- "Communauté": ${slot.createdBy !== 'Jack' && slot.visibleToGroups && slot.visibleToGroups.length > 0 ? '✅ OUI' : '❌ NON'}`)
    })
    
    // 3. Tester chaque API avec Jack
    console.log('\n🧪 3. Test des APIs avec Jack...')
    
    // Test "Mes dispo" - my_slots_only
    console.log('\n📋 Test "Mes dispo" (my_slots_only=true)...')
    const mesDisposResponse = await fetch(`${API_BASE_URL}/api/slots?my_slots_only=true&user=Jack`)
    if (mesDisposResponse.ok) {
      const mesDispos = await mesDisposResponse.json()
      console.log('📊 Résultat API "Mes dispo":', mesDispos.length, 'slots')
      mesDispos.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.description} (${slot.createdBy})`)
      })
    }
    
    // Test "Publiques" - public_only
    console.log('\n🌍 Test "Publiques" (public_only=true)...')
    const publiquesResponse = await fetch(`${API_BASE_URL}/api/slots?public_only=true&user=Jack`)
    if (publiquesResponse.ok) {
      const publiques = await publiquesResponse.json()
      console.log('📊 Résultat API "Publiques":', publiques.length, 'slots')
      publiques.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.description} (${slot.createdBy})`)
      })
    }
    
    // Test "Normal" - user=Jack
    console.log('\n👤 Test "Normal" (user=Jack)...')
    const normalResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    if (normalResponse.ok) {
      const normal = await normalResponse.json()
      console.log('📊 Résultat API "Normal":', normal.length, 'slots')
      normal.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.description} (${slot.createdBy})`)
      })
    }
    
    // 4. Récupérer les groupes et amis de Jack
    console.log('\n👥 4. Groupes et amis de Jack...')
    
    // Groupes
    const groupsResponse = await fetch(`${API_BASE_URL}/api/groups?user=Jack`)
    if (groupsResponse.ok) {
      const groups = await groupsResponse.json()
      console.log('📊 Groupes de Jack:', groups.length)
      groups.forEach(group => {
        console.log(`  - ${group.name} (${group.id})`)
      })
    }
    
    // Amis
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
    
    // 5. Simulation de la logique frontend
    console.log('\n🎭 5. Simulation de la logique frontend...')
    
    // Simulation "Mes dispo"
    const frontendMesDispos = jackSlots.filter(slot => slot.createdBy === 'Jack')
    console.log('📊 Frontend "Mes dispo":', frontendMesDispos.length, 'slots')
    
    // Simulation "Publiques"
    const frontendPubliques = allSlots.filter(slot => 
      slot.visibleToAll === true && slot.createdBy !== 'Jack'
    )
    console.log('📊 Frontend "Publiques":', frontendPubliques.length, 'slots')
    
    // Simulation "Mes amis"
    const frontendAmis = allSlots.filter(slot => 
      slot.createdBy !== 'Jack' && 
      slot.visibleToFriends === true
    )
    console.log('📊 Frontend "Mes amis":', frontendAmis.length, 'slots')
    
    // Simulation "Communauté"
    const frontendCommunaute = allSlots.filter(slot => 
      slot.createdBy !== 'Jack' && 
      slot.visibleToGroups && slot.visibleToGroups.length > 0
    )
    console.log('📊 Frontend "Communauté":', frontendCommunaute.length, 'slots')
    
    // 6. Résumé des problèmes
    console.log('\n❌ 6. PROBLÈMES IDENTIFIÉS:')
    
    const mesDisposAPI = await fetch(`${API_BASE_URL}/api/slots?my_slots_only=true&user=Jack`).then(r => r.json())
    if (mesDisposAPI.length !== jackSlots.length) {
      console.log(`❌ "Mes dispo" API: ${mesDisposAPI.length} slots au lieu de ${jackSlots.length}`)
    }
    
    const publiquesAPI = await fetch(`${API_BASE_URL}/api/slots?public_only=true&user=Jack`).then(r => r.json())
    const jackInPubliques = publiquesAPI.filter(slot => slot.createdBy === 'Jack')
    if (jackInPubliques.length > 0) {
      console.log(`❌ "Publiques" contient ${jackInPubliques.length} slots de Jack`)
    }
    
    console.log('\n✅ ANALYSE TERMINÉE')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message)
  }
}

analyzeAllSlotsJack()
