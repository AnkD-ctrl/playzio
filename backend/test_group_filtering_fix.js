const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testGroupFilteringFix() {
  try {
    console.log('🧪 Test de la correction du filtrage des groupes...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // 1. Récupérer les groupes de U
    console.log('\n👥 1. Groupes de U...')
    const groupsResponse = await fetch(`${API_BASE_URL}/api/groups?user=U`)
    if (groupsResponse.ok) {
      const groups = await groupsResponse.json()
      console.log('📊 Groupes de U:', groups.length)
      
      // Trouver le groupe "test"
      const testGroup = groups.find(group => group.name === 'test')
      if (testGroup) {
        console.log('✅ Groupe "test" trouvé:', testGroup)
      } else {
        console.log('❌ Groupe "test" non trouvé')
      }
    }
    
    // 2. Récupérer tous les slots
    console.log('\n📊 2. Tous les slots...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots?user=U`)
    if (allSlotsResponse.ok) {
      const allSlots = await allSlotsResponse.json()
      console.log('📋 Tous les slots récupérés:', allSlots.length)
      
      // 3. Tester la logique de filtrage des groupes (simulation frontend)
      console.log('\n🏘️ 3. Test de la logique de filtrage des groupes...')
      const userGroups = await fetch(`${API_BASE_URL}/api/groups?user=U`).then(r => r.json())
      const userGroupIds = userGroups.map(group => group.id)
      
      console.log('📊 IDs des groupes de U:', userGroupIds)
      
      const communauteSlots = allSlots.filter(slot => 
        slot.createdBy !== 'U' && // Exclure ses propres slots
        slot.visibleToGroups && slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId))
      )
      
      console.log('📊 Slots de communauté (nouvelle logique):', communauteSlots.length)
      communauteSlots.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.customActivity || 'Activité'} - créé par: ${slot.createdBy}, groupes: ${JSON.stringify(slot.visibleToGroups)}`)
      })
      
      // 4. Vérifier spécifiquement le slot de Jack pour le groupe "test"
      console.log('\n🎯 4. Vérification du slot de Jack pour le groupe "test"...')
      const jackGroupSlot = allSlots.find(slot => 
        slot.createdBy === 'Jack' && 
        slot.visibleToGroups && 
        slot.visibleToGroups.includes('SgsZj9aDWUtYX35FPgmw2')
      )
      
      if (jackGroupSlot) {
        console.log('✅ Slot de Jack pour le groupe "test" trouvé:', {
          id: jackGroupSlot.id,
          customActivity: jackGroupSlot.customActivity,
          visibleToGroups: jackGroupSlot.visibleToGroups
        })
      } else {
        console.log('❌ Slot de Jack pour le groupe "test" non trouvé')
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testGroupFilteringFix()
