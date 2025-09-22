// Test de la logique backend directement
function testBackendLogic() {
  console.log('🧪 Test de la logique backend...')
  
  // Simuler les données
  const slots = [
    {
      id: '1',
      createdBy: 'Jack',
      visibleToAll: true,
      customActivity: 'Test public'
    },
    {
      id: '2', 
      createdBy: 'Cynthia',
      visibleToAll: true,
      customActivity: 'Test public Cynthia'
    },
    {
      id: '3',
      createdBy: 'Jack',
      visibleToAll: false,
      visibleToFriends: true,
      customActivity: 'Test amis'
    }
  ]
  
  const user = 'Jack'
  
  // Test de la logique public_only
  console.log('\n📊 Test logique public_only:')
  const publicSlots = slots.filter(slot => 
    slot.visibleToAll === true && 
    slot.createdBy !== user
  )
  
  console.log('Slots publics (devrait exclure Jack):', publicSlots.length)
  publicSlots.forEach(slot => {
    console.log(`  - ${slot.id}: ${slot.customActivity} - créé par: ${slot.createdBy}`)
  })
  
  // Test de la logique amis
  console.log('\n👥 Test logique amis:')
  const amisSlots = slots.filter(slot => 
    slot.createdBy !== user && 
    slot.visibleToFriends === true
  )
  
  console.log('Slots des amis (devrait exclure Jack):', amisSlots.length)
  amisSlots.forEach(slot => {
    console.log(`  - ${slot.id}: ${slot.customActivity} - créé par: ${slot.createdBy}`)
  })
}

testBackendLogic()
