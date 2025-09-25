import React, { useState, useEffect } from 'react'
import './DaySlotsModal.css'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import SlotList from './SlotList'
import AddSlot from './AddSlot'

function DaySlotsModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  currentUser, 
  pageType, // 'mes-dispos', 'dispos-amis', 'dispos-groupes', 'dispos-publiques'
  onJoinSlot,
  customSlots
}) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddSlot, setShowAddSlot] = useState(false)

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchDaySlots()
    }
  }, [isOpen, selectedDate, pageType, customSlots])

  const fetchDaySlots = async () => {
    try {
      setLoading(true)
      setError('')
      
      let filteredSlots = []
      
      if (customSlots && customSlots.length > 0) {
        // Utiliser les slots déjà filtrés par le composant parent
        console.log('📥 Utilisation des customSlots:', customSlots.length)
        filteredSlots = customSlots
      } else {
        // Récupérer TOUS les slots depuis l'API
        const url = `${API_BASE_URL}/api/slots`
        const response = await fetch(url)
        
        if (response.ok) {
          const allSlots = await response.json()
          console.log('📥 Tous les slots reçus:', allSlots.length)
          
          // Filtrer selon le type de page
          switch (pageType) {
            case 'mes-dispos':
              // Mes propres slots
              filteredSlots = allSlots.filter(slot => slot.createdBy === currentUser.prenom)
              break
            case 'dispos-amis':
              // Slots des amis (visibleToFriends = true ET organisateur dans mes amis)
              const userFriends = await getUserFriends()
              filteredSlots = allSlots.filter(slot => 
                slot.visibleToFriends === true && 
                userFriends.includes(slot.createdBy) &&
                slot.createdBy !== currentUser.prenom
              )
              break
            case 'dispos-groupes':
              // Slots des groupes (visibleToGroups contient un groupe dont je fais partie)
              const userGroups = await getUserGroups()
              const userGroupIds = userGroups.map(group => group.id)
              filteredSlots = allSlots.filter(slot => 
                slot.visibleToGroups && 
                slot.visibleToGroups.length > 0 &&
                slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId)) &&
                slot.createdBy !== currentUser.prenom
              )
              break
            case 'dispos-publiques':
              // Slots publics (visibleToAll = true) créés par d'autres
              filteredSlots = allSlots.filter(slot => 
                slot.visibleToAll === true && 
                slot.createdBy !== currentUser.prenom
              )
              break
            default:
              filteredSlots = allSlots
          }
        } else {
          setError('Erreur lors du chargement des disponibilités')
          return
        }
      }
      
      // Filtrer par date sélectionnée
      const daySlots = filteredSlots.filter(slot => slot.date === selectedDate)
      console.log(`✅ Slots du jour (${pageType}):`, daySlots.length)
      setSlots(daySlots)
    } catch (error) {
      console.error('Erreur lors du chargement des slots:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les amis de l'utilisateur
  const getUserFriends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/${currentUser.prenom}`)
      if (response.ok) {
        const data = await response.json()
        return data.friends || []
      }
      return []
    } catch (error) {
      console.error('Erreur lors de la récupération des amis:', error)
      return []
    }
  }

  // Fonction pour récupérer les groupes de l'utilisateur
  const getUserGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/user/${currentUser.prenom}`)
      if (response.ok) {
        const data = await response.json()
        return data.groups || []
      }
      return []
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes:', error)
      return []
    }
  }

  const handleJoinSlot = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant: currentUser.prenom })
      })

      if (response.ok) {
        // Mettre à jour localement le slot modifié
        setSlots(prevSlots => 
          prevSlots.map(slot => 
            slot.id === slotId 
              ? { ...slot, participants: [...(slot.participants || []), currentUser.prenom] }
              : slot
          )
        )
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erreur lors de la participation')
      }
    } catch (error) {
      console.error('Erreur lors de la participation:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  const handleLeaveSlot = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant: currentUser.prenom })
      })

      if (response.ok) {
        // Mettre à jour localement le slot modifié
        setSlots(prevSlots => 
          prevSlots.map(slot => 
            slot.id === slotId 
              ? { ...slot, participants: (slot.participants || []).filter(p => p !== currentUser.prenom) }
              : slot
          )
        )
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erreur lors de la sortie')
      }
    } catch (error) {
      console.error('Erreur lors de la sortie:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  const handleAddSlot = () => {
    setShowAddSlot(true)
  }

  const handleSlotAdded = () => {
    setShowAddSlot(false)
    fetchDaySlots() // Rafraîchir la liste des slots
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('fr-FR', options)
  }

  const getPageTitle = () => {
    switch (pageType) {
      case 'mes-dispos':
        return 'Mes Disponibilités'
      case 'dispos-amis':
        return 'Disponibilités des Amis'
      case 'dispos-groupes':
        return 'Disponibilités des Groupes'
      case 'dispos-publiques':
        return 'Disponibilités Publiques'
      default:
        return 'Disponibilités'
    }
  }

  if (!isOpen) return null

  if (showAddSlot) {
    return (
      <div className="day-slots-modal-overlay" onClick={() => setShowAddSlot(false)}>
        <div className="day-slots-modal" onClick={(e) => e.stopPropagation()}>
          <div className="day-slots-header">
            <button className="close-btn" onClick={() => setShowAddSlot(false)}>×</button>
          </div>
          <div className="day-slots-content">
            <AddSlot 
              activity="Tous"
              currentUser={currentUser}
              onSlotAdded={handleSlotAdded}
              preSelectedDate={selectedDate}
              onClearDate={() => setShowAddSlot(false)}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="day-slots-modal-overlay" onClick={onClose}>
      <div className="day-slots-modal" onClick={(e) => e.stopPropagation()}>
        <div className="day-slots-header">
          <button className="add-slot-btn" onClick={handleAddSlot} title="Ajouter une disponibilité">
            +
          </button>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="day-slots-content">
          {loading ? (
            <div className="loading">Chargement des disponibilités...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : slots.length === 0 ? (
            <div className="no-slots">
              <p>Aucune disponibilité pour cette date</p>
            </div>
          ) : (
            <div className="day-slots-list-container">
              <SlotList 
                activity="Tous"
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => {}}
                searchFilter=""
                onSearchFilterChange={() => {}}
                lieuFilter=""
                organizerFilter=""
                onAddSlot={() => {}}
                onJoinSlot={handleJoinSlot}
                onLeaveSlot={handleLeaveSlot}
                customSlots={slots}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DaySlotsModal
