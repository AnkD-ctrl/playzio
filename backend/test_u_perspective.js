const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testUPerspective() {
  try {
    console.log('🧪 Test du filtrage des slots depuis la perspective de U...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // 1. Récupérer tous les slots
    console.log('\n📊 1. Récupération de tous les slots...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots?user=U`)
    
    if (!allSlotsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des slots:', allSlotsResponse.status)
      return
    }
    
    const allSlots = await allSlotsResponse.json()
    console.log('📋 Tous les slots récupérés:', allSlots.length)
    
    // 2. Vérifier les slots de Jack
    console.log('\n🎯 2. Slots de Jack visibles pour U...')
    const jackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
    console.log('📊 Slots de Jack:', jackSlots.length)
    jackSlots.forEach(slot => {
      console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - visibleToAll: ${slot.visibleToAll}, visibleToFriends: ${slot.visibleToFriends}, visibleToGroups: ${JSON.stringify(slot.visibleToGroups)}`)
    })
    
    // 3. Tester "Mes amis" pour U
    console.log('\n👥 3. Test "Mes amis" pour U...')
    const amisResponse = await fetch(`${API_BASE_URL}/api/friends/U`)
    if (amisResponse.ok) {
      const friendsData = await amisResponse.json()
      console.log('📊 Amis de U:', friendsData.friends?.length || 0)
      if (friendsData.friends) {
        friendsData.friends.forEach(friend => {
          console.log(`  - ${friend}`)
        })
      }
      
      // Filtrer les slots des amis
      const amisSlots = allSlots.filter(slot => 
        slot.createdBy !== 'U' && 
        slot.visibleToFriends === true &&
        friendsData.friends && friendsData.friends.includes(slot.createdBy)
      )
      console.log('📊 Slots des amis de U:', amisSlots.length)
      amisSlots.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - créé par: ${slot.createdBy}`)
      })
    }
    
    // 4. Tester "Communauté" pour U
    console.log('\n🏘️ 4. Test "Communauté" pour U...')
    const groupsResponse = await fetch(`${API_BASE_URL}/api/groups?user=U`)
    if (groupsResponse.ok) {
      const groups = await groupsResponse.json()
      console.log('📊 Groupes de U:', groups.length)
      groups.forEach(group => {
        console.log(`  - ${group.name} (${group.id})`)
      })
      
      // Filtrer les slots des groupes
      const groupNames = groups.map(group => group.name)
      const communauteSlots = allSlots.filter(slot => 
        slot.createdBy !== 'U' && 
        slot.visibleToGroups && slot.visibleToGroups.some(groupName => groupNames.includes(groupName))
      )
      console.log('📊 Slots de communauté de U:', communauteSlots.length)
      communauteSlots.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - créé par: ${slot.createdBy}, groupes: ${JSON.stringify(slot.visibleToGroups)}`)
      })
    }
    
    // 5. Tester "Publiques" pour U
    console.log('\n🌍 5. Test "Publiques" pour U...')
    const publiquesResponse = await fetch(`${API_BASE_URL}/api/slots?public_only=true&user=U`)
    if (publiquesResponse.ok) {
      const publiques = await publiquesResponse.json()
      console.log('📊 Slots publics pour U:', publiques.length)
      publiques.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - créé par: ${slot.createdBy}`)
      })
    }
    
    // 6. Vérifier la relation d'amitié Jack <-> U
    console.log('\n🤝 6. Vérification de la relation d\'amitié...')
    const jackFriendsResponse = await fetch(`${API_BASE_URL}/api/friends/Jack`)
    if (jackFriendsResponse.ok) {
      const jackFriendsData = await jackFriendsResponse.json()
      console.log('📊 Amis de Jack:', jackFriendsData.friends?.length || 0)
      if (jackFriendsData.friends) {
        console.log('Jack a U comme ami:', jackFriendsData.friends.includes('U'))
      }
    }
    
    const uFriendsResponse = await fetch(`${API_BASE_URL}/api/friends/U`)
    if (uFriendsResponse.ok) {
      const uFriendsData = await uFriendsResponse.json()
      console.log('📊 Amis de U:', uFriendsData.friends?.length || 0)
      if (uFriendsData.friends) {
        console.log('U a Jack comme ami:', uFriendsData.friends.includes('Jack'))
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testUPerspective()
