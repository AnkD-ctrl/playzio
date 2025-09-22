const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testAllJackSlots() {
  try {
    console.log('🧪 Test de tous les slots de Jack...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // 1. Récupérer tous les slots sans filtre
    console.log('\n📊 1. Récupération de TOUS les slots (sans filtre)...')
    const allSlotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
    
    if (!allSlotsResponse.ok) {
      console.log('❌ Erreur lors de la récupération des slots:', allSlotsResponse.status)
      return
    }
    
    const allSlots = await allSlotsResponse.json()
    console.log('📋 Tous les slots récupérés (sans filtre):', allSlots.length)
    
    // 2. Filtrer les slots de Jack
    const jackSlots = allSlots.filter(slot => slot.createdBy === 'Jack')
    console.log('📊 Slots de Jack (sans filtre):', jackSlots.length)
    
    // 3. Filtrer les slots de Jack pour le 30/10/2025
    const jackSlots30Oct = jackSlots.filter(slot => slot.date === '2025-10-30')
    console.log('📊 Slots de Jack pour le 30/10/2025 (sans filtre):', jackSlots30Oct.length)
    
    // 4. Afficher tous les slots de Jack
    console.log('\n📋 4. TOUS les slots de Jack:')
    jackSlots.forEach((slot, index) => {
      console.log(`\n--- Slot ${index + 1} ---`)
      console.log(`ID: ${slot.id}`)
      console.log(`Date: ${slot.date}`)
      console.log(`Heure: ${slot.heureDebut} - ${slot.heureFin}`)
      console.log(`Description: ${slot.description || 'Aucune'}`)
      console.log(`Visible à tous: ${slot.visibleToAll}`)
      console.log(`Visible aux amis: ${slot.visibleToFriends}`)
      console.log(`Visible aux groupes: ${JSON.stringify(slot.visibleToGroups)}`)
    })
    
    // 5. Tester avec l'API avec filtre utilisateur
    console.log('\n📊 5. Test avec API avec filtre utilisateur...')
    const userSlotsResponse = await fetch(`${API_BASE_URL}/api/slots?user=Jack`)
    
    if (userSlotsResponse.ok) {
      const userSlots = await userSlotsResponse.json()
      console.log('📋 Slots récupérés avec ?user=Jack:', userSlots.length)
      
      const userJackSlots = userSlots.filter(slot => slot.createdBy === 'Jack')
      console.log('📊 Slots de Jack avec ?user=Jack:', userJackSlots.length)
      
      const userJackSlots30Oct = userJackSlots.filter(slot => slot.date === '2025-10-30')
      console.log('📊 Slots de Jack pour le 30/10/2025 avec ?user=Jack:', userJackSlots30Oct.length)
    }
    
    // 6. Vérifier les slots passés
    console.log('\n📊 6. Vérification des slots passés...')
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    console.log('📅 Date d\'aujourd\'hui:', today)
    
    const futureSlots = jackSlots.filter(slot => slot.date >= today)
    console.log('📊 Slots de Jack futurs (>= aujourd\'hui):', futureSlots.length)
    
    const pastSlots = jackSlots.filter(slot => slot.date < today)
    console.log('📊 Slots de Jack passés (< aujourd\'hui):', pastSlots.length)
    
    // 7. Vérifier la fonction isSlotStillValid
    console.log('\n📊 7. Test de la fonction isSlotStillValid...')
    const validSlots = jackSlots.filter(slot => {
      // Simuler la fonction isSlotStillValid
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      if (slot.date < today) return false
      
      if (slot.date === today && slot.heureFin) {
        const currentTime = now.toTimeString().split(' ')[0]
        const slotEndTime = slot.heureFin + ':00'
        if (slotEndTime < currentTime) return false
      }
      
      return true
    })
    
    console.log('📊 Slots de Jack valides (isSlotStillValid):', validSlots.length)
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

testAllJackSlots()
