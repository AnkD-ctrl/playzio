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
    'https://playzio-git-main-ankd-ctrl.vercel.app'
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
    const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8')
    return JSON.parse(data)
  } catch (error) {
    return { slots: [], users: [], friendRequests: [] }
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
  const { type } = req.query
  
  let filteredSlots = db.slots
  
  if (type) {
    filteredSlots = db.slots.filter(slot => 
      slot.type && slot.type.toLowerCase() === type.toLowerCase()
    )
  }
  
  res.json(filteredSlots)
})

// Ajouter un créneau
app.post('/api/slots', (req, res) => {
  const { date, heureDebut, heureFin, type, participants } = req.body
  const db = readDB()
  
  const newSlot = {
    id: nanoid(),
    date,
    heureDebut,
    heureFin,
    type,
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

app.listen(port, () => {
  console.log(`🚀 Playzio Backend listening on port ${port}`)
})
