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
  searchCustomActivities,
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
  getUserCount,
  getFounderCount,
  getMessagesBySlotId,
  createMessage,
  createContactMessage,
  getAllContactMessages,
  getUnreadContactMessages,
  markContactMessageAsRead,
  addAdminResponse,
  updateMessage,
  deleteMessage,
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

// Fonction de validation email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Fonction pour vérifier si une disponibilité est encore valide (pas passée)
function isSlotStillValid(slot) {
  const now = new Date()
  const today = now.toISOString().split('T')[0] // Format YYYY-MM-DD
  
  // Si la date est dans le passé, la disponibilité n'est plus valide
  if (slot.date < today) {
    return false
  }
  
  // Si c'est aujourd'hui, vérifier l'heure de fin
  if (slot.date === today && slot.heureFin) {
    const currentTime = now.toTimeString().split(' ')[0] // Format HH:MM:SS
    const slotEndTime = slot.heureFin + ':00' // Ajouter les secondes si nécessaire
    
    // Si l'heure de fin est passée, la disponibilité n'est plus valide
    if (slotEndTime < currentTime) {
      return false
    }
  }
  
  return true
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
      users_count: testQuery.length,
      version: '1.0.1'
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

// Ajouter un email à un utilisateur
app.post('/api/users/:prenom/email', async (req, res) => {
  try {
    const { prenom } = req.params
    const { email } = req.body
    
    console.log('Tentative d\'ajout d\'email:', { prenom, email })
    
    if (!email) {
      console.log('Erreur: Email requis')
      return res.status(400).json({ error: 'Email requis' })
    }
    
    // Validation email
    if (!isValidEmail(email)) {
      console.log('Erreur: Email invalide')
      return res.status(400).json({ error: 'Adresse email invalide' })
    }
    
    const user = await getUserByPrenom(prenom)
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non')
    console.log('Détails utilisateur:', user)
    if (!user) {
      console.log('Erreur: Utilisateur non trouvé pour:', prenom)
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }
    
    // Vérifier si l'email n'est pas déjà utilisé (temporairement désactivé)
    try {
      const existingUser = await getUserByEmail(email)
      console.log('Email déjà utilisé:', existingUser ? 'Oui' : 'Non')
      if (existingUser && existingUser.prenom !== prenom) {
        return res.status(400).json({ error: 'Cette adresse email est déjà utilisée' })
      }
    } catch (emailCheckError) {
      console.log('Erreur lors de la vérification email (ignorée):', emailCheckError.message)
      // On continue même si la vérification échoue
    }
    
    // Mettre à jour l'email
    console.log('Mise à jour de l\'email...')
    try {
      const updated = await updateUserEmail(prenom, email)
      console.log('Email mis à jour avec succès:', updated)
      
      res.json({ success: true, user: updated })
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour email:', updateError.message)
      console.error('Stack trace:', updateError.stack)
      res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'email: ' + updateError.message })
    }
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
        isFounder: user.is_founder || false,
        email: user.email || null
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
    
    if (!prenom || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' })
    }

    // Validation email si fourni
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Adresse email invalide' })
    }
    
    const existingUser = await getUserByPrenom(prenom)
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' })
    }
    
    // Vérifier si l'utilisateur peut être membre fondateur (1000 premiers)
    const founderCount = await getFounderCount()
    // Simuler 238 membres premium existants pour le lancement
    const adjustedFounderCount = Math.max(founderCount, 238)
    const isFounder = adjustedFounderCount < 1000
    
    const hashedPassword = hashPassword(password)
    const newUser = await createUser({
      prenom,
      password: hashedPassword,
      email: email || null,
      isFounder
    })
    
    res.json({ 
      success: true, 
      isFounder,
      founderCount: adjustedFounderCount + 1,
      message: isFounder ? 'Félicitations ! Vous êtes membre premium de Playzio !' : 'Compte créé avec succès',
      user: {
        prenom: newUser.prenom,
        role: newUser.role || 'user',
        isFounder: newUser.is_founder || false,
        email: newUser.email || null
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Messages routes
app.get('/api/slots/:slotId/messages', async (req, res) => {
  try {
    const { slotId } = req.params
    const messages = await getMessagesBySlotId(slotId)
    res.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/slots/:slotId/messages', async (req, res) => {
  try {
    const { slotId } = req.params
    const { userPrenom, message } = req.body
    
    if (!userPrenom || !message) {
      return res.status(400).json({ error: 'Utilisateur et message requis' })
    }
    
    const newMessage = await createMessage(slotId, userPrenom, message)
    res.json(newMessage)
  } catch (error) {
    console.error('Create message error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.put('/api/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    const { userPrenom, message } = req.body
    
    if (!userPrenom || !message) {
      return res.status(400).json({ error: 'Utilisateur et message requis' })
    }
    
    const updatedMessage = await updateMessage(messageId, userPrenom, message)
    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message non trouvé ou non autorisé' })
    }
    
    res.json(updatedMessage)
  } catch (error) {
    console.error('Update message error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.delete('/api/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    const { userPrenom } = req.body
    
    if (!userPrenom) {
      return res.status(400).json({ error: 'Utilisateur requis' })
    }
    
    const deletedMessage = await deleteMessage(messageId, userPrenom)
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message non trouvé ou non autorisé' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les créneaux
app.get('/api/slots', async (req, res) => {
  try {
    const { type, user } = req.query
    
    // Récupérer tous les slots
    let filteredSlots = await getAllSlots()
    
    // Filtrer les disponibilités passées (amélioration UX + optimisation base)
    filteredSlots = filteredSlots.filter(slot => isSlotStillValid(slot))
    
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
    const { date, heureDebut, heureFin, type, customActivity, participants, createdBy, visibleToGroups, visibleToAll, description } = req.body
    
    const newSlot = await createSlot({
      id: nanoid(),
      date,
      heureDebut,
      heureFin,
      type,
      customActivity: customActivity || null,
      description: description || '',
      createdBy: createdBy || null,
      visibleToGroups: visibleToGroups || [],
      visibleToAll: visibleToAll !== undefined ? visibleToAll : true,
      participants: participants || []
    })
    
    res.json({ success: true, slot: newSlot })
  } catch (error) {
    console.error('Create slot error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Rechercher les activités personnalisées
app.get('/api/activities/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) {
      return res.json({ activities: [] })
    }
    
    const activities = await searchCustomActivities(q.trim())
    res.json({ activities })
  } catch (error) {
    console.error('Search activities error:', error)
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

// Nettoyer les anciennes disponibilités (route admin)
app.post('/api/admin/cleanup-old-slots', async (req, res) => {
  try {
    const allSlots = await getAllSlots()
    const validSlots = allSlots.filter(slot => isSlotStillValid(slot))
    const oldSlots = allSlots.filter(slot => !isSlotStillValid(slot))
    
    // Supprimer les anciennes disponibilités
    let deletedCount = 0
    for (const slot of oldSlots) {
      try {
        const deleted = await deleteSlot(slot.id)
        if (deleted) deletedCount++
      } catch (error) {
        console.error(`Erreur lors de la suppression du slot ${slot.id}:`, error)
      }
    }
    
    res.json({
      success: true,
      totalSlots: allSlots.length,
      validSlots: validSlots.length,
      deletedSlots: deletedCount,
      message: `${deletedCount} anciennes disponibilités supprimées`
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    res.status(500).json({ error: 'Erreur lors du nettoyage' })
  }
})

// Statistiques des membres premium
app.get('/api/founder-stats', async (req, res) => {
  try {
    let founderCount = 238 // Valeur par défaut pour le lancement
    let totalUsers = 0
    
    try {
      founderCount = await getFounderCount()
      totalUsers = await getUserCount()
      // Simuler 238 membres premium existants pour le lancement
      founderCount = Math.max(founderCount, 238)
    } catch (dbError) {
      // Si la base de données n'est pas disponible, utiliser les valeurs par défaut
      console.log('Base de données non disponible, utilisation des valeurs par défaut')
      founderCount = 238
      totalUsers = 300 // Estimation
    }
    
    const remainingFounderSlots = Math.max(0, 1000 - founderCount)
    
    res.json({
      founderCount,
      totalUsers,
      remainingFounderSlots,
      isFounderAvailable: remainingFounderSlots > 0
    })
  } catch (error) {
    console.error('Get founder stats error:', error)
    // En cas d'erreur, retourner des valeurs par défaut
    res.json({
      founderCount: 238,
      totalUsers: 300,
      remainingFounderSlots: 762,
      isFounderAvailable: true
    })
  }
})


// Routes pour le système de contact
app.post('/api/contact', async (req, res) => {
  try {
    console.log('📧 Nouveau message de contact reçu:', req.body)
    const { message, fromUser, fromEmail } = req.body
    
    if (!message || !fromUser) {
      console.log('❌ Données manquantes:', { message: !!message, fromUser: !!fromUser })
      return res.status(400).json({ error: 'Message et nom d\'utilisateur requis' })
    }
    
    console.log('💾 Insertion en base de données PostgreSQL...')
    const contactMessage = await createContactMessage(fromUser, fromEmail, message)
    console.log('✅ Message inséré en base de données:', contactMessage.id)
    res.json({ success: true, message: contactMessage })
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du message de contact:', error)
    res.status(500).json({ error: 'Erreur serveur', details: error.message })
  }
})

// Route pour récupérer tous les messages de contact (admin seulement)
app.get('/api/admin/contact-messages', async (req, res) => {
  try {
    const messages = await getAllContactMessages()
    res.json(messages)
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Route pour récupérer les messages non lus (admin seulement)
app.get('/api/admin/contact-messages/unread', async (req, res) => {
  try {
    const messages = await getUnreadContactMessages()
    res.json(messages)
  } catch (error) {
    console.error('Erreur lors de la récupération des messages non lus:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Route pour supprimer un message de contact (admin seulement)
app.delete('/api/admin/contact-messages/:id', async (req, res) => {
  try {
    const messageId = parseInt(req.params.id)
    console.log('🗑️ Suppression du message:', messageId)
    
    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'ID de message invalide' })
    }
    
    // Utiliser directement la fonction de database.js
    const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING *', [messageId])
    
    if (result.rows.length > 0) {
      console.log('✅ Message supprimé de la base de données')
      res.json({ success: true, message: 'Message supprimé avec succès' })
    } else {
      res.status(404).json({ error: 'Message non trouvé' })
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du message:', error)
    res.status(500).json({ error: 'Erreur serveur', details: error.message })
  }
})

// Route pour marquer un message comme lu (admin seulement)
app.put('/api/admin/contact-messages/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    const message = await markContactMessageAsRead(id)
    res.json(message)
  } catch (error) {
    console.error('Erreur lors du marquage du message comme lu:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Route pour ajouter une réponse admin
app.put('/api/admin/contact-messages/:id/response', async (req, res) => {
  try {
    const { id } = req.params
    const { response } = req.body
    
    if (!response) {
      return res.status(400).json({ error: 'Réponse requise' })
    }
    
    const message = await addAdminResponse(id, response)
    res.json(message)
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réponse admin:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.listen(port, () => {
  console.log(`🚀 Playzio Backend listening on port ${port}`)
})
