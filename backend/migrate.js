import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  initDatabase,
  createUser,
  createSlot,
  createGroup,
  createFriendRequest,
  closeDatabase
} from './database.js'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Fonction pour hasher les mots de passe (même que server.js)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

// Lire les données JSON existantes
function readJSONData() {
  try {
    const dbFile = fs.existsSync(path.join(__dirname, 'db.json')) 
      ? 'db.json' 
      : 'db.example.json'
    const data = fs.readFileSync(path.join(__dirname, dbFile), 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('❌ Erreur lecture JSON:', error)
    return { slots: [], users: [], friendRequests: [], groups: [] }
  }
}

async function migrateData() {
  try {
    console.log('🚀 Début de la migration JSON → PostgreSQL...')
    
    // Initialiser la base PostgreSQL
    await initDatabase()
    
    // Lire les données JSON
    const jsonData = readJSONData()
    console.log(`📊 Données trouvées: ${jsonData.users?.length || 0} users, ${jsonData.slots?.length || 0} slots, ${jsonData.groups?.length || 0} groups, ${jsonData.friendRequests?.length || 0} friend requests`)
    
    // Migrer les utilisateurs
    if (jsonData.users && jsonData.users.length > 0) {
      console.log('👥 Migration des utilisateurs...')
      for (const user of jsonData.users) {
        try {
          await createUser({
            prenom: user.prenom,
            email: user.email,
            password: user.password || hashPassword('defaultpassword'), // Fallback si pas de mot de passe
            role: user.role || 'user'
          })
          console.log(`  ✅ ${user.prenom}`)
        } catch (error) {
          console.log(`  ⚠️  ${user.prenom} (probablement déjà existant)`)
        }
      }
    }
    
    // Migrer les groupes
    if (jsonData.groups && jsonData.groups.length > 0) {
      console.log('👥 Migration des groupes...')
      for (const group of jsonData.groups) {
        try {
          await createGroup({
            id: group.id,
            name: group.name,
            description: group.description || '',
            creator: group.creator,
            members: group.members || [group.creator]
          })
          console.log(`  ✅ ${group.name}`)
        } catch (error) {
          console.log(`  ⚠️  ${group.name} (erreur: ${error.message})`)
        }
      }
    }
    
    // Migrer les slots
    if (jsonData.slots && jsonData.slots.length > 0) {
      console.log('📅 Migration des créneaux...')
      for (const slot of jsonData.slots) {
        try {
          await createSlot({
            id: slot.id,
            date: slot.date,
            heureDebut: slot.heureDebut,
            heureFin: slot.heureFin,
            type: slot.type,
            description: slot.description || '',
            createdBy: slot.createdBy,
            visibleToGroups: slot.visibleToGroups || [],
            participants: slot.participants || []
          })
          console.log(`  ✅ Slot ${slot.date} ${slot.heureDebut || ''} (${slot.type || 'no-type'})`)
        } catch (error) {
          console.log(`  ⚠️  Slot ${slot.date} (erreur: ${error.message})`)
        }
      }
    }
    
    // Migrer les demandes d'amis
    if (jsonData.friendRequests && jsonData.friendRequests.length > 0) {
      console.log('🤝 Migration des demandes d\'amis...')
      for (const request of jsonData.friendRequests) {
        try {
          await createFriendRequest({
            id: request.id,
            from: request.from,
            to: request.to
          })
          console.log(`  ✅ ${request.from} → ${request.to}`)
        } catch (error) {
          console.log(`  ⚠️  ${request.from} → ${request.to} (erreur: ${error.message})`)
        }
      }
    }
    
    console.log('🎉 Migration terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur durant la migration:', error)
  } finally {
    await closeDatabase()
    process.exit(0)
  }
}

// Lancer la migration
migrateData()
