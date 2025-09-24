import React, { useState, useEffect } from 'react'
import './DaySlotsModal.css'
import { API_BASE_URL } from '../config'

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
  const [expandedSlots, setExpandedSlots] = useState(new Set())
  const [selectedSlot, setSelectedSlot] = useState(null)

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchDaySlots()
    }
  }, [isOpen, selectedDate, pageType])

  const fetchDaySlots = async () => {
    try {
      setLoading(true)
      setError('')
      
      let url = ''
      let body = {}
      
      // Déterminer l'endpoint selon le type de page
      switch (pageType) {
        case 'mes-dispos':
          url = `${API_BASE_URL}/api/slots/my-slots`
          body = { userId: currentUser.prenom }
          break
        case 'dispos-amis':
          url = `${API_BASE_URL}/api/slots/friends-slots`
          body = { userId: currentUser.prenom }
          break
        case 'dispos-groupes':
          url = `${API_BASE_URL}/api/slots/group-slots`
          body = { userId: currentUser.prenom }
          break
        case 'dispos-publiques':
          url = `${API_BASE_URL}/api/slots/public-slots`
          body = { userId: currentUser.prenom }
          break
        default:
          throw new Error('Type de page non reconnu')
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        const allSlots = await response.json()
        // Filtrer par date sélectionnée
        const daySlots = allSlots.filter(slot => slot.date === selectedDate)
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

  const toggleSlotExpansion = (slotId) => {
    setExpandedSlots(prev => {
      const newSet = new Set(prev)
      if (newSet.has(slotId)) {
        newSet.delete(slotId)
      } else {
        newSet.add(slotId)
      }
      return newSet
    })
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

  const handleLeaveSlot = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.prenom })
      })

      if (response.ok) {
        // Rafraîchir les slots après avoir quitté
        fetchDaySlots()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erreur lors de la sortie')
      }
    } catch (error) {
      console.error('Erreur lors de la sortie:', error)
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
          <h2>{getPageTitle()} - {formatDate(selectedDate)}</h2>
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
            <div className="day-slots-list">
              {slots.map(slot => {
                const isParticipant = slot.participants && slot.participants.includes(currentUser.prenom)
                const isOwner = slot.createdBy === currentUser.prenom
                const isExpanded = expandedSlots.has(slot.id)
                
                return (
                  <div key={slot.id} className={`day-slot-item ${isExpanded ? 'expanded' : ''}`}>
                    <div className="day-slot-header" onClick={() => toggleSlotExpansion(slot.id)}>
                      <div className="day-slot-main">
                        <div className="day-slot-time">
                          <span className="time">{slot.heureDebut} - {slot.heureFin}</span>
                        </div>
                        <div className="day-slot-activity">
                          {slot.customActivity || (Array.isArray(slot.type) ? slot.type.join(', ') : slot.type)}
                        </div>
                        <div className="day-slot-participants">
                          👥 {slot.participants ? slot.participants.length : 0}
                        </div>
                      </div>
                      
                      {!isOwner && (
                        <div className="day-slot-actions">
                          {isParticipant ? (
                            <button 
                              className="quick-action-btn leave-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLeaveSlot(slot.id)
                              }}
                              title="Quitter"
                            >
                              Quitter
                            </button>
                          ) : (
                            <button 
                              className="quick-action-btn join-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleJoinSlot(slot.id)
                              }}
                              title="Rejoindre"
                            >
                              Rejoindre
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="expand-icon" onClick={(e) => {
                      e.stopPropagation()
                      toggleSlotExpansion(slot.id)
                    }}>
                      {isExpanded ? '▲' : '▼'}
                    </div>

                    {isExpanded && (
                      <div className="day-slot-details">
                        <div className="slot-activity-detail">
                          <strong>Activité:</strong> {slot.customActivity || (Array.isArray(slot.type) ? slot.type.join(', ') : slot.type)}
                        </div>

                        <div className="slot-description">
                          <strong>Description:</strong> {slot.description || 'Aucune description'}
                        </div>

                        {slot.lieu && (
                          <div className="slot-lieu">
                            <strong>Lieu:</strong> {slot.lieu}
                          </div>
                        )}

                        <div className="slot-participants-detail">
                          <strong>Participants ({slot.participants ? slot.participants.length : 0}):</strong>
                          {slot.participants && slot.participants.length > 0 ? (
                            <div className="participants-list">
                              {slot.participants.join(', ')}
                            </div>
                          ) : (
                            <span>Aucun participant pour le moment</span>
                          )}
                        </div>

                        <div className="slot-organizer">
                          <strong>Organisateur:</strong> {slot.createdBy}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DaySlotsModal
