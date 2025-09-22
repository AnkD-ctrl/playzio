const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testSlotFiltering() {
  try {
    console.log('🧪 Test du filtrage des slots pour Jack...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // 1. Récupérer tous les slots de Jack
    console.log('\n📊 1. Récupération de tous les slots de Jack...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    
    if (!allSlotsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des slots:', allSlotsResponse.status)
      return
    }
    
    const allSlots = await allSlotsResponse.json()
    const jackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
    
    console.log('🎯 Slots créés par Jack:', jackSlots.length)
    jackSlots.forEach(slot => {
      console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - visibleToAll: ${slot.visibleToAll}, visibleToFriends: ${slot.visibleToFriends}, visibleToGroups: ${JSON.stringify(slot.visibleToGroups)}`)
    })
    
    // 2. Tester "Mes dispo" (devrait montrer tous les slots de Jack)
    console.log('\n📋 2. Test "Mes dispo"...')
    const mesDisposResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    if (mesDisposResponse.ok) {
      const mesDispos = await mesDisposResponse.json()
      const jackMesDispos = mesDispos.filter(slot => slot.createdBy === 'Jack')
      console.log('✅ Slots dans "Mes dispo":', jackMesDispos.length)
      jackMesDispos.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'}`)
      })
    }
    
    // 3. Tester "Publiques" (ne devrait PAS montrer les slots de Jack)
    console.log('\n🌍 3. Test "Publiques"...')
    const publiquesResponse = await fetch(`${API_BASE_URL}/api/slots?public_only=true&user=Jack`)
    if (publiquesResponse.ok) {
      const publiques = await publiquesResponse.json()
      const jackPubliques = publiques.filter(slot => slot.createdBy === 'Jack')
      console.log('📊 Slots publics (devrait être 0 pour Jack):', jackPubliques.length)
      if (jackPubliques.length > 0) {
        console.log('❌ PROBLÈME: Jack voit ses propres slots dans "Publiques"')
        jackPubliques.forEach(slot => {
          console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'}`)
        })
      } else {
        console.log('✅ OK: Jack ne voit pas ses propres slots dans "Publiques"')
      }
    }
    
    // 4. Tester "Mes amis" (devrait montrer les slots des amis avec visibleToFriends = true)
    console.log('\n👥 4. Test "Mes amis"...')
    const amisResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    if (amisResponse.ok) {
      const amis = await amisResponse.json()
      const jackAmis = amis.filter(slot => 
        slot.createdBy !== 'Jack' && 
        slot.visibleToFriends === true
      )
      console.log('📊 Slots des amis (devrait exclure Jack):', jackAmis.length)
      jackAmis.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - créé par: ${slot.createdBy}`)
      })
    }
    
    // 5. Tester "Communauté" (devrait montrer les slots des groupes)
    console.log('\n🏘️ 5. Test "Communauté"...')
    const communauteResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    if (communauteResponse.ok) {
      const communaute = await communauteResponse.json()
      const jackCommunaute = communaute.filter(slot => 
        slot.createdBy !== 'Jack' && 
        slot.visibleToGroups && slot.visibleToGroups.length > 0
      )
      console.log('📊 Slots de communauté (devrait exclure Jack):', jackCommunaute.length)
      jackCommunaute.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - créé par: ${slot.createdBy}, groupes: ${JSON.stringify(slot.visibleToGroups)}`)
      })
    }
    
    // 6. Récupérer les groupes de Jack
    console.log('\n👥 6. Groupes de Jack...')
    const groupsResponse = await fetch(`${API_BASE_URL}/api/groups?user=Jack`)
    if (groupsResponse.ok) {
      const groups = await groupsResponse.json()
      console.log('📊 Groupes de Jack:', groups.length)
      groups.forEach(group => {
        console.log(`  - ${group.name} (${group.id})`)
      })
    }
    
    // 7. Récupérer les amis de Jack
    console.log('\n👥 7. Amis de Jack...')
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

testSlotFiltering()
