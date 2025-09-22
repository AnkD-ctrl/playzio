const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function debugSlotFiltering() {
  try {
    console.log('🔍 Debug du filtrage des slots...')
    
    // 1. Récupérer tous les slots
    console.log('\n📊 1. Récupération de tous les slots...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
    const allSlots = await allSlotsResponse.json()
    console.log('Total slots:', allSlots.length)
    
    // 2. Analyser les slots de Jack
    const jackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
    console.log('Slots de Jack:', jackSlots.length)
    
    jackSlots.forEach((slot, index) => {
      console.log(`\n--- SLOT ${index + 1} ---`)
      console.log(`ID: ${slot.id}`)
      console.log(`Description: ${slot.description}`)
      console.log(`CreatedBy: ${slot.createdBy}`)
      console.log(`VisibleToAll: ${slot.visibleToAll}`)
      console.log(`VisibleToFriends: ${slot.visibleToFriends}`)
      console.log(`VisibleToGroups: ${JSON.stringify(slot.visibleToGroups)}`)
    })
    
    // 3. Tester la logique de filtrage manuellement
    console.log('\n🧪 3. Test de la logique de filtrage...')
    
    // Test "Mes dispo" - my_slots_only
    console.log('\n📋 Test "Mes dispo" (my_slots_only=true)...')
    const mesDisposResponse = await fetch(`${API_BASE_URL}/api/slots?my_slots_only=true&user=Jack`)
    const mesDispos = await mesDisposResponse.json()
    console.log('API retourne:', mesDispos.length, 'slots')
    mesDispos.forEach(slot => {
      console.log(`  - ${slot.id}: ${slot.description} (${slot.createdBy})`)
    })
    
    // Test "Publiques" - public_only
    console.log('\n🌍 Test "Publiques" (public_only=true)...')
    const publiquesResponse = await fetch(`${API_BASE_URL}/api/slots?public_only=true&user=Jack`)
    const publiques = await publiquesResponse.json()
    console.log('API retourne:', publiques.length, 'slots')
    publiques.forEach(slot => {
      console.log(`  - ${slot.id}: ${slot.description} (${slot.createdBy})`)
    })
    
    // 4. Vérifier si le problème vient de la base de données
    console.log('\n🔍 4. Vérification de la base de données...')
    
    // Vérifier si tous les slots de Jack sont bien dans la base
    const jackSlotsInDB = allSlots.filter(slot => slot.createdBy === 'Jack')
    console.log('Slots de Jack dans la DB:', jackSlotsInDB.length)
    
    // Vérifier si le problème vient du filtrage par date
    const today = new Date().toISOString().split('T')[0]
    const jackSlotsToday = jackSlotsInDB.filter(slot => slot.date === '2025-10-30')
    console.log('Slots de Jack pour le 30/10/2025:', jackSlotsToday.length)
    
    // 5. Tester avec une date spécifique
    console.log('\n📅 5. Test avec date spécifique...')
    const mesDisposDateResponse = await fetch(`${API_BASE_URL}/api/slots?my_slots_only=true&user=Jack&date=2025-10-30`)
    const mesDisposDate = await mesDisposDateResponse.json()
    console.log('API avec date 30/10/2025:', mesDisposDate.length, 'slots')
    
    // 6. Vérifier la fonction isSlotStillValid
    console.log('\n⏰ 6. Vérification de isSlotStillValid...')
    const now = new Date()
    jackSlotsInDB.forEach(slot => {
      const slotDate = new Date(slot.date + 'T' + slot.heureDebut)
      const isValid = slotDate > now
      console.log(`Slot ${slot.id}: ${slot.date} ${slot.heureDebut} - Valide: ${isValid}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

debugSlotFiltering()
