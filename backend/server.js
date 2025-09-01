import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import {
  initDatabase,
  getAllUsers,
  getUserByPrenom,
  createUser,
  getAllSlots,
  getSlotById,
  createSlot,
  updateSlotParticipants,
  deleteSlot,
  getAllGroups,
  getGroupsByUser,
  getGroupById,
  createGroup,
  updateGroupMembers,
  deleteGroup,
  createFriendRequest,
  getFriendRequestById,
  updateFriendRequestStatus,
  updateUserFriends,
  updateUserRole,
  updateUserPassword,
  updateUserEmail,
  closeDatabase
} from './database.js'

const app = express()
const port = process.env.PORT || 8080

// Initialize database on startup
initDatabase().catch(err => {
  console.error('PostgreSQL initialization failed, falling back to JSON:', err)
})

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

// Database functions are now in database.js

// Route de diagnostic
app.get('/api/health', async (req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL ? 'configured' : 'missing'
    const testQuery = await getAllUsers()
    res.json({ 
      status: 'ok', 
      database: 'postgresql',
      DATABASE_URL: dbUrl,
      users_count: testQuery.length
    })
  } catch (error) {
    res.json({ 
      status: 'error', 
      database: 'postgresql',
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
      error: error.message 
    })
  }
})

// Admin: mettre à jour le rôle d'un utilisateur (temporaire)
app.post('/api/admin/users/:prenom/role', async (req, res) => {
  try {
    const { prenom } = req.params
    const { role } = req.body
    if (!role) return res.status(400).json({ error: 'role requis' })
    const updated = await updateUserRole(prenom, role)
    if (!updated) return res.status(404).json({ error: 'Utilisateur non trouvé' })
    res.json({ success: true, user: updated })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Changer le mot de passe d'un utilisateur
app.post('/api/users/:prenom/password', async (req, res) => {
  try {
    const { prenom } = req.params
    const { currentPassword, newPassword } = req.body
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' })
    }
    
    // Vérifier le mot de passe actuel
    const user = await getUserByPrenom(prenom)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    
    const hashedCurrentPassword = hashPassword(currentPassword)
    if (user.password !== hashedCurrentPassword) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' })
    }
    
    // Mettre à jour avec le nouveau mot de passe
    const hashedNewPassword = hashPassword(newPassword)
    const updated = await updateUserPassword(prenom, hashedNewPassword)
    
    res.json({ success: true, user: updated })
  } catch (error) {
    console.error('Update password error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Changer l'email d'un utilisateur
app.post('/api/users/:prenom/email', async (req, res) => {
  try {
    const { prenom } = req.params
    const { newEmail } = req.body
    
    if (!newEmail) {
      return res.status(400).json({ error: 'Nouvel email requis' })
    }
    
    const updated = await updateUserEmail(prenom, newEmail)
    if (!updated) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    
    res.json({ success: true, user: updated })
  } catch (error) {
    console.error('Update email error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Routes

// Connexion
app.post('/api/login', async (req, res) => {
  try {
    const { prenom, password } = req.body
    
    const user = await getUserByPrenom(prenom)
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
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Inscription
app.post('/api/register', async (req, res) => {
  try {
    const { prenom, password, email } = req.body
    
    const existingUser = await getUserByPrenom(prenom)
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' })
    }
    
    const hashedPassword = hashPassword(password)
    await createUser({
      prenom,
      password: hashedPassword,
      email
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les créneaux
app.get('/api/slots', async (req, res) => {
  try {
    const { type, user } = req.query
    
    // Récupérer tous les slots
    let filteredSlots = await getAllSlots()
    
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
      const userGroups = await getGroupsByUser(user)
      const userGroupIds = userGroups.map(group => group.id)
      
      // Filtrer les slots visibles pour cet utilisateur
      filteredSlots = filteredSlots.filter(slot => {
        // Si le slot n'a pas de groupes spécifiés, il est public (rétrocompatibilité)
        if (!slot.visibleToGroups || slot.visibleToGroups.length === 0) {
          return true
        }
        
        // Vérifier si l'utilisateur est dans au moins un des groupes visibles
        return slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId))
      })
    }
    
    res.json(filteredSlots)
  } catch (error) {
    console.error('Get slots error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Ajouter un créneau
app.post('/api/slots', async (req, res) => {
  try {
    const { date, heureDebut, heureFin, type, participants, createdBy, visibleToGroups, description } = req.body
    
    const newSlot = await createSlot({
      id: nanoid(),
      date,
      heureDebut,
      heureFin,
      type,
      description: description || '',
      createdBy: createdBy || null,
      visibleToGroups: visibleToGroups || [],
      participants: participants || []
    })
    
    res.json({ success: true, slot: newSlot })
  } catch (error) {
    console.error('Create slot error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Rejoindre un créneau
app.post('/api/slots/:id/join', async (req, res) => {
  try {
    const { id } = req.params
    const { participant, userId } = req.body
    
    const slot = await getSlotById(id)
    if (!slot) {
      return res.status(404).json({ error: 'Créneau non trouvé' })
    }
    
    // Utiliser participant ou userId selon ce qui est envoyé
    const userToAdd = participant || userId
    if (!slot.participants.includes(userToAdd)) {
      slot.participants.push(userToAdd)
      const updatedSlot = await updateSlotParticipants(id, slot.participants)
      res.json({ success: true, slot: updatedSlot })
    } else {
      res.json({ success: true, slot })
    }
  } catch (error) {
    console.error('Join slot error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Quitter un créneau
app.post('/api/slots/:id/leave', async (req, res) => {
  try {
    const { id } = req.params
    const { participant, userId } = req.body
    
    const slot = await getSlotById(id)
    if (!slot) {
      return res.status(404).json({ error: 'Créneau non trouvé' })
    }
    
    // Utiliser participant ou userId selon ce qui est envoyé
    const userToRemove = participant || userId
    const newParticipants = slot.participants.filter(p => p !== userToRemove)
    const updatedSlot = await updateSlotParticipants(id, newParticipants)
    
    res.json({ success: true, slot: updatedSlot })
  } catch (error) {
    console.error('Leave slot error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Supprimer un créneau
app.delete('/api/slots/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userRole, createdBy } = req.body
    
    const slot = await getSlotById(id)
    if (!slot) {
      return res.status(404).json({ error: 'Créneau non trouvé' })
    }
    
    // Vérifier les permissions : admin peut supprimer tout, utilisateur normal peut supprimer ses propres créneaux
    const isAdmin = userRole === 'admin'
    const isOwner = slot.createdBy === createdBy
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Vous n\'avez pas les permissions pour supprimer ce créneau' })
    }
    
    const deleted = await deleteSlot(id)
    if (deleted) {
      res.json({ success: true })
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression' })
    }
  } catch (error) {
    console.error('Delete slot error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Gestion des amis
app.post('/api/friends/request', async (req, res) => {
  try {
    const { from, to } = req.body
    
    const friendRequest = await createFriendRequest({
      id: nanoid(),
      from,
      to
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('Friend request error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/friends/accept', async (req, res) => {
  try {
    const { requestId } = req.body
    
    const request = await getFriendRequestById(requestId)
    if (!request) {
      return res.status(404).json({ error: 'Demande non trouvée' })
    }
    
    // Ajouter l'ami aux deux utilisateurs
    const fromUser = await getUserByPrenom(request.from)
    const toUser = await getUserByPrenom(request.to)
    
    if (fromUser && toUser) {
      if (!fromUser.friends.includes(request.to)) {
        fromUser.friends.push(request.to)
        await updateUserFriends(fromUser.prenom, fromUser.friends)
      }
      if (!toUser.friends.includes(request.from)) {
        toUser.friends.push(request.from)
        await updateUserFriends(toUser.prenom, toUser.friends)
      }
    }
    
    // Marquer la demande comme acceptée
    await updateFriendRequestStatus(requestId, 'accepted')
    
    res.json({ success: true })
  } catch (error) {
    console.error('Accept friend error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Routes pour les groupes

// Créer un groupe
app.post('/api/groups', async (req, res) => {
  try {
    const { name, description, creator } = req.body
    
    if (!name || !creator) {
      return res.status(400).json({ error: 'Nom du groupe et créateur requis' })
    }
    
    // Vérifier que le créateur existe
    const creatorUser = await getUserByPrenom(creator)
    if (!creatorUser) {
      return res.status(404).json({ error: 'Créateur non trouvé' })
    }
    
    const newGroup = await createGroup({
      id: nanoid(),
      name,
      description: description || '',
      creator,
      members: [creator]
    })
    
    res.json({ success: true, group: newGroup })
  } catch (error) {
    console.error('Create group error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Lister les groupes d'un utilisateur
app.get('/api/groups', async (req, res) => {
  try {
    const { user } = req.query
    
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur requis' })
    }
    
    const userGroups = await getGroupsByUser(user)
    res.json(userGroups)
  } catch (error) {
    console.error('Get groups error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Ajouter un membre à un groupe
app.post('/api/groups/:id/members', async (req, res) => {
  try {
    const { id } = req.params
    const { memberUsername, requester } = req.body
    
    const group = await getGroupById(id)
    if (!group) {
      return res.status(404).json({ error: 'Groupe non trouvé' })
    }
    
    // Vérifier que le requester est le créateur du groupe
    if (group.creator !== requester) {
      return res.status(403).json({ error: 'Seul le créateur peut ajouter des membres' })
    }
    
    // Vérifier que l'utilisateur à ajouter existe
    const userToAdd = await getUserByPrenom(memberUsername)
    if (!userToAdd) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    
    // Ajouter le membre s'il n'est pas déjà dans le groupe
    if (!group.members.includes(memberUsername)) {
      group.members.push(memberUsername)
      const updatedGroup = await updateGroupMembers(id, group.members)
      res.json({ success: true, group: updatedGroup })
    } else {
      res.json({ success: true, group })
    }
  } catch (error) {
    console.error('Add group member error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Supprimer un membre d'un groupe
app.delete('/api/groups/:id/members', async (req, res) => {
  try {
    const { id } = req.params
    const { memberUsername, requester } = req.body
    
    const group = await getGroupById(id)
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
    const newMembers = group.members.filter(member => member !== memberUsername)
    const updatedGroup = await updateGroupMembers(id, newMembers)
    
    res.json({ success: true, group: updatedGroup })
  } catch (error) {
    console.error('Remove group member error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Quitter un groupe (pour les membres)
app.post('/api/groups/:id/leave', async (req, res) => {
  try {
    const { id } = req.params
    const { memberUsername } = req.body
    
    const group = await getGroupById(id)
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
    const newMembers = group.members.filter(member => member !== memberUsername)
    const updatedGroup = await updateGroupMembers(id, newMembers)
    
    res.json({ success: true, group: updatedGroup })
  } catch (error) {
    console.error('Leave group error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Supprimer un groupe
app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { requester } = req.body
    
    const group = await getGroupById(id)
    if (!group) {
      return res.status(404).json({ error: 'Groupe non trouvé' })
    }
    
    // Vérifier que le requester est le créateur du groupe
    if (group.creator !== requester) {
      return res.status(403).json({ error: 'Seul le créateur peut supprimer le groupe' })
    }
    
    const deleted = await deleteGroup(id)
    if (deleted) {
      res.json({ success: true })
    } else {
      res.status(500).json({ error: 'Erreur lors de la suppression' })
    }
  } catch (error) {
    console.error('Delete group error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer tous les utilisateurs (pour l'invitation dans les groupes)
app.get('/api/users/all', async (req, res) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (error) {
    console.error('Get all users error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.listen(port, () => {
  console.log(`🚀 Playzio Backend listening on port ${port}`)
})
