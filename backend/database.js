import pkg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Pool } = pkg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

// Initialiser la base de données avec le schéma
export async function initDatabase() {
  try {
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
    await pool.query(schemaSQL)
    console.log('✅ Database schema initialized')
    
    // Créer la table contact_messages si elle n'existe pas
    await createContactMessagesTable()
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Créer la table contact_messages
async function createContactMessagesTable() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        from_user VARCHAR(255) NOT NULL,
        from_email VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        admin_response TEXT,
        admin_response_at TIMESTAMP
      );
    `
    
    await pool.query(createTableQuery)
    console.log('✅ Table contact_messages created or already exists')
    
    // Créer des index pour améliorer les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at 
      ON contact_messages(created_at DESC);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read 
      ON contact_messages(is_read);
    `)
    
    console.log('✅ Contact messages indexes created')
  } catch (error) {
    console.error('❌ Error creating contact_messages table:', error)
    // Ne pas faire échouer l'initialisation si la table existe déjà
  }
}

// Users
export async function getAllUsers() {
  const result = await pool.query('SELECT prenom, role, is_founder FROM users ORDER BY prenom')
  return result.rows
}

export async function getUserByPrenom(prenom) {
  try {
    console.log('Recherche utilisateur:', prenom)
    const result = await pool.query('SELECT * FROM users WHERE prenom = $1', [prenom])
    console.log('Résultat requête utilisateur:', result.rows.length, 'lignes')
    return result.rows[0]
  } catch (error) {
    console.error('Erreur lors de la recherche utilisateur:', error.message)
    throw error
  }
}

export async function createUser(userData) {
  const { prenom, password, email = null, role = 'user', isFounder = false } = userData
  
  const result = await pool.query(
    'INSERT INTO users (prenom, password, email, role, is_founder) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [prenom, password, email, role, isFounder]
  )
  return result.rows[0]
}

// Slots
export async function getAllSlots(filters = {}) {
  let query = 'SELECT * FROM slots'
  const conditions = []
  const values = []
  
  if (filters.type) {
    conditions.push(`(type::jsonb ? $${values.length + 1} OR type = $${values.length + 1})`)
    values.push(filters.type)
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ')
  }
  
  query += ' ORDER BY date, heure_debut'
  
  const result = await pool.query(query, values)
  return result.rows.map(row => ({
    id: row.id,
    date: row.date,
    heureDebut: row.heure_debut,
    heureFin: row.heure_fin,
    type: typeof row.type === 'string' ? (row.type.startsWith('[') ? JSON.parse(row.type) : row.type) : row.type,
    customActivity: row.custom_activity,
    description: row.description,
    createdBy: row.created_by,
    visibleToGroups: row.visible_to_groups,
    visibleToAll: row.visible_to_all,
    participants: row.participants
  }))
}

export async function getSlotById(id) {
  const result = await pool.query('SELECT * FROM slots WHERE id = $1', [id])
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    date: row.date,
    heureDebut: row.heure_debut,
    heureFin: row.heure_fin,
    type: typeof row.type === 'string' ? (row.type.startsWith('[') ? JSON.parse(row.type) : row.type) : row.type,
    customActivity: row.custom_activity,
    description: row.description,
    createdBy: row.created_by,
    visibleToGroups: row.visible_to_groups,
    visibleToAll: row.visible_to_all,
    participants: row.participants
  }
}

export async function createSlot(slotData) {
  const { id, date, heureDebut, heureFin, type, customActivity = null, description = '', createdBy = null, visibleToGroups = [], visibleToAll = true, participants = [] } = slotData
  
  const typeValue = Array.isArray(type) ? JSON.stringify(type) : type
  
  const result = await pool.query(
    'INSERT INTO slots (id, date, heure_debut, heure_fin, type, custom_activity, description, created_by, visible_to_groups, visible_to_all, participants) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    [id, date, heureDebut, heureFin, typeValue, customActivity, description, createdBy, visibleToGroups, visibleToAll, participants]
  )
  
  const row = result.rows[0]
  return {
    id: row.id,
    date: row.date,
    heureDebut: row.heure_debut,
    heureFin: row.heure_fin,
    type: typeof row.type === 'string' ? (row.type.startsWith('[') ? JSON.parse(row.type) : row.type) : row.type,
    customActivity: row.custom_activity,
    description: row.description,
    createdBy: row.created_by,
    visibleToGroups: row.visible_to_groups,
    visibleToAll: row.visible_to_all,
    participants: row.participants
  }
}

export async function updateSlotParticipants(id, participants) {
  const result = await pool.query(
    'UPDATE slots SET participants = $1 WHERE id = $2 RETURNING *',
    [participants, id]
  )
  
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    date: row.date,
    heureDebut: row.heure_debut,
    heureFin: row.heure_fin,
    type: typeof row.type === 'string' ? (row.type.startsWith('[') ? JSON.parse(row.type) : row.type) : row.type,
    description: row.description,
    createdBy: row.created_by,
    visibleToGroups: row.visible_to_groups,
    participants: row.participants
  }
}

export async function deleteSlot(id) {
  const result = await pool.query('DELETE FROM slots WHERE id = $1 RETURNING id', [id])
  return result.rows.length > 0
}

// Fonction pour rechercher les activités personnalisées
export async function searchCustomActivities(searchTerm) {
  const result = await pool.query(
    'SELECT DISTINCT custom_activity FROM slots WHERE custom_activity ILIKE $1 AND custom_activity IS NOT NULL ORDER BY custom_activity',
    [`%${searchTerm}%`]
  )
  return result.rows.map(row => row.custom_activity)
}

// Groups
export async function getAllGroups() {
  const result = await pool.query('SELECT * FROM groups ORDER BY name')
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    creator: row.creator,
    members: row.members,
    createdAt: row.created_at
  }))
}

export async function getGroupsByUser(username) {
  const result = await pool.query(
    'SELECT * FROM groups WHERE creator = $1 OR $1 = ANY(members) ORDER BY name',
    [username]
  )
  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    creator: row.creator,
    members: row.members,
    createdAt: row.created_at
  }))
}

export async function getGroupById(id) {
  const result = await pool.query('SELECT * FROM groups WHERE id = $1', [id])
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    creator: row.creator,
    members: row.members,
    createdAt: row.created_at
  }
}

export async function createGroup(groupData) {
  const { id, name, description = '', creator, members = [creator] } = groupData
  
  const result = await pool.query(
    'INSERT INTO groups (id, name, description, creator, members) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, name, description, creator, members]
  )
  
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    creator: row.creator,
    members: row.members,
    createdAt: row.created_at
  }
}

export async function updateGroupMembers(id, members) {
  const result = await pool.query(
    'UPDATE groups SET members = $1 WHERE id = $2 RETURNING *',
    [members, id]
  )
  
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    creator: row.creator,
    members: row.members,
    createdAt: row.created_at
  }
}

export async function deleteGroup(id) {
  const result = await pool.query('DELETE FROM groups WHERE id = $1 RETURNING id', [id])
  return result.rows.length > 0
}

// Friend Requests
export async function createFriendRequest(requestData) {
  const { id, from, to } = requestData
  
  const result = await pool.query(
    'INSERT INTO friend_requests (id, from_user, to_user) VALUES ($1, $2, $3) RETURNING *',
    [id, from, to]
  )
  
  return result.rows[0]
}

export async function getFriendRequestById(id) {
  const result = await pool.query('SELECT * FROM friend_requests WHERE id = $1', [id])
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    from: row.from_user,
    to: row.to_user,
    status: row.status,
    createdAt: row.created_at
  }
}

export async function updateFriendRequestStatus(id, status) {
  const result = await pool.query(
    'UPDATE friend_requests SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  )
  
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    from: row.from_user,
    to: row.to_user,
    status: row.status,
    createdAt: row.created_at
  }
}

export async function updateUserFriends(prenom, friends) {
  const result = await pool.query(
    'UPDATE users SET friends = $1 WHERE prenom = $2 RETURNING *',
    [friends, prenom]
  )
  
  return result.rows[0]
}

export async function updateUserRole(prenom, role) {
  const result = await pool.query(
    'UPDATE users SET role = $1 WHERE prenom = $2 RETURNING prenom, email, role',
    [role, prenom]
  )
  return result.rows[0]
}

export async function updateUserPassword(prenom, hashedPassword) {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE prenom = $2 RETURNING prenom, email, role, is_founder',
    [hashedPassword, prenom]
  )
  return result.rows[0]
}

export async function getUserByEmail(email) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0]
  } catch (error) {
    // Si la colonne email n'existe pas, retourner null
    if (error.message.includes('column "email" does not exist')) {
      console.log('Colonne email manquante, aucun utilisateur trouvé')
      return null
    }
    throw error
  }
}

export async function updateUserEmail(prenom, email) {
  try {
    console.log('Tentative de mise à jour email:', { prenom, email })
    
    const result = await pool.query(
      'UPDATE users SET email = $1 WHERE prenom = $2 RETURNING prenom, email, role, is_founder',
      [email, prenom]
    )
    
    console.log('Email mis à jour avec succès:', result.rows[0])
    return result.rows[0]
  } catch (error) {
    console.error('Erreur lors de la mise à jour email:', error.message)
    
    // Si la colonne email n'existe pas, l'ajouter d'abord
    if (error.message.includes('column "email" does not exist')) {
      console.log('Colonne email manquante, ajout en cours...')
      try {
        await pool.query('ALTER TABLE users ADD COLUMN email VARCHAR(255)')
        console.log('Colonne email ajoutée avec succès')
        
        // Réessayer la mise à jour
        const result = await pool.query(
          'UPDATE users SET email = $1 WHERE prenom = $2 RETURNING prenom, email, role, is_founder',
          [email, prenom]
        )
        console.log('Email mis à jour après ajout de colonne:', result.rows[0])
        return result.rows[0]
      } catch (migrationError) {
        console.error('Erreur lors de l\'ajout de la colonne email:', migrationError.message)
        throw migrationError
      }
    }
    throw error
  }
}

export async function getUserCount() {
  const result = await pool.query('SELECT COUNT(*) as count FROM users')
  return parseInt(result.rows[0].count)
}

export async function getFounderCount() {
  const result = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_founder = true')
  return parseInt(result.rows[0].count)
}

// Messages functions
export async function getMessagesBySlotId(slotId) {
  const result = await pool.query(
    `SELECT m.id, m.message, m.created_at, m.updated_at, u.prenom as user_prenom, u.role as user_role
     FROM messages m
     JOIN users u ON m.user_prenom = u.prenom
     WHERE m.slot_id = $1
     ORDER BY m.created_at ASC`,
    [slotId]
  )
  return result.rows
}

export async function createMessage(slotId, userPrenom, message) {
  const result = await pool.query(
    'INSERT INTO messages (slot_id, user_prenom, message) VALUES ($1, $2, $3) RETURNING *',
    [slotId, userPrenom, message]
  )
  return result.rows[0]
}

export async function updateMessage(messageId, userPrenom, newMessage) {
  const result = await pool.query(
    'UPDATE messages SET message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_prenom = $3 RETURNING *',
    [newMessage, messageId, userPrenom]
  )
  return result.rows[0]
}

export async function deleteMessage(messageId, userPrenom) {
  const result = await pool.query(
    'DELETE FROM messages WHERE id = $1 AND user_prenom = $2 RETURNING *',
    [messageId, userPrenom]
  )
  return result.rows[0]
}

// Fonctions pour le système de contact
export async function createContactMessage(fromUser, fromEmail, message) {
  const result = await pool.query(
    'INSERT INTO contact_messages (from_user, from_email, message, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *',
    [fromUser, fromEmail, message]
  )
  return result.rows[0]
}

export async function getAllContactMessages() {
  const result = await pool.query(
    'SELECT * FROM contact_messages ORDER BY created_at DESC'
  )
  return result.rows
}

export async function getUnreadContactMessages() {
  const result = await pool.query(
    'SELECT * FROM contact_messages WHERE is_read = FALSE ORDER BY created_at DESC'
  )
  return result.rows
}

export async function markContactMessageAsRead(messageId) {
  const result = await pool.query(
    'UPDATE contact_messages SET is_read = TRUE WHERE id = $1 RETURNING *',
    [messageId]
  )
  return result.rows[0]
}

export async function addAdminResponse(messageId, response) {
  const result = await pool.query(
    'UPDATE contact_messages SET admin_response = $1, admin_response_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [response, messageId]
  )
  return result.rows[0]
}

// Fermer la connexion
export async function closeDatabase() {
  await pool.end()
}
