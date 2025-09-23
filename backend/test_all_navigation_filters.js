const API_BASE_URL = 'https://playzio-production.up.railway.app'

async function testAllNavigationFilters() {
  try {
    console.log('🔍 TEST COMPLET DES FILTRES DE NAVIGATION')
    console.log('=' .repeat(50))
    
    // 1. Récupérer tous les slots
    console.log('\n📊 1. Récupération de tous les slots...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
    const allSlots = await allSlotsResponse.json()
    console.log(`Total slots dans la base: ${allSlots.length}`)
    
    // 2. Analyser les slots de Jack
    const jackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
    console.log(`\n🎯 Slots de Jack: ${jackSlots.length}`)
    jackSlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ${slot.description} - visibleToAll: ${slot.visibleToAll}, visibleToFriends: ${slot.visibleToFriends}, visibleToGroups: ${JSON.stringify(slot.visibleToGroups)}`)
    })
    
    // 3. Récupérer les groupes et amis de Jack
    console.log('\n👥 3. Récupération des groupes et amis de Jack...')
    
    const groupsResponse = await fetch(`${API_BASE_URL}/api/groups?user=Jack`)
    const groups = groupsResponse.ok ? await groupsResponse.json() : []
    console.log(`Groupes de Jack: ${groups.length}`)
    groups.forEach(group => console.log(`  - ${group.name} (${group.id})`))
    
    const friendsResponse = await fetch(`${API_BASE_URL}/api/friends/Jack`)
    const friendsData = friendsResponse.ok ? await friendsResponse.json() : { friends: [] }
    const friends = friendsData.friends || []
    console.log(`Amis de Jack: ${friends.length}`)
    friends.forEach(friend => console.log(`  - ${friend}`))
    
    // 4. Test de chaque onglet de navigation
    console.log('\n🧪 4. TEST DE CHAQUE ONGLET DE NAVIGATION')
    console.log('=' .repeat(50))
    
    // Test "Mes dispo" - my_slots_only
    console.log('\n📋 TEST "Mes dispo" (my_slots_only=true)...')
    const mesDisposResponse = await fetch(`${API_BASE_URL}/api/slots?my_slots_only=true&user=Jack`)
    const mesDispos = mesDisposResponse.ok ? await mesDisposResponse.json() : []
    console.log(`✅ API retourne: ${mesDispos.length} slots`)
    mesDispos.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Test "Publiques" - public_only
    console.log('\n🌍 TEST "Publiques" (public_only=true)...')
    const publiquesResponse = await fetch(`${API_BASE_URL}/api/slots?public_only=true&user=Jack`)
    const publiques = publiquesResponse.ok ? await publiquesResponse.json() : []
    console.log(`✅ API retourne: ${publiques.length} slots`)
    publiques.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Test "Normal" - user=Jack (pour amis et communauté)
    console.log('\n👤 TEST "Normal" (user=Jack)...')
    const normalResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    const normal = normalResponse.ok ? await normalResponse.json() : []
    console.log(`✅ API retourne: ${normal.length} slots`)
    normal.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // 5. Simulation de la logique frontend
    console.log('\n🎭 5. SIMULATION DE LA LOGIQUE FRONTEND')
    console.log('=' .repeat(50))
    
    // Simulation "Mes dispo"
    const frontendMesDispos = jackSlots.filter(slot => slot.createdBy === 'Jack')
    console.log(`\n📋 Frontend "Mes dispo": ${frontendMesDispos.length} slots`)
    frontendMesDispos.forEach(slot => console.log(`  - ${slot.description}`))
    
    // Simulation "Publiques"
    const frontendPubliques = allSlots.filter(slot => 
      slot.visibleToAll === true && slot.createdBy !== 'Jack'
    )
    console.log(`\n🌍 Frontend "Publiques": ${frontendPubliques.length} slots`)
    frontendPubliques.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Simulation "Mes amis"
    const frontendAmis = allSlots.filter(slot => 
      slot.createdBy !== 'Jack' && 
      slot.visibleToFriends === true &&
      friends.includes(slot.createdBy)
    )
    console.log(`\n👥 Frontend "Mes amis": ${frontendAmis.length} slots`)
    frontendAmis.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Simulation "Communauté"
    const userGroupIds = groups.map(group => group.id)
    const frontendCommunaute = allSlots.filter(slot => 
      slot.createdBy !== 'Jack' && 
      slot.visibleToGroups && 
      slot.visibleToGroups.length > 0 &&
      slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId))
    )
    console.log(`\n🏘️ Frontend "Communauté": ${frontendCommunaute.length} slots`)
    frontendCommunaute.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // 6. Comparaison et détection des problèmes
    console.log('\n❌ 6. DÉTECTION DES PROBLÈMES')
    console.log('=' .repeat(50))
    
    // Problème "Mes dispo"
    if (mesDispos.length !== jackSlots.length) {
      console.log(`❌ "Mes dispo": API retourne ${mesDispos.length} slots au lieu de ${jackSlots.length}`)
    } else {
      console.log(`✅ "Mes dispo": OK (${mesDispos.length} slots)`)
    }
    
    // Problème "Publiques"
    const jackInPubliques = publiques.filter(slot => slot.createdBy === 'Jack')
    if (jackInPubliques.length > 0) {
      console.log(`❌ "Publiques": Contient ${jackInPubliques.length} slots de Jack (ne devrait pas)`)
    } else {
      console.log(`✅ "Publiques": OK (0 slots de Jack)`)
    }
    
    // Problème "Mes amis"
    const jackInAmis = normal.filter(slot => 
      slot.createdBy === 'Jack' && 
      slot.visibleToFriends === true
    )
    if (jackInAmis.length > 0) {
      console.log(`❌ "Mes amis": Contient ${jackInAmis.length} slots de Jack (ne devrait pas)`)
    } else {
      console.log(`✅ "Mes amis": OK (0 slots de Jack)`)
    }
    
    // Problème "Communauté"
    const jackInCommunaute = normal.filter(slot => 
      slot.createdBy === 'Jack' && 
      slot.visibleToGroups && 
      slot.visibleToGroups.length > 0
    )
    if (jackInCommunaute.length > 0) {
      console.log(`❌ "Communauté": Contient ${jackInCommunaute.length} slots de Jack (ne devrait pas)`)
    } else {
      console.log(`✅ "Communauté": OK (0 slots de Jack)`)
    }
    
    console.log('\n🎯 RÉSUMÉ:')
    console.log(`- Slots de Jack: ${jackSlots.length}`)
    console.log(`- "Mes dispo" API: ${mesDispos.length}`)
    console.log(`- "Publiques" API: ${publiques.length}`)
    console.log(`- "Normal" API: ${normal.length}`)
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testAllNavigationFilters()
