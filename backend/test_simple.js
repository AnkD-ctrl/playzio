import { getAllSlots, getGroupsByUser } from './database.js'

async function testSimple() {
  try {
    console.log('🧪 Test simple de la logique de filtrage...\n')
    
    // 1. Récupérer tous les slots
    console.log('1. Récupération de tous les slots...')
    const allSlots = await getAllSlots()
    console.log(`   ${allSlots.length} slots récupérés`)
    
    if (allSlots.length === 0) {
      console.log('❌ Aucun slot trouvé !')
      return
    }
    
    // Afficher les 3 premiers slots
    allSlots.slice(0, 3).forEach((slot, index) => {
      console.log(`   Slot ${index + 1}: ${slot.id} - ${slot.date} - visibleToAll: ${slot.visibleToAll}`)
    })
    
    // 2. Filtrer les slots passés
    console.log('\n2. Filtrage des slots passés...')
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    console.log(`   Date d'aujourd'hui: ${today}`)
    
    const beforeDateFilter = allSlots.length
    const validSlots = allSlots.filter(slot => {
      if (slot.date < today) {
        console.log(`   ❌ Slot ${slot.id} passé: ${slot.date}`)
        return false
      }
      if (slot.date === today && slot.heureFin) {
        const currentTime = now.toTimeString().split(' ')[0]
        const slotEndTime = slot.heureFin + ':00'
        if (slotEndTime < currentTime) {
          console.log(`   ❌ Slot ${slot.id} fini aujourd'hui: ${slotEndTime} < ${currentTime}`)
          return false
        }
      }
      return true
    })
    
    console.log(`   ${beforeDateFilter} → ${validSlots.length} slots après filtrage des dates`)
    
    // 3. Tester la logique de visibilité pour Jack
    console.log('\n3. Test de la logique de visibilité pour Jack...')
    const user = 'Jack'
    
    const userGroups = await getGroupsByUser(user)
    console.log(`   Groupes de ${user}: ${userGroups.length}`)
    userGroups.forEach(group => {
      console.log(`     - ${group.name} (ID: ${group.id})`)
    })
    
    const userGroupIds = userGroups.map(group => group.id)
    console.log(`   IDs des groupes: [${userGroupIds.join(', ')}]`)
    
    // 4. Appliquer la logique de visibilité
    console.log('\n4. Application de la logique de visibilité...')
    const visibleSlots = validSlots.filter(slot => {
      console.log(`\n   🔍 Slot ${slot.id}:`)
      console.log(`      - visibleToAll: ${slot.visibleToAll} (type: ${typeof slot.visibleToAll})`)
      console.log(`      - visibleToGroups: ${JSON.stringify(slot.visibleToGroups)}`)
      console.log(`      - visibleToFriends: ${slot.visibleToFriends}`)
      
      // Si le slot est public (visibleToAll = true), il est visible par tous
      if (slot.visibleToAll === true) {
        console.log(`      ✅ PUBLIC - visible par tous`)
        return true
      }
      
      // Si le slot n'a pas de groupes spécifiés ET pas de visibilité définie, il est public (rétrocompatibilité)
      if ((!slot.visibleToGroups || slot.visibleToGroups.length === 0) && slot.visibleToAll !== false) {
        console.log(`      ✅ RÉTROCOMPATIBILITÉ - visible par tous`)
        return true
      }
      
      // Vérifier si l'utilisateur est dans au moins un des groupes visibles
      const isInGroup = slot.visibleToGroups && slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId))
      console.log(`      ${isInGroup ? '✅' : '❌'} DANS GROUPE: ${isInGroup}`)
      
      return isInGroup
    })
    
    console.log(`\n📊 Résultat final: ${visibleSlots.length} slots visibles pour ${user}`)
    visibleSlots.forEach((slot, index) => {
      console.log(`   ${index + 1}. ${slot.id} - ${slot.date} - ${slot.type}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testSimple()
