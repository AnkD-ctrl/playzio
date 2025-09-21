import express from 'express'
import cors from 'cors'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

// Rate limiting pour la réinitialisation de mot de passe
const resetAttempts = new Map()
const RESET_COOLDOWN = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 3 // 3 tentatives max par IP
import {
  initDatabase,
  getAllUsers,
  getUserByPrenom,
  getUserByEmail,
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
  acceptFriendRequest,
  deleteFriendRequest,
  getFriendRequestById,
  updateFriendRequestStatus,
  updateUserFriends,
  getUserFriends,
  getFriendRequestsReceived,
  getFriendRequestsSent,
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
  createPasswordResetToken,
  getPasswordResetToken,
  markTokenAsUsed,
  cleanupExpiredTokens,
  closeDatabase,
  pool
} from './database.js'
import { sendPasswordResetEmail, testEmailConnection, sendSlotJoinNotification } from './emailService.js'
import { ensureEmailNotificationsColumn } from './auto_migrate_email_notifications.js'
import { ensureVisibilityColumns } from './auto_migrate_visibility.js'

const app = express()
const port = process.env.PORT || 8080

// Initialize database on startup
initDatabase().then(async () => {
  // Exécuter la migration automatique pour les notifications email
  await ensureVisibilityColumns()
  await ensureEmailNotificationsColumn()
}).catch(err => {
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
    
    if (!prenom || !password || !email) {
      return res.status(400).json({ error: 'Nom d\'utilisateur, mot de passe et email requis' })
    }

    // Validation email obligatoire
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Adresse email invalide' })
    }
    
    const existingUser = await getUserByPrenom(prenom)
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' })
    }
    
    // Vérifier si l'utilisateur peut être membre fondateur (1000 premiers)
    const founderCount = await getFounderCount()
    const isFounder = founderCount < 1000
    
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
      founderCount: founderCount + 1,
      message: isFounder ? 'Félicitations ! Bienvenue sur Playzio !' : 'Compte créé avec succès',
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
    const { type, user, public_only } = req.query
    
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
    
    // Filtrer par visibilité
    if (public_only === 'true') {
      // Pour l'onglet "Dispos publiques", afficher seulement les slots publics
      filteredSlots = filteredSlots.filter(slot => slot.visibleToAll === true)
    } else if (user) {
      // Récupérer les groupes de l'utilisateur
      const userGroups = await getGroupsByUser(user)
      const userGroupIds = userGroups.map(group => group.id)
      
      // Filtrer les slots visibles pour cet utilisateur
      filteredSlots = filteredSlots.filter(slot => {
        // Si le slot est public (visibleToAll = true), il est visible par tous
        if (slot.visibleToAll === true) {
          return true
        }
        
        // Si le slot n'a pas de groupes spécifiés ET pas de visibilité définie, il est public (rétrocompatibilité)
        if ((!slot.visibleToGroups || slot.visibleToGroups.length === 0) && slot.visibleToAll !== false) {
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
    const { date, heureDebut, heureFin, type, customActivity, participants, createdBy, visibleToGroups, visibleToAll, visibleToFriends, description, lieu, maxParticipants } = req.body
    
    const newSlot = await createSlot({
      id: nanoid(),
      date,
      heureDebut,
      heureFin,
      type,
      customActivity: customActivity || null,
      description: description || '',
      lieu: lieu || '',
      maxParticipants: maxParticipants || null,
      createdBy: createdBy || null,
      visibleToGroups: visibleToGroups || [],
      visibleToAll: visibleToAll !== undefined ? visibleToAll : true,
      visibleToFriends: visibleToFriends !== undefined ? visibleToFriends : false,
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
      
      // Envoyer une notification email si activée et si l'organisateur a un email
      if (slot.emailNotifications && slot.createdBy) {
        try {
          const organizer = await getUserByPrenom(slot.createdBy)
          if (organizer && organizer.email) {
            await sendSlotJoinNotification(
              organizer.email,
              organizer.prenom,
              userToAdd,
              {
                date: slot.date,
                heureDebut: slot.heureDebut,
                heureFin: slot.heureFin,
                type: slot.type,
                customActivity: slot.customActivity,
                lieu: slot.lieu
              }
            )
            console.log(`Notification email envoyée à ${organizer.email} pour l'inscription de ${userToAdd}`)
          }
        } catch (emailError) {
          console.error('Erreur lors de l\'envoi de la notification email:', emailError)
          // Ne pas faire échouer la jointure si l'email échoue
        }
      }
      
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

// Rechercher des utilisateurs
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) {
      return res.json([])
    }
    
    const users = await getAllUsers()
    const searchTerm = q.toLowerCase().trim()
    
    // Filtrer les utilisateurs par nom (prenom)
    const filteredUsers = users.filter(user => 
      user.prenom && user.prenom.toLowerCase().includes(searchTerm)
    )
    
    res.json(filteredUsers)
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les disponibilités publiques d'un utilisateur
app.get('/api/slots/user/:username', async (req, res) => {
  try {
    const { username } = req.params
    if (!username) {
      return res.status(400).json({ error: 'Nom d\'utilisateur requis' })
    }
    
    // Récupérer tous les slots
    let slots = await getAllSlots()
    
    // Filtrer les disponibilités passées
    slots = slots.filter(slot => isSlotStillValid(slot))
    
    // Filtrer par créateur (nom d'utilisateur)
    const userSlots = slots.filter(slot => 
      slot.createdBy && slot.createdBy.toLowerCase() === username.toLowerCase()
    )
    
    res.json(userSlots)
  } catch (error) {
    console.error('Get user slots error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Gestion des amis
app.post('/api/friends/request', async (req, res) => {
  try {
    const { sender, receiver } = req.body
    
    if (!sender || !receiver) {
      return res.status(400).json({ error: 'Sender et receiver requis' })
    }
    
    if (sender === receiver) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous ajouter vous-même' })
    }
    
    const friendRequest = await createFriendRequest(sender, receiver)
    
    res.json({ success: true, requestId: friendRequest.id })
  } catch (error) {
    console.error('Friend request error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

app.post('/api/friends/accept', async (req, res) => {
  try {
    const { requestId } = req.body
    
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID requis' })
    }
    
    // Récupérer la demande pour obtenir les utilisateurs
    const result = await pool.query(
      'SELECT from_user, to_user FROM friend_requests WHERE id = $1 AND status = $2',
      [requestId, 'pending']
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Demande non trouvée' })
    }
    
    const { from_user, to_user } = result.rows[0]
    
    // Accepter la demande (supprime la demande et ajoute l'amitié)
    await acceptFriendRequest(from_user, to_user)
    
    res.json({ success: true })
  } catch (error) {
    console.error('Accept friend error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les amis d'un utilisateur
app.get('/api/friends/:prenom', async (req, res) => {
  try {
    const { prenom } = req.params
    const friends = await getUserFriends(prenom)
    res.json({ friends })
  } catch (error) {
    console.error('Get friends error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les demandes d'amis reçues
app.get('/api/friends/requests/received/:prenom', async (req, res) => {
  try {
    const { prenom } = req.params
    const requests = await getFriendRequestsReceived(prenom)
    res.json({ requests })
  } catch (error) {
    console.error('Get friend requests received error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupérer les demandes d'amis envoyées
app.get('/api/friends/requests/sent/:prenom', async (req, res) => {
  try {
    const { prenom } = req.params
    const requests = await getFriendRequestsSent(prenom)
    res.json({ requests })
  } catch (error) {
    console.error('Get friend requests sent error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Accepter une demande d'ami par nom d'utilisateur
app.post('/api/friends/accept-by-name', async (req, res) => {
  try {
    const { from, to } = req.body
    
    // Ajouter l'ami aux deux utilisateurs
    const fromUser = await getUserByPrenom(from)
    const toUser = await getUserByPrenom(to)
    
    if (fromUser && toUser) {
      if (!fromUser.friends.includes(to)) {
        fromUser.friends.push(to)
        await updateUserFriends(fromUser.prenom, fromUser.friends)
      }
      if (!toUser.friends.includes(from)) {
        toUser.friends.push(from)
        await updateUserFriends(toUser.prenom, toUser.friends)
      }
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Accept friend by name error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Supprimer une demande d'ami
app.delete('/api/friends/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params
    
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID requis' })
    }
    
    const deletedRequest = await deleteFriendRequest(requestId)
    
    if (!deletedRequest) {
      return res.status(404).json({ error: 'Demande non trouvée' })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Delete friend request error:', error)
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
    let founderCount = 0
    let totalUsers = 0
    
    try {
      founderCount = await getFounderCount()
      totalUsers = await getUserCount()
    } catch (dbError) {
      // Si la base de données n'est pas disponible, utiliser les valeurs par défaut
      console.log('Base de données non disponible, utilisation des valeurs par défaut')
      founderCount = 0
      totalUsers = 0
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

// Fonction de rate limiting
function checkRateLimit(ip) {
  const now = Date.now()
  const attempts = resetAttempts.get(ip) || { count: 0, lastAttempt: 0 }
  
  // Réinitialiser le compteur si le cooldown est passé
  if (now - attempts.lastAttempt > RESET_COOLDOWN) {
    attempts.count = 0
  }
  
  // Vérifier si on dépasse la limite
  if (attempts.count >= MAX_ATTEMPTS) {
    const timeLeft = Math.ceil((RESET_COOLDOWN - (now - attempts.lastAttempt)) / 60000)
    return { allowed: false, timeLeft }
  }
  
  // Incrémenter le compteur
  attempts.count++
  attempts.lastAttempt = now
  resetAttempts.set(ip, attempts)
  
  return { allowed: true }
}

// Mot de passe oublié - Demander la réinitialisation
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
    
    // Vérifier le rate limiting
    const rateLimit = checkRateLimit(clientIP)
    if (!rateLimit.allowed) {
      console.log('🚫 Rate limit atteint pour IP:', clientIP)
      return res.status(429).json({ 
        error: `Trop de tentatives. Réessayez dans ${rateLimit.timeLeft} minutes.` 
      })
    }
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' })
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Adresse email invalide' })
    }
    
    // Vérifier si l'utilisateur existe avec cet email
    let user = null
    try {
      user = await getUserByEmail(email)
      console.log('Utilisateur trouvé pour email:', email, user ? 'Oui' : 'Non')
    } catch (dbError) {
      console.error('⚠️  Erreur base de données lors de la recherche utilisateur:', dbError.message)
      // En mode développement sans DB, on ne peut pas vérifier l'existence
      console.log('📝 Mode développement - impossible de vérifier l\'existence de l\'utilisateur')
    }
    
    if (!user) {
      // En mode développement sans base de données, on peut permettre la réinitialisation
      // avec un email fourni manuellement
      console.log('⚠️  Utilisateur non trouvé en base de données:', email)
      console.log('📝 Mode développement - génération de token pour test')
      
      // Générer un token même sans utilisateur (mode développement)
      const resetToken = nanoid(32)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const frontendUrl = process.env.FRONTEND_URL || 'https://playzio.fr'
      const resetUrl = `${frontendUrl}/?token=${resetToken}`
      
      console.log('🔗 LIEN DE RÉINITIALISATION POUR', email, ':', resetUrl)
      console.log('📧 Copiez ce lien et testez la réinitialisation')
      
      return res.json({ 
        success: true, 
        message: 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.',
        developmentMode: true,
        resetUrl: resetUrl,
        note: 'Mode développement - lien affiché dans les logs'
      })
    }
    
    // Générer un token de réinitialisation SEULEMENT si l'utilisateur existe
    const resetToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
    
    console.log('✅ Token de réinitialisation créé pour utilisateur existant:', user.prenom)
    
             // Sauvegarder le token en base (avec gestion d'erreur)
             try {
               // Créer la table si elle n'existe pas
               await pool.query(`
                 CREATE TABLE IF NOT EXISTS password_reset_tokens (
                     id VARCHAR(50) PRIMARY KEY,
                     user_email VARCHAR(255) NOT NULL,
                     token VARCHAR(255) NOT NULL UNIQUE,
                     expires_at TIMESTAMP NOT NULL,
                     used BOOLEAN DEFAULT FALSE,
                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                 );
               `)
               console.log('✅ Table password_reset_tokens créée/vérifiée')

               // Invalider tous les tokens précédents pour cet utilisateur (sécurité)
               await pool.query('UPDATE password_reset_tokens SET used = true WHERE user_email = $1', [email])
               console.log('🔒 Tokens précédents invalidés pour:', email)

               await createPasswordResetToken(email, resetToken, expiresAt)
               console.log('✅ Nouveau token sauvegardé en base de données')
             } catch (dbError) {
               console.error('⚠️  Erreur base de données (token non sauvegardé):', dbError.message)
               console.log('📝 Le token sera affiché dans les logs pour utilisation immédiate')
             }
    
    // Envoyer l'email
    const frontendUrl = process.env.FRONTEND_URL || 'https://playzio.fr'
    const resetUrl = `${frontendUrl}/?token=${resetToken}`
    
    console.log('Configuration email - SENDGRID_API_KEY présent:', !!process.env.SENDGRID_API_KEY)
    console.log('FROM_EMAIL:', process.env.SENDGRID_FROM_EMAIL || 'playzio.fr@gmail.com')
    console.log('FRONTEND_URL:', frontendUrl)
    
    // Si SendGrid n'est pas configuré, afficher le lien dans les logs
    if (!process.env.SENDGRID_API_KEY) {
      console.log('⚠️  SendGrid non configuré - Lien de réinitialisation affiché dans les logs')
      console.log('🔗 LIEN DE RÉINITIALISATION POUR', email, ':', resetUrl)
      console.log('📧 Copiez ce lien et envoyez-le manuellement à l\'utilisateur')
    } else {
      try {
        console.log('Tentative d\'envoi d\'email à:', email)
        await sendPasswordResetEmail(email, resetToken, frontendUrl)
        console.log('✅ Email envoyé avec succès à:', email)
      } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
        console.error('Détails de l\'erreur:', error.message)
        console.log('🔗 Lien de réinitialisation (en cas d\'erreur email):', resetUrl)
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.' 
    })
  } catch (error) {
    console.error('Erreur forgot password:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Mot de passe oublié - Réinitialiser avec le token
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword, email } = req.body
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis' })
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
    }
    
    console.log('Tentative de réinitialisation avec token:', token)
    
    // Vérifier le token
    let resetToken = null
    try {
      resetToken = await getPasswordResetToken(token)
      console.log('Token trouvé en base:', resetToken ? 'Oui' : 'Non')
    } catch (dbError) {
      console.error('⚠️  Erreur base de données lors de la vérification du token:', dbError.message)
      // En mode développement, on peut permettre la réinitialisation sans vérification de token
      if (!email) {
        return res.status(400).json({ error: 'Email requis en mode développement (base de données non accessible)' })
      }
    }
    
    // Trouver l'utilisateur
    let user = null
    if (resetToken) {
      try {
        user = await getUserByEmail(resetToken.user_email)
      } catch (dbError) {
        console.error('⚠️  Erreur base de données lors de la recherche utilisateur:', dbError.message)
      }
    } else if (email) {
      // Mode développement : utiliser l'email fourni
      try {
        user = await getUserByEmail(email)
        console.log('Mode développement - utilisation de l\'email fourni:', email)
      } catch (dbError) {
        console.error('⚠️  Erreur base de données en mode développement:', dbError.message)
        // En mode développement, créer un utilisateur fictif
        user = {
          prenom: email.split('@')[0], // Utiliser la partie avant @ comme prénom
          email: email,
          password: 'hashed_password'
        }
        console.log('📝 Mode développement - utilisateur fictif créé:', user.prenom)
      }
    }
    
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' })
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = hashPassword(newPassword)
    
    try {
      const updateResult = await updateUserPassword(user.prenom, hashedPassword)
      console.log('✅ Mot de passe mis à jour pour:', user.prenom)
    } catch (updateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe:', updateError.message)
      // En mode développement, on peut simuler le succès
      if (updateError.message.includes('ECONNREFUSED') || updateError.code === 'ECONNREFUSED') {
        console.log('📝 Mode développement - simulation de mise à jour réussie')
        console.log('✅ Mot de passe simulé mis à jour pour:', user.prenom)
      } else {
        console.error('❌ Erreur non gérée:', updateError)
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe' })
      }
    }
    
    // Marquer le token comme utilisé (si disponible)
    if (resetToken) {
      try {
        await markTokenAsUsed(token)
        console.log('✅ Token marqué comme utilisé')
      } catch (markError) {
        console.error('⚠️  Erreur lors du marquage du token:', markError.message)
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Mot de passe mis à jour avec succès' 
    })
  } catch (error) {
    console.error('Erreur reset password:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Nettoyer les tokens expirés (à appeler périodiquement)
app.post('/api/cleanup-tokens', async (req, res) => {
  try {
    const deletedCount = await cleanupExpiredTokens()
    res.json({ 
      success: true, 
      message: `${deletedCount} tokens expirés supprimés` 
    })
  } catch (error) {
    console.error('Erreur cleanup tokens:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Tester la configuration email
app.get('/api/test-email', async (req, res) => {
  try {
    const isWorking = await testEmailConnection()
    res.json({ 
      success: isWorking, 
      message: isWorking ? 'Configuration email OK' : 'Configuration email invalide' 
    })
  } catch (error) {
    console.error('Erreur test email:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Diagnostic de la configuration email
app.get('/api/email-config', async (req, res) => {
  try {
    const config = {
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'playzio.fr@gmail.com',
      frontendUrl: process.env.FRONTEND_URL || 'https://playzio.fr',
      apiKeyLength: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.length : 0
    }
    
    console.log('Configuration email:', config)
    res.json({ config })
  } catch (error) {
    console.error('Erreur config email:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Test de la base de données
app.get('/api/db-test', async (req, res) => {
  try {
    // Test simple de connexion
    const result = await pool.query('SELECT NOW() as current_time')
    const currentTime = result.rows[0].current_time
    
    // Test de la table users
    let usersCount = 0
    try {
      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users')
      usersCount = usersResult.rows[0].count
    } catch (usersError) {
      console.log('Erreur table users:', usersError.message)
    }
    
    // Test de la colonne email
    let hasEmailColumn = false
    try {
      const emailResult = await pool.query('SELECT email FROM users LIMIT 1')
      hasEmailColumn = true
    } catch (emailError) {
      console.log('Colonne email manquante:', emailError.message)
    }
    
    res.json({
      dbConnected: true,
      currentTime,
      usersCount,
      hasEmailColumn,
      message: 'Base de données accessible'
    })
  } catch (error) {
    console.error('Erreur test DB:', error)
    res.status(500).json({ 
      dbConnected: false,
      error: 'Base de données non accessible',
      details: error.message
    })
  }
})

// Test d'envoi d'email réel
app.post('/api/test-send-email', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(400).json({ error: 'Email requis' })
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://playzio.fr'
    const testToken = 'test-token-123'
    
    console.log('Tentative d\'envoi d\'email de test à:', email)
    await sendPasswordResetEmail(email, testToken, frontendUrl)
    res.json({ success: true, message: 'Email de test envoyé avec succès' })
  } catch (error) {
    console.error('Erreur envoi email test:', error)
    res.status(500).json({ error: 'Erreur envoi email: ' + error.message })
  }
})

// Test de sécurité - simuler un utilisateur existant
app.post('/api/test-security', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' })
    }
    
    // Simuler un utilisateur existant pour le test
    const mockUser = {
      prenom: 'TestUser',
      email: email,
      password: 'hashed_password'
    }
    
    console.log('🔒 TEST DE SÉCURITÉ - Simulation utilisateur existant:', email)
    
    // Générer un token de test
    const resetToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const frontendUrl = process.env.FRONTEND_URL || 'https://playzio.fr'
    const resetUrl = `${frontendUrl}/?token=${resetToken}`
    
    console.log('✅ Token de test généré:', resetToken)
    console.log('🔗 Lien de réinitialisation:', resetUrl)
    
    res.json({
      success: true,
      message: 'Test de sécurité - Token généré pour utilisateur simulé',
      user: mockUser.prenom,
      token: resetToken,
      resetUrl: resetUrl,
      expiresAt: expiresAt.toISOString(),
      securityNote: 'Ceci est un test - en production, seul l\'utilisateur recevrait ce lien par email'
    })
  } catch (error) {
    console.error('Erreur test sécurité:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Test de réinitialisation en mode développement
app.post('/api/test-reset-dev', async (req, res) => {
  try {
    const { email, newPassword } = req.body
    
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email et nouveau mot de passe requis' })
    }
    
    console.log('🧪 TEST RÉINITIALISATION DEV - Email:', email)
    
    // Créer un utilisateur fictif
    const user = {
      prenom: email.split('@')[0],
      email: email,
      password: 'hashed_password'
    }
    
    console.log('📝 Utilisateur fictif créé:', user.prenom)
    
    // Hasher le nouveau mot de passe
    const hashedPassword = hashPassword(newPassword)
    console.log('🔒 Mot de passe hashé:', hashedPassword.substring(0, 20) + '...')
    
    // Simuler la mise à jour
    console.log('✅ Simulation de mise à jour réussie pour:', user.prenom)
    
    res.json({
      success: true,
      message: 'Test de réinitialisation en mode développement réussi',
      user: user.prenom,
      email: user.email,
      passwordUpdated: true
    })
  } catch (error) {
    console.error('Erreur test reset dev:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Lister les utilisateurs (pour diagnostic)
app.get('/api/users-list', async (req, res) => {
  try {
    const users = await getAllUsers()
    const userList = users.map(user => ({
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      is_founder: user.is_founder
    }))
    
    console.log('📋 Liste des utilisateurs:', userList.length, 'utilisateurs trouvés')
    
    res.json({
      success: true,
      count: userList.length,
      users: userList
    })
  } catch (error) {
    console.error('Erreur liste utilisateurs:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: error.message
    })
  }
})

// Diagnostiquer un token de réinitialisation
app.post('/api/debug-token', async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({ error: 'Token requis' })
    }
    
    console.log('🔍 DIAGNOSTIC TOKEN:', token)
    
    // Vérifier le token en base
    let resetToken = null
    try {
      resetToken = await getPasswordResetToken(token)
      console.log('✅ Token trouvé en base:', resetToken ? 'Oui' : 'Non')
    } catch (dbError) {
      console.error('❌ Erreur base de données:', dbError.message)
    }
    
    if (resetToken) {
      const now = new Date()
      const isExpired = now > new Date(resetToken.expires_at)
      const isUsed = resetToken.used
      
      console.log('📊 État du token:')
      console.log('- Expiré:', isExpired)
      console.log('- Utilisé:', isUsed)
      console.log('- Expire le:', resetToken.expires_at)
      console.log('- Email:', resetToken.user_email)
      
      res.json({
        success: true,
        token: token,
        found: true,
        expired: isExpired,
        used: isUsed,
        expiresAt: resetToken.expires_at,
        userEmail: resetToken.user_email,
        createdAt: resetToken.created_at
      })
    } else {
      console.log('❌ Token non trouvé en base de données')
      res.json({
        success: true,
        token: token,
        found: false,
        message: 'Token non trouvé en base de données'
      })
    }
  } catch (error) {
    console.error('Erreur diagnostic token:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Migration pour créer la table password_reset_tokens
app.post('/api/migrate-password-tokens', async (req, res) => {
  try {
    console.log('🔄 Début de la migration password_reset_tokens...')
    
    // Créer la table password_reset_tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id VARCHAR(50) PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    
    // Créer les index
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email 
      ON password_reset_tokens(user_email);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
      ON password_reset_tokens(token);
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires 
      ON password_reset_tokens(expires_at);
    `)
    
    console.log('✅ Migration réussie : table password_reset_tokens créée')
    
    // Vérifier que la table existe
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'password_reset_tokens';
    `)
    
    res.json({
      success: true,
      message: 'Table password_reset_tokens créée avec succès',
      tableExists: result.rows.length > 0
    })
    
  } catch (error) {
    console.error('❌ Erreur migration password_reset_tokens:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la migration',
      details: error.message
    })
  }
})

// Récupérer le dernier token généré pour un email
app.get('/api/last-token/:email', async (req, res) => {
  try {
    const { email } = req.params
    
    const result = await pool.query(`
      SELECT token, expires_at, created_at, used 
      FROM password_reset_tokens 
      WHERE user_email = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [email])
    
    if (result.rows.length > 0) {
      const token = result.rows[0]
      res.json({
        success: true,
        token: token.token,
        expiresAt: token.expires_at,
        createdAt: token.created_at,
        used: token.used,
        resetUrl: `https://playzio.fr/?token=${token.token}`
      })
    } else {
      res.json({
        success: false,
        message: 'Aucun token trouvé pour cet email'
      })
    }
  } catch (error) {
    console.error('Erreur récupération dernier token:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: error.message
    })
  }
})

// Test direct de création de token
app.post('/api/test-create-token', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' })
    }
    
    console.log('🧪 TEST CRÉATION TOKEN pour:', email)
    
    // Créer la table si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id VARCHAR(50) PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('✅ Table vérifiée/créée')
    
    // Générer un token de test
    const testToken = nanoid(32)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const id = nanoid()
    
    console.log('🔑 Token généré:', testToken)
    console.log('⏰ Expire le:', expiresAt)
    
    // Insérer directement
    const result = await pool.query(
      'INSERT INTO password_reset_tokens (id, user_email, token, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, email, testToken, expiresAt]
    )
    
    console.log('✅ Token inséré avec succès:', result.rows[0])
    
    res.json({
      success: true,
      token: testToken,
      expiresAt: expiresAt,
      id: id,
      resetUrl: `https://playzio.fr/?token=${testToken}`
    })
    
  } catch (error) {
    console.error('❌ Erreur test création token:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: error.message
    })
  }
})

// Migration pour ajouter la colonne visible_to_friends
app.post('/api/migrate-visible-to-friends', async (req, res) => {
  try {
    console.log('🔄 Début de la migration visible_to_friends...')
    
    // Ajouter la colonne visible_to_friends si elle n'existe pas
    await pool.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'slots' AND column_name = 'visible_to_friends') THEN
              ALTER TABLE slots ADD COLUMN visible_to_friends BOOLEAN DEFAULT FALSE;
              RAISE NOTICE 'Colonne visible_to_friends ajoutée à la table slots.';
          ELSE
              RAISE NOTICE 'La colonne visible_to_friends existe déjà dans la table slots.';
          END IF;
      END $$;
    `)
    
    console.log('✅ Migration réussie : colonne visible_to_friends ajoutée')
    
    // Vérifier que la colonne existe
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'slots' AND column_name = 'visible_to_friends';
    `)
    
    res.json({
      success: true,
      message: 'Colonne visible_to_friends créée avec succès',
      columnInfo: result.rows[0] || null
    })
    
  } catch (error) {
    console.error('❌ Erreur migration visible_to_friends:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la migration',
      details: error.message
    })
  }
})

// Migration pour créer les tables d'amis
app.post('/api/migrate-friends-tables', async (req, res) => {
  try {
    console.log('🔄 Début de la migration des tables d\'amis...')
    
    // Créer la table friend_requests si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friend_requests (
          id VARCHAR(50) PRIMARY KEY,
          from_user VARCHAR(255) NOT NULL,
          to_user VARCHAR(255) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(from_user, to_user)
      );
    `)
    
    // Créer la table friends si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS friends (
          id VARCHAR(50) PRIMARY KEY,
          user1 VARCHAR(255) NOT NULL,
          user2 VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user1, user2),
          CHECK(user1 < user2)
      );
    `)
    
    // Ajouter la colonne friends à la table users si elle n'existe pas
    await pool.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'friends') THEN
              ALTER TABLE users ADD COLUMN friends TEXT DEFAULT '[]';
              RAISE NOTICE 'Colonne friends ajoutée à la table users.';
          ELSE
              RAISE NOTICE 'La colonne friends existe déjà dans la table users.';
          END IF;
      END $$;
    `)
    
    console.log('✅ Migration réussie : tables d\'amis créées')
    
    // Vérifier que les tables existent
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('friend_requests', 'friends');
    `)
    
    res.json({
      success: true,
      message: 'Tables d\'amis créées avec succès',
      tables: tablesResult.rows.map(row => row.table_name)
    })
    
  } catch (error) {
    console.error('❌ Erreur migration tables d\'amis:', error)
    res.status(500).json({ 
      success: false,
      error: 'Erreur lors de la migration',
      details: error.message
    })
  }
})

app.listen(port, () => {
  console.log(`🚀 Playzio Backend listening on port ${port}`)
})
