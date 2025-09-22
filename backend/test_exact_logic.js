// Test de la logique exacte du filtrage
const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testExactLogic() {
  try {
    console.log('🔍 Test de la logique exacte du filtrage...')
    
    // 1. Récupérer tous les slots
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
    const allSlots = await allSlotsResponse.json()
    console.log('📊 Total slots dans la base:', allSlots.length)
    
    // 2. Appliquer la logique isSlotStillValid manuellement
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    const validSlots = allSlots.filter(slot => {
      // Si la date est dans le passé, la disponibilité n'est plus valide
      if (slot.date < today) {
        return false
      }
      
      // Si c'est aujourd'hui, vérifier l'heure de fin
      if (slot.date === today && slot.heureFin) {
        const currentTime = now.toTimeString().split(' ')[0]
        const slotEndTime = slot.heureFin + ':00'
        
        if (slotEndTime < currentTime) {
          return false
        }
      }
      
      return true
    })
    
    console.log('📊 Slots valides après isSlotStillValid:', validSlots.length)
    
    // 3. Appliquer la logique my_slots_only
    const jackSlots = validSlots.filter(slot => slot.createdBy === 'Jack')
    console.log('📊 Slots de Jack après filtrage:', jackSlots.length)
    
    jackSlots.forEach((slot, index) => {
      console.log(`\n--- SLOT ${index + 1} ---`)
      console.log(`ID: ${slot.id}`)
      console.log(`Description: ${slot.description}`)
      console.log(`Date: ${slot.date}`)
      console.log(`Heure: ${slot.heureDebut} - ${slot.heureFin}`)
      console.log(`CreatedBy: ${slot.createdBy}`)
    })
    
    // 4. Tester l'API my_slots_only
    console.log('\n🧪 Test API my_slots_only...')
    const mesDisposResponse = await fetch(`${API_BASE_URL}/api/slots?my_slots_only=true&user=Jack`)
    const mesDispos = await mesDisposResponse.json()
    console.log('📊 API retourne:', mesDispos.length, 'slots')
    
    mesDispos.forEach((slot, index) => {
      console.log(`\n--- API SLOT ${index + 1} ---`)
      console.log(`ID: ${slot.id}`)
      console.log(`Description: ${slot.description}`)
      console.log(`Date: ${slot.date}`)
      console.log(`Heure: ${slot.heureDebut} - ${slot.heureFin}`)
      console.log(`CreatedBy: ${slot.createdBy}`)
    })
    
    // 5. Comparer les résultats
    console.log('\n🔍 Comparaison des résultats...')
    console.log('Logique manuelle:', jackSlots.length, 'slots')
    console.log('API my_slots_only:', mesDispos.length, 'slots')
    
    if (jackSlots.length !== mesDispos.length) {
      console.log('❌ DIFFÉRENCE DÉTECTÉE !')
      
      // Trouver les slots manquants
      const missingSlots = jackSlots.filter(slot => 
        !mesDispos.some(apiSlot => apiSlot.id === slot.id)
      )
      
      console.log('Slots manquants dans l\'API:')
      missingSlots.forEach(slot => {
        console.log(`  - ${slot.id}: ${slot.description}`)
      })
    } else {
      console.log('✅ Les résultats correspondent')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

testExactLogic()
