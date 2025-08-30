import React, { useState, useEffect } from 'react'
import './Agenda.css'
import { API_BASE_URL } from '../config'

function Agenda({ activity, currentUser }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSlots()
  }, [activity])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/slots?activity=${encodeURIComponent(activity)}`)
      
      if (response.ok) {
        const data = await response.json()
        // Trier les créneaux par date et heure
        const sortedSlots = data.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateA - dateB
        })
        setSlots(sortedSlots)
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
        body: JSON.stringify({ userId: currentUser.id }),
      })

      if (response.ok) {
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
        body: JSON.stringify({ userId: currentUser.id }),
      })

      if (response.ok) {
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain'
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      })
    }
  }

  const groupSlotsByDate = () => {
    const grouped = {}
    slots.forEach(slot => {
      const dateKey = slot.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(slot)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="agenda">
        <div className="loading">Chargement de l'agenda...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="agenda">
        <div className="error">{error}</div>
      </div>
    )
  }

  const groupedSlots = groupSlotsByDate()
  const sortedDates = Object.keys(groupedSlots).sort()

  return (
    <div className="agenda">
      <div className="agenda-header">
        <h3>Agenda {activity}</h3>
        <p>{slots.length} disponibilité{slots.length !== 1 ? 's' : ''} programmée{slots.length !== 1 ? 's' : ''}</p>
      </div>

      {slots.length === 0 ? (
        <div className="no-slots">
          <p>Aucune disponibilité pour {activity} pour le moment.</p>
          <p>Soyez le premier à en créer une !</p>
        </div>
      ) : (
        <div className="agenda-timeline">
          {sortedDates.map(date => (
            <div key={date} className="agenda-day">
              <div className="day-header">
                <h4>{formatDate(date)}</h4>
                <span className="day-count">
                  {groupedSlots[date].length} créneau{groupedSlots[date].length !== 1 ? 'x' : ''}
                </span>
              </div>
              
              <div className="day-slots">
                {groupedSlots[date].map(slot => {
                  const isParticipant = slot.participants && slot.participants.includes(currentUser.id)
                  const isOwner = slot.userId === currentUser.id
                  
                  return (
                    <div key={slot.id} className="agenda-slot">
                      <div className="slot-time">
                        <span className="time">{slot.time}</span>
                      </div>
                      
                      <div className="slot-content">
                        <div className="slot-info">
                          <div className="slot-location">
                            <strong>📍 {slot.location}</strong>
                          </div>
                          
                          {slot.description && (
                            <div className="slot-description">
                              {slot.description}
                            </div>
                          )}
                          
                          <div className="slot-meta">
                            <span className="organizer">👤 {slot.user}</span>
                            <span className="participants">
                              👥 {slot.participants ? slot.participants.length : 0} participant{(slot.participants ? slot.participants.length : 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="slot-action">
                          {isOwner ? (
                            <span className="owner-badge">Organisateur</span>
                          ) : isParticipant ? (
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
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Agenda