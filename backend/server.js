import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 8080

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'https://playzio.vercel.app',
    'https://playzio-bara.vercel.app',
    'https://playzio-git-main-ankd-ctrl.vercel.app',
    'https://playzio-348wy256a-jacks-projects-af0c7ecd.vercel.app',
    'https://www.acebook.app',
    'https://playzio.fr',
    'https://www.playzio.fr',
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true
}))
app.use(express.json())

// Fonction pour hasher les mots de passe
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Fonction pour lire la base de données
function readDB() {
  try {
    const dbFile = fs.existsSync(path.join(__dirname, 'db.json')) 
      ? 'db.json' 
      : 'db.example.json'
    const data = fs.readFileSync(path.join(__dirname, dbFile), 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return { slots: [], users: [], friendRequests: [], groups: [] }
  }
}

// Fonction pour écrire dans la base de données
function writeDB(data) {
  fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2))
}

// Routes

// Connexion
app.post('/api/login', (req, res) => {
  const { prenom, password } = req.body
  const db = readDB()
  
  const user = db.users.find(u => u.prenom === prenom)
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur non trouvé' })
  }
  
  const hashedPassword = hashPassword(password)
  if (user.password !== hashedPassword) {
    return res.status(401).json({ error: 'Mot de passe incorrect' })
  }
  
  res.json({ 
    success: true, 
    user: { 
      prenom: user.prenom, 
      role: user.role || 'user',
      email: user.email 
    } 
  })
})

// Inscription
app.post('/api/register', (req, res) => {
  const { prenom, password, email } = req.body
  const db = readDB()
  
  if (db.users.find(u => u.prenom === prenom)) {
    return res.status(400).json({ error: 'Utilisateur déjà existant' })
  }
  
  const hashedPassword = hashPassword(password)
  const newUser = {
    prenom,
    password: hashedPassword,
    email,
    friends: [],
    friendRequests: []
  }
  
  db.users.push(newUser)
  writeDB(db)
  
  res.json({ success: true })
})

// Récupérer les créneaux
app.get('/api/slots', (req, res) => {
  const db = readDB()
  const { type, user } = req.query
  
  let filteredSlots = db.slots
  
  // Filtrer par type d'activité
  if (type) {
    filteredSlots = filteredSlots.filter(slot => {
      if (!slot.type) return false
      
      // Si type est un tableau (activités multiples)
      if (Array.isArray(slot.type)) {
        return slot.type.some(activity => 
          activity && activity.toLowerCase() === type.toLowerCase()
        )
      }
      
      // Si type est une chaîne (rétrocompatibilité)
      return slot.type && slot.type.toLowerCase() === type.toLowerCase()
    })
  }
  
  // Filtrer par visibilité des groupes si un utilisateur est spécifié
  if (user) {
    // Récupérer les groupes de l'utilisateur
    const userGroups = db.groups.filter(group => 
      group.members.includes(user) || group.creator === user
    ).map(group => group.id)
    
    // Filtrer les slots visibles pour cet utilisateur
    filteredSlots = filteredSlots.filter(slot => {
      // Si le slot n'a pas de groupes spécifiés, il est public (rétrocompatibilité)
      if (!slot.visibleToGroups || slot.visibleToGroups.length === 0) {
        return true
      }
      
      // Vérifier si l'utilisateur est dans au moins un des groupes visibles
      return slot.visibleToGroups.some(groupId => userGroups.includes(groupId))
    })
  }
  
  res.json(filteredSlots)
})

// Ajouter un créneau
app.post('/api/slots', (req, res) => {
  const { date, heureDebut, heureFin, type, participants, createdBy, visibleToGroups, description } = req.body
  const db = readDB()
  
  const newSlot = {
    id: nanoid(),
    date,
    heureDebut,
    heureFin,
    type,
    description: description || '',
    createdBy: createdBy || null,
    visibleToGroups: visibleToGroups || [],
    participants: participants || []
  }
  
  db.slots.push(newSlot)
  writeDB(db)
  
  res.json({ success: true, slot: newSlot })
})

// Rejoindre un créneau
app.post('/api/slots/:id/join', (req, res) => {
  const { id } = req.params
  const { participant, userId } = req.body
  const db = readDB()
  
  const slot = db.slots.find(s => s.id === id)
  if (!slot) {
    return res.status(404).json({ error: 'Créneau non trouvé' })
  }
  
  // Utiliser participant ou userId selon ce qui est envoyé
  const userToAdd = participant || userId
  if (!slot.participants.includes(userToAdd)) {
    slot.participants.push(userToAdd)
    writeDB(db)
  }
  
  res.json({ success: true, slot })
})

// Quitter un créneau
app.post('/api/slots/:id/leave', (req, res) => {
  const { id } = req.params
  const { participant, userId } = req.body
  const db = readDB()
  
  const slot = db.slots.find(s => s.id === id)
  if (!slot) {
    return res.status(404).json({ error: 'Créneau non trouvé' })
  }
  
  // Utiliser participant ou userId selon ce qui est envoyé
  const userToRemove = participant || userId
  slot.participants = slot.participants.filter(p => p !== userToRemove)
  writeDB(db)
  
  res.json({ success: true, slot })
})

// Supprimer un créneau
app.delete('/api/slots/:id', (req, res) => {
  const { id } = req.params
  const { userRole, createdBy } = req.body
  const db = readDB()
  
  const slot = db.slots.find(s => s.id === id)
  if (!slot) {
    return res.status(404).json({ error: 'Créneau non trouvé' })
  }
  
  // Vérifier les permissions : admin peut supprimer tout, utilisateur normal peut supprimer ses propres créneaux
  const isAdmin = userRole === 'admin'
  const isOwner = slot.createdBy === createdBy
  
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Vous n\'avez pas les permissions pour supprimer ce créneau' })
  }
  
  db.slots = db.slots.filter(s => s.id !== id)
  writeDB(db)
  
  res.json({ success: true })
})

// Récupérer les utilisateurs
app.get('/api/users', (req, res) => {
  const db = readDB()
  const users = db.users.map(u => ({
    prenom: u.prenom,
    email: u.email,
    role: u.role || 'user'
  }))
  res.json(users)
})

// Gestion des amis
app.post('/api/friends/request', (req, res) => {
  const { from, to } = req.body
  const db = readDB()
  
  const friendRequest = {
    id: nanoid(),
    from,
    to,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  db.friendRequests.push(friendRequest)
  writeDB(db)
  
  res.json({ success: true })
})

app.post('/api/friends/accept', (req, res) => {
  const { requestId } = req.body
  const db = readDB()
  
  const request = db.friendRequests.find(r => r.id === requestId)
  if (!request) {
    return res.status(404).json({ error: 'Demande non trouvée' })
  }
  
  // Ajouter l'ami aux deux utilisateurs
  const fromUser = db.users.find(u => u.prenom === request.from)
  const toUser = db.users.find(u => u.prenom === request.to)
  
  if (fromUser && toUser) {
    if (!fromUser.friends.includes(request.to)) {
      fromUser.friends.push(request.to)
    }
    if (!toUser.friends.includes(request.from)) {
      toUser.friends.push(request.from)
    }
  }
  
  // Marquer la demande comme acceptée
  request.status = 'accepted'
  writeDB(db)
  
  res.json({ success: true })
})

// Routes pour les groupes

// Créer un groupe
app.post('/api/groups', (req, res) => {
  const { name, description, creator } = req.body
  const db = readDB()
  
  if (!name || !creator) {
    return res.status(400).json({ error: 'Nom du groupe et créateur requis' })
  }
  
  // Vérifier que le créateur existe
  const creatorUser = db.users.find(u => u.prenom === creator)
  if (!creatorUser) {
    return res.status(404).json({ error: 'Créateur non trouvé' })
  }
  
  const newGroup = {
    id: nanoid(),
    name,
    description: description || '',
    creator,
    members: [creator],
    createdAt: new Date().toISOString()
  }
  
  db.groups.push(newGroup)
  writeDB(db)
  
  res.json({ success: true, group: newGroup })
})

// Lister les groupes d'un utilisateur
app.get('/api/groups', (req, res) => {
  const { user } = req.query
  const db = readDB()
  
  if (!user) {
    return res.status(400).json({ error: 'Utilisateur requis' })
  }
  
  // Récupérer les groupes où l'utilisateur est membre ou créateur
  const userGroups = db.groups.filter(group => 
    group.members.includes(user) || group.creator === user
  )
  
  res.json(userGroups)
})

// Ajouter un membre à un groupe
app.post('/api/groups/:id/members', (req, res) => {
  const { id } = req.params
  const { memberUsername, requester } = req.body
  const db = readDB()
  
  const group = db.groups.find(g => g.id === id)
  if (!group) {
    return res.status(404).json({ error: 'Groupe non trouvé' })
  }
  
  // Vérifier que le requester est le créateur du groupe
  if (group.creator !== requester) {
    return res.status(403).json({ error: 'Seul le créateur peut ajouter des membres' })
  }
  
  // Vérifier que l'utilisateur à ajouter existe
  const userToAdd = db.users.find(u => u.prenom === memberUsername)
  if (!userToAdd) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' })
  }
  
  // Ajouter le membre s'il n'est pas déjà dans le groupe
  if (!group.members.includes(memberUsername)) {
    group.members.push(memberUsername)
    writeDB(db)
  }
  
  res.json({ success: true, group })
})

// Supprimer un membre d'un groupe
app.delete('/api/groups/:id/members', (req, res) => {
  const { id } = req.params
  const { memberUsername, requester } = req.body
  const db = readDB()
  
  const group = db.groups.find(g => g.id === id)
  if (!group) {
    return res.status(404).json({ error: 'Groupe non trouvé' })
  }
  
  // Vérifier que le requester est le créateur du groupe
  if (group.creator !== requester) {
    return res.status(403).json({ error: 'Seul le créateur peut supprimer des membres' })
  }
  
  // Ne pas permettre de supprimer le créateur
  if (memberUsername === group.creator) {
    return res.status(400).json({ error: 'Le créateur ne peut pas être supprimé du groupe' })
  }
  
  // Supprimer le membre
  group.members = group.members.filter(member => member !== memberUsername)
  writeDB(db)
  
  res.json({ success: true, group })
})

// Quitter un groupe (pour les membres)
app.post('/api/groups/:id/leave', (req, res) => {
  const { id } = req.params
  const { memberUsername } = req.body
  const db = readDB()
  
  const group = db.groups.find(g => g.id === id)
  if (!group) {
    return res.status(404).json({ error: 'Groupe non trouvé' })
  }
  
  // Vérifier que l'utilisateur est membre du groupe
  if (!group.members.includes(memberUsername)) {
    return res.status(400).json({ error: 'Vous n\'êtes pas membre de ce groupe' })
  }
  
  // Ne pas permettre au créateur de quitter son propre groupe
  if (memberUsername === group.creator) {
    return res.status(400).json({ error: 'Le créateur ne peut pas quitter son groupe. Supprimez le groupe à la place.' })
  }
  
  // Retirer le membre
  group.members = group.members.filter(member => member !== memberUsername)
  writeDB(db)
  
  res.json({ success: true, group })
})

// Supprimer un groupe
app.delete('/api/groups/:id', (req, res) => {
  const { id } = req.params
  const { requester } = req.body
  const db = readDB()
  
  const group = db.groups.find(g => g.id === id)
  if (!group) {
    return res.status(404).json({ error: 'Groupe non trouvé' })
  }
  
  // Vérifier que le requester est le créateur du groupe
  if (group.creator !== requester) {
    return res.status(403).json({ error: 'Seul le créateur peut supprimer le groupe' })
  }
  
  // Supprimer le groupe
  db.groups = db.groups.filter(g => g.id !== id)
  writeDB(db)
  
  res.json({ success: true })
})

// Récupérer tous les utilisateurs (pour l'invitation dans les groupes)
app.get('/api/users/all', (req, res) => {
  const db = readDB()
  const users = db.users.map(u => ({
    prenom: u.prenom,
    email: u.email,
    role: u.role || 'user'
  }))
  res.json(users)
})

app.listen(port, () => {
  console.log(`🚀 Playzio Backend listening on port ${port}`)
})
