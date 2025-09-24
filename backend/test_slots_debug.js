import { pool } from './database.js'

async function debugSlots() {
  try {
    console.log('🔍 Debug des slots - Vérification de la base de données...\n')
    
    // Tester la connexion à la base
    try {
      await pool.query('SELECT 1')
      console.log('✅ Connexion PostgreSQL réussie\n')
    } catch (connectionError) {
      console.log('❌ Connexion PostgreSQL échouée, utilisation du mode JSON\n')
      console.log('Erreur:', connectionError.message)
      
      // Tester avec le mode JSON
      console.log('🧪 Test du mode JSON...\n')
      
      const { getAllSlots, getGroupsByUser } = await import('./database.js')
      
      // Tester getAllSlots en mode JSON
      const allSlots = await getAllSlots()
      console.log(`Nombre de slots retournés par getAllSlots (JSON): ${allSlots.length}`)
      allSlots.forEach((slot, index) => {
        console.log(`Slot ${index + 1}: ${slot.id} - ${slot.date} - visibleToAll: ${slot.visibleToAll}`)
      })
      
      // Tester getGroupsByUser pour Jack
      const jackGroups = await getGroupsByUser('Jack')
      console.log(`\nGroupes de Jack (JSON): ${jackGroups.length}`)
      jackGroups.forEach(group => {
        console.log(`  - ${group.name} (ID: ${group.id})`)
      })
      
      // Tester la logique de filtrage pour Jack
      console.log('\n🔍 Test de la logique de filtrage pour Jack (JSON):')
      const jackSlots = allSlots.filter(slot => {
        // Logique du serveur
        if (slot.visibleToAll === true) {
          return true
        }
        
        if ((!slot.visibleToGroups || slot.visibleToGroups.length === 0) && slot.visibleToAll !== false) {
          return true
        }
        
        // Vérifier si Jack est dans les groupes visibles
        const jackGroupIds = jackGroups.map(group => group.id)
        return slot.visibleToGroups && slot.visibleToGroups.some(groupId => jackGroupIds.includes(groupId))
      })
      
      console.log(`Slots visibles pour Jack (JSON): ${jackSlots.length}`)
      jackSlots.forEach((slot, index) => {
        console.log(`  ${index + 1}. ${slot.id} - ${slot.date} - visibleToAll: ${slot.visibleToAll}`)
      })
      
      return
    }
    
    // 1. Vérifier la structure de la table slots
    console.log('📋 Structure de la table slots:')
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'slots'
      ORDER BY ordinal_position;
    `)
    
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`)
    })
    
    console.log('\n📊 Tous les slots dans la base:')
    const allSlotsResult = await pool.query('SELECT * FROM slots ORDER BY date, heure_debut')
    
    console.log(`Nombre total de slots: ${allSlotsResult.rows.length}\n`)
    
    allSlotsResult.rows.forEach((slot, index) => {
      console.log(`Slot ${index + 1}:`)
      console.log(`  - ID: ${slot.id}`)
      console.log(`  - Date: ${slot.date}`)
      console.log(`  - Heure: ${slot.heure_debut} - ${slot.heure_fin}`)
      console.log(`  - Type: ${slot.type}`)
      console.log(`  - Custom Activity: ${slot.custom_activity}`)
      console.log(`  - Créé par: ${slot.created_by}`)
      console.log(`  - Visible to all: ${slot.visible_to_all}`)
      console.log(`  - Visible to friends: ${slot.visible_to_friends}`)
      console.log(`  - Visible to groups: ${slot.visible_to_groups}`)
      console.log(`  - Participants: ${JSON.stringify(slot.participants)}`)
      console.log('')
    })
    
    // 2. Tester la fonction getAllSlots
    console.log('🧪 Test de la fonction getAllSlots:')
    const { getAllSlots } = await import('./database.js')
    const allSlots = await getAllSlots()
    
    console.log(`Nombre de slots retournés par getAllSlots: ${allSlots.length}`)
    allSlots.forEach((slot, index) => {
      console.log(`Slot ${index + 1}: ${slot.id} - ${slot.date} - visibleToAll: ${slot.visibleToAll}`)
    })
    
    // 3. Vérifier les groupes de l'utilisateur Jack
    console.log('\n👤 Groupes de l\'utilisateur Jack:')
    const jackGroupsResult = await pool.query(`
      SELECT * FROM groups WHERE 'Jack' = ANY(members);
    `)
    
    console.log(`Nombre de groupes pour Jack: ${jackGroupsResult.rows.length}`)
    jackGroupsResult.rows.forEach(group => {
      console.log(`  - ${group.name} (ID: ${group.id})`)
    })
    
    // 4. Tester la logique de filtrage
    console.log('\n🔍 Test de la logique de filtrage pour Jack:')
    const jackSlots = allSlots.filter(slot => {
      // Logique du serveur
      if (slot.visibleToAll === true) {
        return true
      }
      
      if ((!slot.visibleToGroups || slot.visibleToGroups.length === 0) && slot.visibleToAll !== false) {
        return true
      }
      
      // Vérifier si Jack est dans les groupes visibles
      const jackGroupIds = jackGroupsResult.rows.map(group => group.id)
      return slot.visibleToGroups && slot.visibleToGroups.some(groupId => jackGroupIds.includes(groupId))
    })
    
    console.log(`Slots visibles pour Jack: ${jackSlots.length}`)
    jackSlots.forEach((slot, index) => {
      console.log(`  ${index + 1}. ${slot.id} - ${slot.date} - visibleToAll: ${slot.visibleToAll}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error)
  } finally {
    await pool.end()
  }
}

debugSlots()
