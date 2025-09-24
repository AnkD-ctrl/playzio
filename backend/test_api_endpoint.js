import express from 'express'
import cors from 'cors'
import { 
  getAllSlots, 
  getGroupsByUser 
} from './database.js'

// Créer une instance Express pour tester
const app = express()
app.use(cors())
app.use(express.json())

// Simuler la route /api/slots exactement comme dans server.js
app.get('/api/slots', async (req, res) => {
  try {
    const { type, user } = req.query
    console.log(`🔍 Requête reçue: type=${type}, user=${user}`)
    
    // Récupérer tous les slots
    let filteredSlots = await getAllSlots()
    console.log(`📊 Slots récupérés de la DB: ${filteredSlots.length}`)
    
    // Filtrer les disponibilités passées (amélioration UX + optimisation base)
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    const beforeFilter = filteredSlots.length
    filteredSlots = filteredSlots.filter(slot => {
      if (slot.date < today) {
        return false
      }
      if (slot.date === today && slot.heureFin) {
        const currentTime = now.toTimeString().split(' ')[0]
        const slotEndTime = slot.heureFin + ':00'
        if (slotEndTime < currentTime) {
          return false
        }
      }
      return true
    })
    console.log(`🗓️ Après filtrage des dates passées: ${beforeFilter} → ${filteredSlots.length}`)
    
    // Filtrer par type d'activité
    if (type) {
      const beforeTypeFilter = filteredSlots.length
      filteredSlots = filteredSlots.filter(slot => {
        if (!slot.type) return false
        
        if (Array.isArray(slot.type)) {
          return slot.type.some(activity => 
            activity && activity.toLowerCase() === type.toLowerCase()
          )
        }
        
        return slot.type && slot.type.toLowerCase() === type.toLowerCase()
      })
      console.log(`🎯 Après filtrage par type '${type}': ${beforeTypeFilter} → ${filteredSlots.length}`)
    }
    
    // Filtrer par visibilité si un utilisateur est spécifié
    if (user) {
      console.log(`👤 Filtrage pour l'utilisateur: ${user}`)
      
      // Récupérer les groupes de l'utilisateur
      const userGroups = await getGroupsByUser(user)
      const userGroupIds = userGroups.map(group => group.id)
      console.log(`👥 Groupes de l'utilisateur ${user}: ${userGroups.length} groupes (IDs: ${userGroupIds.join(', ')})`)
      
      const beforeVisibilityFilter = filteredSlots.length
      
      // Filtrer les slots visibles pour cet utilisateur
      filteredSlots = filteredSlots.filter(slot => {
        console.log(`🔍 Vérification du slot ${slot.id}:`)
        console.log(`   - visibleToAll: ${slot.visibleToAll}`)
        console.log(`   - visibleToGroups: ${JSON.stringify(slot.visibleToGroups)}`)
        console.log(`   - visibleToFriends: ${slot.visibleToFriends}`)
        
        // Si le slot est public (visibleToAll = true), il est visible par tous
        if (slot.visibleToAll === true) {
          console.log(`   ✅ Slot public - visible par tous`)
          return true
        }
        
        // Si le slot n'a pas de groupes spécifiés ET pas de visibilité définie, il est public (rétrocompatibilité)
        if ((!slot.visibleToGroups || slot.visibleToGroups.length === 0) && slot.visibleToAll !== false) {
          console.log(`   ✅ Slot sans groupes - visible par tous (rétrocompatibilité)`)
          return true
        }
        
        // Vérifier si l'utilisateur est dans au moins un des groupes visibles
        const isInGroup = slot.visibleToGroups && slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId))
        console.log(`   ${isInGroup ? '✅' : '❌'} Dans un groupe visible: ${isInGroup}`)
        
        return isInGroup
      })
      
      console.log(`👁️ Après filtrage de visibilité: ${beforeVisibilityFilter} → ${filteredSlots.length}`)
    }
    
    console.log(`📤 Envoi de ${filteredSlots.length} slots au frontend`)
    res.json(filteredSlots)
  } catch (error) {
    console.error('❌ Erreur dans /api/slots:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Démarrer le serveur de test
const PORT = 3001
app.listen(PORT, () => {
  console.log(`🧪 Serveur de test démarré sur le port ${PORT}`)
  console.log(`🔗 Testez avec: curl "http://localhost:${PORT}/api/slots?user=Jack"`)
  console.log(`🔗 Ou avec type: curl "http://localhost:${PORT}/api/slots?user=Jack&type=tennis"`)
})
