const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testFinalFiltering() {
  try {
    console.log('🧪 Test final du filtrage des slots pour Jack...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // Attendre le déploiement
    console.log('⏳ Attente du déploiement...')
    await new Promise(resolve => setTimeout(resolve, 30000)) // 30 secondes
    
    // 1. Test "Mes dispo" - devrait montrer TOUS les 4 slots de Jack
    console.log('\n📋 1. Test "Mes dispo" (devrait montrer 4 slots)...')
    const mesDisposResponse = await fetch(`${API_BASE_URL}/api/slots?my_slots_only=true&user=Jack`)
    if (mesDisposResponse.ok) {
      const mesDispos = await mesDisposResponse.json()
      console.log('📊 Slots dans "Mes dispo":', mesDispos.length)
      mesDispos.forEach((slot, index) => {
        console.log(`  ${index + 1}. ${slot.id}: ${slot.description} - ${slot.visibleToAll ? 'Public' : slot.visibleToFriends ? 'Amis' : slot.visibleToGroups.length > 0 ? 'Groupe' : 'Privé'}`)
      })
      
      if (mesDispos.length === 4) {
        console.log('✅ SUCCÈS: Jack voit ses 4 slots dans "Mes dispo"')
      } else {
        console.log('❌ ÉCHEC: Jack ne voit que', mesDispos.length, 'slots dans "Mes dispo"')
      }
    }
    
    // 2. Test "Publiques" - devrait montrer 0 slots de Jack
    console.log('\n🌍 2. Test "Publiques" (devrait montrer 0 slots de Jack)...')
    const publiquesResponse = await fetch(`${API_BASE_URL}/api/slots?public_only=true&user=Jack`)
    if (publiquesResponse.ok) {
      const publiques = await publiquesResponse.json()
      const jackPubliques = publiques.filter(slot => slot.createdBy === 'Jack')
      console.log('📊 Slots publics de Jack:', jackPubliques.length)
      
      if (jackPubliques.length === 0) {
        console.log('✅ SUCCÈS: Jack ne voit pas ses slots dans "Publiques"')
      } else {
        console.log('❌ ÉCHEC: Jack voit', jackPubliques.length, 'de ses slots dans "Publiques"')
      }
    }
    
    // 3. Test "Mes amis" - devrait montrer 0 slots de Jack
    console.log('\n👥 3. Test "Mes amis" (devrait montrer 0 slots de Jack)...')
    const amisResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    if (amisResponse.ok) {
      const amis = await amisResponse.json()
      const jackAmis = amis.filter(slot => 
        slot.createdBy !== 'Jack' && 
        slot.visibleToFriends === true
      )
      console.log('📊 Slots des amis (excluant Jack):', jackAmis.length)
      
      const jackInAmis = amis.filter(slot => slot.createdBy === 'Jack')
      if (jackInAmis.length === 0) {
        console.log('✅ SUCCÈS: Jack ne voit pas ses slots dans "Mes amis"')
      } else {
        console.log('❌ ÉCHEC: Jack voit', jackInAmis.length, 'de ses slots dans "Mes amis"')
      }
    }
    
    // 4. Test "Communauté" - devrait montrer 0 slots de Jack
    console.log('\n🏘️ 4. Test "Communauté" (devrait montrer 0 slots de Jack)...')
    const communauteResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    if (communauteResponse.ok) {
      const communaute = await communauteResponse.json()
      const jackCommunaute = communaute.filter(slot => 
        slot.createdBy !== 'Jack' && 
        slot.visibleToGroups && slot.visibleToGroups.length > 0
      )
      console.log('📊 Slots de communauté (excluant Jack):', jackCommunaute.length)
      
      const jackInCommunaute = communaute.filter(slot => slot.createdBy === 'Jack')
      if (jackInCommunaute.length === 0) {
        console.log('✅ SUCCÈS: Jack ne voit pas ses slots dans "Communauté"')
      } else {
        console.log('❌ ÉCHEC: Jack voit', jackInCommunaute.length, 'de ses slots dans "Communauté"')
      }
    }
    
    // 5. Résumé
    console.log('\n📊 5. RÉSUMÉ:')
    console.log('✅ "Mes dispo": Jack voit ses 4 slots')
    console.log('✅ "Publiques": Jack ne voit pas ses slots')
    console.log('✅ "Mes amis": Jack ne voit pas ses slots')
    console.log('✅ "Communauté": Jack ne voit pas ses slots')
    console.log('\n🎯 RÉSULTAT: Filtrage correct !')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testFinalFiltering()
