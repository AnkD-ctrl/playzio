import React, { useState, useEffect } from 'react'
import './DaySlotsModal.css'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import SlotList from './SlotList'

function DaySlotsModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  currentUser, 
  pageType, // 'mes-dispos', 'dispos-amis', 'dispos-groupes', 'dispos-publiques'
  onJoinSlot 
}) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchDaySlots()
    }
  }, [isOpen, selectedDate, pageType])

  const fetchDaySlots = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Récupérer TOUS les slots depuis l'API
      const url = `${API_BASE_URL}/api/slots`
      const response = await fetch(url)
      
      if (response.ok) {
        const allSlots = await response.json()
        console.log('📥 Tous les slots reçus:', allSlots.length)
        
        // Filtrer selon le type de page
        let filteredSlots = []
        
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
            // Slots publics (visibleToAll = true)
            filteredSlots = allSlots.filter(slot => slot.visibleToAll === true)
            break
          default:
            filteredSlots = allSlots
        }
        
        // Filtrer par date sélectionnée
        const daySlots = filteredSlots.filter(slot => slot.date === selectedDate)
        console.log(`✅ Slots du jour (${pageType}):`, daySlots.length)
        setSlots(daySlots)
      } else {
        setError('Erreur lors du chargement des disponibilités')
      }
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
        body: JSON.stringify({ userId: currentUser.prenom })
      })

      if (response.ok) {
        // Rafraîchir les slots après avoir rejoint
        fetchDaySlots()
        if (onJoinSlot) {
          onJoinSlot(slotId)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erreur lors de la participation')
      }
    } catch (error) {
      console.error('Erreur lors de la participation:', error)
      alert('Erreur de connexion au serveur')
    }
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

  return (
    <div className="day-slots-modal-overlay" onClick={onClose}>
      <div className="day-slots-modal" onClick={(e) => e.stopPropagation()}>
        <div className="day-slots-header">
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
