const API_BASE_URL = 'https://playzio-production.up.railway.app'

async function testUserFiltering() {
  try {
    console.log('🔍 Test du filtrage par utilisateur...')
    
    // Test avec Jack
    console.log('\n👤 Test avec Jack:')
    const jackResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    const jackSlots = jackResponse.ok ? await jackResponse.json() : []
    console.log(`Slots pour Jack: ${jackSlots.length}`)
    jackSlots.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Test avec U
    console.log('\n👤 Test avec U:')
    const uResponse = await fetch(`${API_BASE_URL}/api/slots?user=U`)
    const uSlots = uResponse.ok ? await uResponse.json() : []
    console.log(`Slots pour U: ${uSlots.length}`)
    uSlots.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Test avec Test2
    console.log('\n👤 Test avec Test2:')
    const test2Response = await fetch(`${API_BASE_URL}/api/slots?user=Test2`)
    const test2Slots = test2Response.ok ? await test2Response.json() : []
    console.log(`Slots pour Test2: ${test2Slots.length}`)
    test2Slots.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Test avec un utilisateur inexistant
    console.log('\n👤 Test avec utilisateur inexistant:')
    const unknownResponse = await fetch(`${API_BASE_URL}/api/slots?user=UnknownUser`)
    const unknownSlots = unknownResponse.ok ? await unknownResponse.json() : []
    console.log(`Slots pour UnknownUser: ${unknownSlots.length}`)
    unknownSlots.forEach(slot => console.log(`  - ${slot.description} (${slot.createdBy})`))
    
    // Vérifier les slots de Jack dans les résultats
    console.log('\n🔍 Vérification des slots de Jack:')
    const jackSlotsInU = uSlots.filter(slot => slot.createdBy === 'Jack')
    const jackSlotsInTest2 = test2Slots.filter(slot => slot.createdBy === 'Jack')
    const jackSlotsInUnknown = unknownSlots.filter(slot => slot.createdBy === 'Jack')
    
    console.log(`Slots de Jack dans les résultats de U: ${jackSlotsInU.length}`)
    console.log(`Slots de Jack dans les résultats de Test2: ${jackSlotsInTest2.length}`)
    console.log(`Slots de Jack dans les résultats de UnknownUser: ${jackSlotsInUnknown.length}`)
    
    if (jackSlotsInU.length > 0 || jackSlotsInTest2.length > 0 || jackSlotsInUnknown.length > 0) {
      console.log('❌ PROBLÈME: Les slots de Jack apparaissent pour d\'autres utilisateurs!')
    } else {
      console.log('✅ OK: Les slots de Jack n\'apparaissent que pour Jack')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

testUserFiltering()
