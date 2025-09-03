import pkg from 'pg'
import { fileURLToPath } from 'url'
import path from 'path'

const { Pool } = pkg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

// Fonction pour vérifier si une disponibilité est encore valide
function isSlotStillValid(slot) {
  const now = new Date()
  const today = now.toISOString().split('T')[0] // Format YYYY-MM-DD
  
  // Si la date est dans le passé, la disponibilité n'est plus valide
  if (slot.date < today) {
    return false
  }
  
  // Si c'est aujourd'hui, vérifier l'heure de fin
  if (slot.date === today && slot.heureFin) {
    const currentTime = now.toTimeString().split(' ')[0] // Format HH:MM:SS
    const slotEndTime = slot.heureFin + ':00' // Ajouter les secondes si nécessaire
    
    // Si l'heure de fin est passée, la disponibilité n'est plus valide
    if (slotEndTime < currentTime) {
      return false
    }
  }
  
  return true
}

async function cleanupOldSlots() {
  try {
    console.log('🧹 Début du nettoyage des anciennes disponibilités...')
    
    // Récupérer tous les slots
    const result = await pool.query('SELECT * FROM slots')
    const allSlots = result.rows
    
    console.log(`📊 Total des disponibilités: ${allSlots.length}`)
    
    // Identifier les slots obsolètes
    const oldSlots = allSlots.filter(slot => !isSlotStillValid(slot))
    const validSlots = allSlots.filter(slot => isSlotStillValid(slot))
    
    console.log(`✅ Disponibilités valides: ${validSlots.length}`)
    console.log(`🗑️  Disponibilités obsolètes: ${oldSlots.length}`)
    
    if (oldSlots.length === 0) {
      console.log('✨ Aucune disponibilité obsolète à supprimer')
      return
    }
    
    // Supprimer les anciennes disponibilités
    let deletedCount = 0
    for (const slot of oldSlots) {
      try {
        // Supprimer d'abord les messages associés
        await pool.query('DELETE FROM messages WHERE slot_id = $1', [slot.id])
        
        // Puis supprimer le slot
        await pool.query('DELETE FROM slots WHERE id = $1', [slot.id])
        
        deletedCount++
        console.log(`🗑️  Supprimé: ${slot.date} ${slot.heure_debut}-${slot.heure_fin} (${slot.type})`)
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression du slot ${slot.id}:`, error.message)
      }
    }
    
    console.log(`🎉 Nettoyage terminé: ${deletedCount} disponibilités supprimées`)
    console.log(`📈 Espace libéré dans la base de données`)
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    throw error
  } finally {
    await pool.end()
  }
}

// Exécuter le nettoyage si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupOldSlots()
    .then(() => {
      console.log('✅ Script de nettoyage terminé avec succès!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Script de nettoyage échoué:', error)
      process.exit(1)
    })
}

export { cleanupOldSlots }
