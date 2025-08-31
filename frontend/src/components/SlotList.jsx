import React, { useState, useEffect } from 'react'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import { trackSlotJoin, trackSlotLeave } from '../utils/analytics'

function SlotList({ activity, currentUser, selectedDate, onClearDate }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSlots()
  }, [activity, selectedDate])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      console.log('Fetching slots for activity:', activity, 'user:', currentUser.prenom, 'selectedDate:', selectedDate)
      const response = await fetch(`${API_BASE_URL}/api/slots?type=${encodeURIComponent(activity.toLowerCase())}&user=${encodeURIComponent(currentUser.prenom)}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Raw data from API:', data)
        // Filtrer par date si une date est sélectionnée
        const filteredData = selectedDate 
          ? data.filter(slot => slot.date === selectedDate)
          : data
        console.log('Filtered data:', filteredData)
        setSlots(filteredData)
      } else {
        setError('Erreur lors du chargement des disponibilités')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSlot = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant: currentUser.prenom }),
      })

      if (response.ok) {
        trackSlotJoin(activity)
        alert('Vous avez rejoint cette disponibilité !')
        fetchSlots()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la participation')
      }
    } catch (error) {
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
        body: JSON.stringify({ participant: currentUser.prenom }),
      })

      if (response.ok) {
        trackSlotLeave(activity)
        alert('Vous avez quitté cette disponibilité')
        fetchSlots()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la sortie')
      }
    } catch (error) {
      alert('Erreur de connexion au serveur')
    }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userRole: currentUser.role,
          createdBy: currentUser.prenom 
        }),
      })

      if (response.ok) {
        alert('Disponibilité supprimée avec succès')
        fetchSlots()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      alert('Erreur de connexion au serveur')
    }
  }

  if (loading) {
    return (
      <div className="slot-list">
        <div className="loading">Chargement des disponibilités...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="slot-list">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="slot-list">
      <div className="slot-list-header">
        <h3>Disponibilités {activity}</h3>
        {selectedDate ? (
          <div className="selected-date-info">
            <p>📅 Disponibilités du {selectedDate.split('-').reverse().join('/')}</p>
            <button 
              className="clear-date-btn"
              onClick={() => {
                // Effacer la sélection de date
                if (onClearDate) {
                  onClearDate()
                }
                // Recharger les données
                fetchSlots()
              }}
              title="Afficher toutes les disponibilités"
            >
              ✕ Voir toutes les disponibilités
            </button>
          </div>
        ) : (
          <p>{slots.length} disponibilité{slots.length !== 1 ? 's' : ''} trouvée{slots.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {slots.length === 0 ? (
        <div className="no-slots">
          <p>Aucune disponibilité pour {activity} pour le moment.</p>
          <p>Soyez le premier à en créer une !</p>
        </div>
      ) : (
        <div className="slots-grid">
          {slots.map(slot => {
            const isParticipant = slot.participants && slot.participants.includes(currentUser.prenom)
            const isOwner = slot.createdBy === currentUser.prenom
            const isAdmin = currentUser.role === 'admin'
            
            return (
              <div key={slot.id} className="slot-card">
                <div className="slot-header">
                  <div className="slot-date">
                    <span className="date">{slot.date.split('-').reverse().join('/')}</span>
                    <span className="time">{slot.heureDebut} - {slot.heureFin}</span>
                  </div>
                  <div className="slot-activity">
                    {Array.isArray(slot.type) ? slot.type.join(', ') : slot.type}
                  </div>
                </div>

                <div className="slot-content">
                  
                  {slot.description && (
                    <div className="slot-description">
                      {slot.description}
                    </div>
                  )}

                  <div className="slot-participants">
                    <span>👥 {slot.participants ? slot.participants.length : 0} participant{(slot.participants ? slot.participants.length : 0) !== 1 ? 's' : ''}</span>
                    {slot.participants && slot.participants.length > 0 && (
                      <div className="participants-list">
                        {slot.participants.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="slot-actions">
                  <div className="action-buttons">
                    {isParticipant ? (
                      <button 
                        className="leave-btn"
                        onClick={() => handleLeaveSlot(slot.id)}
                      >
                        Quitter
                      </button>
                    ) : (
                      <button 
                        className="join-btn"
                        onClick={() => handleJoinSlot(slot.id)}
                      >
                        Rejoindre
                      </button>
                    )}
                    
                    {(isAdmin || isOwner) && (
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  
                  {isOwner && (
                    <span className="owner-badge">Vous êtes l'organisateur</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SlotList