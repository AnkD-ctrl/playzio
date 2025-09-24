import { pool } from './database.js'
import { fileURLToPath } from 'url'

async function addVisibilityColumns() {
  try {
    // Ajouter la colonne visible_to_all si elle n'existe pas
    await pool.query(`
      ALTER TABLE slots
      ADD COLUMN IF NOT EXISTS visible_to_all BOOLEAN DEFAULT TRUE;
    `)
    console.log('✅ Colonne visible_to_all ajoutée à la table slots.')
    
    // Ajouter la colonne visible_to_friends si elle n'existe pas
    await pool.query(`
      ALTER TABLE slots
      ADD COLUMN IF NOT EXISTS visible_to_friends BOOLEAN DEFAULT FALSE;
    `)
    console.log('✅ Colonne visible_to_friends ajoutée à la table slots.')
    
    // Ajouter la colonne lieu si elle n'existe pas
    await pool.query(`
      ALTER TABLE slots
      ADD COLUMN IF NOT EXISTS lieu VARCHAR(255) DEFAULT '';
    `)
    console.log('✅ Colonne lieu ajoutée à la table slots.')
    
    // Ajouter la colonne max_participants si elle n'existe pas
    await pool.query(`
      ALTER TABLE slots
      ADD COLUMN IF NOT EXISTS max_participants INTEGER;
    `)
    console.log('✅ Colonne max_participants ajoutée à la table slots.')
    
    console.log('🎉 Migration des colonnes de visibilité terminée avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des colonnes de visibilité:', error)
    throw error
  }
}

async function main() {
  try {
    await addVisibilityColumns()
    console.log('Migration terminée.')
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    // Fermer le pool de connexions
    await pool.end()
  }
}

// Exécuter la migration si le script est appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}

export { addVisibilityColumns }
