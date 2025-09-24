import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function updateSlotDates() {
  try {
    console.log('📅 Mise à jour des dates des slots...')
    
    // Lire le fichier JSON
    const dbPath = path.join(__dirname, 'db.json')
    const data = fs.readFileSync(dbPath, 'utf8')
    const db = JSON.parse(data)
    
    console.log(`📊 ${db.slots.length} slots trouvés`)
    
    // Calculer des dates futures (à partir d'aujourd'hui + 1 jour)
    const today = new Date()
    const futureDates = []
    
    for (let i = 1; i <= db.slots.length; i++) {
      const futureDate = new Date(today)
      futureDate.setDate(today.getDate() + i)
      futureDates.push(futureDate.toISOString().split('T')[0])
    }
    
    // Mettre à jour les dates des slots
    db.slots.forEach((slot, index) => {
      const oldDate = slot.date
      slot.date = futureDates[index]
      console.log(`   Slot ${slot.id}: ${oldDate} → ${slot.date}`)
    })
    
    // Sauvegarder le fichier
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    console.log('✅ Fichier db.json mis à jour avec des dates futures')
    
    // Afficher quelques exemples
    console.log('\n📋 Premiers slots mis à jour:')
    db.slots.slice(0, 5).forEach(slot => {
      console.log(`   ${slot.id}: ${slot.date} - ${slot.type}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des dates:', error)
  }
}

updateSlotDates()
