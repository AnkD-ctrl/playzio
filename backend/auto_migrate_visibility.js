import { pool } from './database.js'

export async function ensureVisibilityColumns() {
  try {
    const client = await pool.connect()
    try {
      // Vérifier si les colonnes existent déjà
      const checkColumnsQuery = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'slots' 
        AND column_name IN ('visible_to_all', 'visible_to_friends', 'lieu', 'max_participants');
      `
      const result = await client.query(checkColumnsQuery)
      const existingColumns = result.rows.map(row => row.column_name)
      
      // Ajouter les colonnes manquantes
      const columnsToAdd = [
        { name: 'visible_to_all', definition: 'BOOLEAN DEFAULT TRUE' },
        { name: 'visible_to_friends', definition: 'BOOLEAN DEFAULT FALSE' },
        { name: 'lieu', definition: "VARCHAR(255) DEFAULT ''" },
        { name: 'max_participants', definition: 'INTEGER' }
      ]
      
      for (const column of columnsToAdd) {
        if (!existingColumns.includes(column.name)) {
          await client.query(`
            ALTER TABLE slots
            ADD COLUMN ${column.name} ${column.definition};
          `)
          console.log(`✅ Colonne ${column.name} ajoutée à la table slots.`)
        }
      }
      
      console.log('Colonnes de visibilité vérifiées/ajoutées avec succès.')
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification/ajout des colonnes de visibilité:', error)
    // Ne pas rejeter l'erreur pour ne pas bloquer le démarrage du serveur
  }
}
