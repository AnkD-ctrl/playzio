import React, { useState, useEffect } from 'react'
import './DisposGroupes.css'
import { API_BASE_URL } from '../config'

function DisposGroupes({ currentUser, onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState('Tous')
  const [selectedDate, setSelectedDate] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [filterVersion, setFilterVersion] = useState(0)

  // Récupérer les slots des groupes
  useEffect(() => {
    const fetchGroupSlots = async () => {
      if (!currentUser) return

      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/slots/group-slots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            activity: selectedActivity === 'Tous' ? null : selectedActivity,
            date: selectedDate,
            search: searchFilter,
            lieu: lieuFilter,
            organizer: organizerFilter
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setSlots(data.slots || [])
          setError(null)
        } else {
          setError(data.error || 'Erreur lors du chargement des disponibilités des groupes')
        }
      } catch (err) {
        setError('Erreur de connexion')
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupSlots()
  }, [currentUser, selectedActivity, selectedDate, searchFilter, lieuFilter, organizerFilter, filterVersion])

  const handleJoinSlot = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant: currentUser.prenom
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setFilterVersion(prev => prev + 1)
        console.log('Slot rejoint avec succès')
      } else {
        console.error('Erreur lors de la jointure du slot:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la jointure du slot:', error)
    }
  }

  const handleLeaveSlot = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant: currentUser.prenom
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setFilterVersion(prev => prev + 1)
        console.log('Slot quitté avec succès')
      } else {
        console.error('Erreur lors de la sortie du slot:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la sortie du slot:', error)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString.substring(0, 5)
  }

  const isUserParticipant = (participants) => {
    return participants && participants.some(p => p === currentUser.prenom)
  }

  const filteredSlots = slots.filter(slot => {
    if (selectedDate && slot.date !== selectedDate) return false
    if (searchFilter && !slot.activity.toLowerCase().includes(searchFilter.toLowerCase())) return false
    if (lieuFilter && !slot.lieu.toLowerCase().includes(lieuFilter.toLowerCase())) return false
    if (organizerFilter && !slot.organizer.toLowerCase().includes(organizerFilter.toLowerCase())) return false
    return true
  })

  const activities = [...new Set(slots.map(slot => slot.activity))].sort()

  if (loading) {
    return (
      <div className="dispos-groupes-container">
        <div className="loading">Chargement des disponibilités des groupes...</div>
      </div>
    )
  }

  return (
    <div className="dispos-groupes-container">
      <div className="dispos-groupes-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <h2>Disponibilités des Groupes</h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label>Activité</label>
          <select 
            value={selectedActivity} 
            onChange={(e) => setSelectedActivity(e.target.value)}
          >
            <option value="Tous">Toutes les activités</option>
            {activities.map(activity => (
              <option key={activity} value={activity}>{activity}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Date</label>
          <input 
            type="date" 
            value={selectedDate || ''} 
            onChange={(e) => setSelectedDate(e.target.value || null)}
          />
        </div>

        <div className="filter-group">
          <label>Recherche</label>
          <input 
            type="text" 
            placeholder="Rechercher une activité..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Lieu</label>
          <input 
            type="text" 
            placeholder="Rechercher un lieu..."
            value={lieuFilter}
            onChange={(e) => setLieuFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Organisateur</label>
          <input 
            type="text" 
            placeholder="Rechercher un organisateur..."
            value={organizerFilter}
            onChange={(e) => setOrganizerFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="slots-list">
        {filteredSlots.length === 0 ? (
          <div className="no-slots">
            Aucune disponibilité de groupe trouvée
          </div>
        ) : (
          filteredSlots.map(slot => (
            <div key={slot.id} className="slot-card">
              <div className="slot-header">
                <h3>{slot.activity}</h3>
                <span className="slot-date">{formatDate(slot.date)}</span>
              </div>
              
              <div className="slot-details">
                <div className="slot-info">
                  <span className="slot-time">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                  <span className="slot-lieu">{slot.lieu}</span>
                  <span className="slot-organizer">Organisé par {slot.organizer}</span>
                </div>
                
                <div className="slot-participants">
                  <span className="participants-count">
                    {slot.participants ? slot.participants.length : 0}/{slot.maxParticipants} participants
                  </span>
                  <div className="participants-list">
                    {slot.participants && slot.participants.map((participant, index) => (
                      <span key={index} className="participant">
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="slot-actions">
                {isUserParticipant(slot.participants) ? (
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
                    disabled={slot.participants && slot.participants.length >= slot.maxParticipants}
                  >
                    Rejoindre
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DisposGroupes
