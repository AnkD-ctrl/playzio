// Script pour mettre à jour les notifications email d'un slot via l'API de production

const API_BASE_URL = 'https://playzio-production.up.railway.app'

async function updateSlotEmailNotifications(slotId) {
  try {
    console.log(`🔧 Mise à jour du slot ${slotId} pour activer les notifications email...`)
    
    // D'abord, récupérer les détails du slot
    const getResponse = await fetch(`${API_BASE_URL}/api/slots`)
    const slots = await getResponse.json()
    const slot = slots.find(s => s.id === slotId)
    
    if (!slot) {
      console.error(`❌ Slot ${slotId} non trouvé`)
      return
    }
    
    console.log('📊 Slot trouvé:', {
      id: slot.id,
      createdBy: slot.createdBy,
      emailNotifications: slot.emailNotifications,
      customActivity: slot.customActivity
    })
    
    // Pour l'instant, nous ne pouvons pas mettre à jour directement via l'API
    // Mais nous pouvons au moins identifier le problème
    console.log('🔍 Problème identifié:')
    console.log(`  - emailNotifications: ${slot.emailNotifications}`)
    console.log(`  - Type: ${typeof slot.emailNotifications}`)
    console.log(`  - Condition emailNotifications === true: ${slot.emailNotifications === true}`)
    
    if (slot.emailNotifications === null) {
      console.log('✅ Solution: Le slot a emailNotifications = null, il faut le mettre à true')
      console.log('📝 Action requise: Mettre à jour la base de données directement')
    } else if (slot.emailNotifications === false) {
      console.log('ℹ️ Le slot a emailNotifications = false (désactivé)')
    } else if (slot.emailNotifications === true) {
      console.log('✅ Le slot a déjà emailNotifications = true')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

async function main() {
  // Mettre à jour le slot "Apero" de Jack
  await updateSlotEmailNotifications('J26gMZLW39k3rtCh3Yfi6')
}

main()
