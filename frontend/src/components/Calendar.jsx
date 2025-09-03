import React, { useState, useEffect } from 'react'
import './Calendar.css'
import { API_BASE_URL } from '../config'

function Calendar({ activity, currentUser, onDateSelect }) {
  const [slots, setSlots] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSlots()
  }, [activity])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      
      // Si "Tous" est sélectionné, ne pas filtrer par type d'activité
      const url = activity === 'Tous' 
        ? `${API_BASE_URL}/api/slots?user=${encodeURIComponent(currentUser.prenom)}`
        : `${API_BASE_URL}/api/slots?type=${encodeURIComponent(activity.toLowerCase())}&user=${encodeURIComponent(currentUser.prenom)}`
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        setSlots(data)
      } else {
        setError('Erreur lors du chargement des disponibilités')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Ajouter les jours vides du début
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getSlotsForDate = (date) => {
    if (!date) return []
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    return slots.filter(slot => slot.date === dateStr)
  }

  const handleDateClick = (date) => {
    if (date && onDateSelect) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      onDateSelect(dateStr)
    }
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  if (loading) {
    return (
      <div className="calendar">
        <div className="loading">Chargement du calendrier...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="calendar">
        <div className="error">{error}</div>
      </div>
    )
  }

  const days = getDaysInMonth(currentDate)

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="nav-btn" onClick={() => navigateMonth(-1)}>
          ←
        </button>
        <h3>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button className="nav-btn" onClick={() => navigateMonth(1)}>
          →
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {dayNames.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="calendar-days">
          {days.map((day, index) => {
            const daySlots = getSlotsForDate(day)
            const isToday = day && day.toDateString() === new Date().toDateString()
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${day ? 'clickable' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.getDate()}</div>
                    {daySlots.length > 0 && (
                      <div className="day-slots">
                        {daySlots.slice(0, 2).map(slot => (
                          <div key={slot.id} className="slot-indicator">
                            {slot.heureDebut || slot.time}
                          </div>
                        ))}
                        {daySlots.length > 2 && (
                          <div className="more-slots">
                            +{daySlots.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color has-slots"></div>
          <span>Disponibilités</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar