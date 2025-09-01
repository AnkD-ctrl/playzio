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
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Users
export async function getAllUsers() {
  const result = await pool.query('SELECT prenom, email, role FROM users ORDER BY prenom')
  return result.rows
}

export async function getUserByPrenom(prenom) {
  const result = await pool.query('SELECT * FROM users WHERE prenom = $1', [prenom])
  return result.rows[0]
}

export async function createUser(userData) {
  const { prenom, password, email, role = 'user' } = userData
  const result = await pool.query(
    'INSERT INTO users (prenom, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [prenom, password, email, role]
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
    description: row.description,
    createdBy: row.created_by,
    visibleToGroups: row.visible_to_groups,
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
    description: row.description,
    createdBy: row.created_by,
    visibleToGroups: row.visible_to_groups,
    participants: row.participants
  }
}

export async function createSlot(slotData) {
  const { id, date, heureDebut, heureFin, type, description = '', createdBy = null, visibleToGroups = [], participants = [] } = slotData
  
  const typeValue = Array.isArray(type) ? JSON.stringify(type) : type
  
  const result = await pool.query(
    'INSERT INTO slots (id, date, heure_debut, heure_fin, type, description, created_by, visible_to_groups, participants) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [id, date, heureDebut, heureFin, typeValue, description, createdBy, visibleToGroups, participants]
  )
  
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

// Fermer la connexion
export async function closeDatabase() {
  await pool.end()
}
