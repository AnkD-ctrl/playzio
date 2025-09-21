import React, { useState, useEffect } from 'react'
import './Calendar.css'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import ActivitySearchModal from './ActivitySearchModal'

function Calendar({ activity, currentUser, onDateSelect, searchFilter, onSearchFilterChange, lieuFilter, organizerFilter, filterType = 'publiques', onAddSlot, onJoinSlot, selectedDate, onClearDate }) {
  const [slots, setSlots] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showOnlyMyGroups, setShowOnlyMyGroups] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [showDayPopup, setShowDayPopup] = useState(false)
  const [selectedDaySlots, setSelectedDaySlots] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [expandedSlots, setExpandedSlots] = useState(new Set())
  const [selectedSlot, setSelectedSlot] = useState(null)

  
  // Nouveaux filtres
  const [dateFilter, setDateFilter] = useState('')
  const [lieuSearchInput, setLieuSearchInput] = useState('')
  const [lieuSearchTimeout, setLieuSearchTimeout] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleActivitySelect = (activityName) => {
    onSearchFilterChange(activityName)
    setShowSearchModal(false)
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
  }

  const handleSearchConfirm = () => {
    onSearchFilterChange(searchInput)
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchConfirm()
    }
  }

  // Handlers pour les nouveaux filtres
  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value)
  }

  const handleDateSelect = (date) => {
    setDateFilter(date)
    setShowDatePicker(false)
  }

  const handleDateFilterToggle = () => {
    setShowDatePicker(!showDatePicker)
  }

  const handleLieuSearchInputChange = (e) => {
    const value = e.target.value
    setLieuSearchInput(value)
    
    // Clear existing timeout
    if (lieuSearchTimeout) {
      clearTimeout(lieuSearchTimeout)
    }
    
    // Set new timeout for search
    const newTimeout = setTimeout(() => {
      setLieuFilter(value)
    }, 300)
    
    setLieuSearchTimeout(newTimeout)
  }

  const handleLieuSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setLieuFilter(lieuSearchInput)
    }
  }

  const handleGroupsFilterToggle = () => {
    setShowOnlyMyGroups(!showOnlyMyGroups)
  }


  const fetchUserGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups?user=${encodeURIComponent(currentUser.prenom)}`)
      const data = await response.json()
      setUserGroups(data)
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [activity, searchFilter, lieuFilter, organizerFilter, filterType, userGroups, selectedDate])

  useEffect(() => {
    fetchUserGroups()
  }, [currentUser])

  // Fermer le menu déroulant quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-filter-dropdown')) {
        setShowDatePicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      
      let url
      if (onJoinSlot) {
        // Mode partage public - utiliser l'endpoint public
        url = `${API_BASE_URL}/api/slots/user/${encodeURIComponent(currentUser.prenom)}`
      } else {
        // Mode normal - utiliser l'endpoint avec authentification
        url = activity === 'Tous' 
          ? `${API_BASE_URL}/api/slots?user=${encodeURIComponent(currentUser.prenom)}`
          : `${API_BASE_URL}/api/slots?type=${encodeURIComponent(activity.toLowerCase())}&user=${encodeURIComponent(currentUser.prenom)}`
      }
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        
        // Filtrer selon le type d'onglet
        let filteredData = data
        
        if (onJoinSlot) {
          // Mode partage public - ne pas filtrer, les données viennent déjà filtrées de l'API
          // Les données sont déjà filtrées par utilisateur côté serveur
        } else if (filterType === 'mes-dispos') {
          // Afficher seulement les créneaux créés par l'utilisateur
          filteredData = filteredData.filter(slot => slot.createdBy === currentUser.prenom)
        } else if (filterType === 'communaute' && userGroups.length > 0) {
          // Afficher seulement les créneaux des groupes de l'utilisateur
          const userGroupNames = userGroups.map(group => group.name)
          filteredData = filteredData.filter(slot => 
            slot.visibleToGroups && slot.visibleToGroups.some(groupName => userGroupNames.includes(groupName))
          )
        } else if (filterType === 'publiques') {
          // Afficher seulement les créneaux visibles à tous (visible_to_all = true)
          filteredData = filteredData.filter(slot => slot.visibleToAll === true)
        }
        
        // Filtrer par activité personnalisée si un filtre de recherche est défini
        if (searchFilter) {
          filteredData = filteredData.filter(slot => 
            slot.customActivity && slot.customActivity.toLowerCase().includes(searchFilter.toLowerCase())
          )
        }
        
        // Filtrer par lieu si un filtre de lieu est défini
        if (lieuFilter) {
          filteredData = filteredData.filter(slot => 
            slot.lieu && slot.lieu.toLowerCase().includes(lieuFilter.toLowerCase())
          )
        }
        
        // Filtrer par organisateur si un filtre d'organisateur est défini
        if (organizerFilter) {
          filteredData = filteredData.filter(slot => 
            slot.createdBy && slot.createdBy.toLowerCase().includes(organizerFilter.toLowerCase())
          )
        }
        
        // Filtrer par date si une date est sélectionnée
        if (selectedDate) {
          filteredData = filteredData.filter(slot => slot.date === selectedDate)
        }
        
        
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
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      // Vérifier s'il y a des créneaux pour cette date
      const daySlots = getSlotsForDate(date)
      
      if (daySlots.length > 0) {
        // S'il y a des créneaux, utiliser onDateSelect (comportement existant)
        if (onDateSelect) {
          onDateSelect(dateStr)
        }
      } else {
        // S'il n'y a pas de créneaux, utiliser onAddSlot pour créer une nouvelle dispo
        if (onAddSlot) {
          onAddSlot(dateStr)
        }
      }
    }
  }

  const handleSlotClick = (slot) => {
    // Si onJoinSlot est fourni (mode partage), rediriger vers l'inscription
    if (onJoinSlot) {
      onJoinSlot()
    } else {
      // Mode normal - ouvrir popup avec les disponibilités du jour
      const daySlots = slots.filter(s => s.date === slot.date)
      setSelectedDaySlots(daySlots)
      setSelectedDay(slot.date)
      setShowDayPopup(true)
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
        body: JSON.stringify({ 
          userPrenom: currentUser.prenom 
        }),
      })

      if (response.ok) {
        alert('Vous avez rejoint cette disponibilité')
        // Recharger les slots
        const daySlots = slots.filter(s => s.date === selectedDay)
        setSelectedDaySlots(daySlots)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la participation')
      }
    } catch (error) {
      alert('Erreur de connexion au serveur')
    }
  }

  const handleLeaveSlot = async (slotId) => {
    if (!confirm('Êtes-vous sûr de vouloir quitter cette disponibilité ?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userPrenom: currentUser.prenom 
        }),
      })

      if (response.ok) {
        alert('Vous avez quitté cette disponibilité')
        // Recharger les slots
        const daySlots = slots.filter(s => s.date === selectedDay)
        setSelectedDaySlots(daySlots)
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la sortie')
      }
    } catch (error) {
      alert('Erreur de connexion au serveur')
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
                          <div 
                            key={slot.id} 
                            className="slot-indicator clickable-slot"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSlotClick(slot)
                            }}
                            title={`${slot.activity || slot.customActivity} - ${slot.heureDebut || slot.time}`}
                          >
                            {slot.heureDebut || slot.time}
                          </div>
                        ))}
                        {daySlots.length > 2 && (
                          <div 
                            className="more-slots clickable-slot"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSlotClick(daySlots[2]) // Cliquer sur le premier slot non affiché
                            }}
                            title="Voir plus de créneaux"
                          >
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
      
      {/* Modal de recherche d'activités */}
      {showSearchModal && (
        <ActivitySearchModal 
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSelectActivity={handleActivitySelect}
        />
      )}

      {/* Popup des disponibilités du jour */}
      {showDayPopup && (
        <div className="modal-overlay" onClick={() => setShowDayPopup(false)}>
          <div className="day-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Disponibilités du {new Date(selectedDay).toLocaleDateString('fr-FR')}</h3>
              <button 
                className="popup-close"
                onClick={() => setShowDayPopup(false)}
                title="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="popup-content">
              {selectedDaySlots.length > 0 ? (
                <div className="day-slots-list">
                  {selectedDaySlots.map(slot => {
                    const isExpanded = expandedSlots.has(slot.id)
                    const isParticipant = slot.participants && slot.participants.includes(currentUser.prenom)
                    const isOwner = slot.createdBy === currentUser.prenom
                    const isAdmin = currentUser.role === 'admin'

                    return (
                      <div key={slot.id} className={`slot-item ${isExpanded ? 'expanded' : ''}`}>
                        <div className="slot-item-header" onClick={() => toggleSlotExpansion(slot.id)}>
                          <div className="slot-item-main">
                            <div className="slot-item-date">
                              <span className="date">{slot.date.split('-').reverse().join('/')}</span>
                              <span className="time">{slot.heureDebut} - {slot.heureFin}</span>
                            </div>
                            <div className="slot-item-activity">
                              {slot.customActivity 
                                ? (slot.customActivity.length > 6 ? slot.customActivity.substring(0, 6) + '...' : slot.customActivity)
                                : (Array.isArray(slot.type) ? slot.type.join(', ') : slot.type)
                              }
                            </div>
                            <div className="slot-item-participants">
                              👥 {slot.participants ? slot.participants.length : 0}
                            </div>
                          </div>
                          <div className="slot-item-actions">
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
                                  if (onJoinSlot) {
                                    onJoinSlot()
                                  } else {
                                    handleJoinSlot(slot.id)
                                  }
                                }}
                                title="Rejoindre"
                              >
                                Rejoindre
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="expand-icon-bottom" onClick={(e) => {
                          e.stopPropagation()
                          toggleSlotExpansion(slot.id)
                        }}>
                          {isExpanded ? '▲' : '▼'}
                        </div>
                        
                        {isExpanded && (
                          <div className="slot-item-details">
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
                                <div className="participants-list">Aucun participant</div>
                              )}
                            </div>

                            <div className="slot-organizer-detail">
                              <strong>Organisateur:</strong> {slot.createdBy || slot.creator}
                            </div>

                            <div className="slot-item-actions-detail">
                              <button 
                                className="action-btn discuss-btn"
                                onClick={() => setSelectedSlot(slot)}
                                title="Voir la discussion"
                              >
                                Discussion
                              </button>
                              
                              {(isAdmin || isOwner) && (
                                <button 
                                  className="action-btn delete-btn"
                                  onClick={() => {
                                    if (confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
                                      // TODO: Implémenter la suppression
                                      alert('Fonction de suppression à implémenter')
                                    }
                                  }}
                                  title="Supprimer"
                                >
                                  Supprimer
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="no-slots-message">
                  Aucune disponibilité pour ce jour
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar