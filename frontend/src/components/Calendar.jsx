import React, { useState, useEffect } from 'react'
import './Calendar.css'
import { API_BASE_URL } from '../config'
import ActivitySearchModal from './ActivitySearchModal'

function Calendar({ activity, currentUser, onDateSelect, searchFilter, onSearchFilterChange }) {
  const [slots, setSlots] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showOnlyMyGroups, setShowOnlyMyGroups] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [groupFilterType, setGroupFilterType] = useState('tous') // 'tous', 'mes-groupes', 'hors-groupes'
  const [searchInput, setSearchInput] = useState('')

  const handleActivitySelect = (activityName) => {
    onSearchFilterChange(activityName)
    setShowSearchModal(false)
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchInput(value)
    onSearchFilterChange(value)
  }

  const handleGroupsFilterToggle = () => {
    setShowOnlyMyGroups(!showOnlyMyGroups)
  }

  const handleFilterSelect = (filterType) => {
    setGroupFilterType(filterType)
    if (filterType === 'mes-groupes') {
      setShowOnlyMyGroups(true)
    } else {
      setShowOnlyMyGroups(false)
    }
    setShowFilterDropdown(false)
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
  }, [activity, searchInput, groupFilterType])

  useEffect(() => {
    fetchUserGroups()
  }, [currentUser])

  // Fermer le menu déroulant quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterDropdown])

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
        
        // Filtrer par activité personnalisée si un filtre de recherche est défini
        let filteredData = data
        if (searchInput) {
          filteredData = filteredData.filter(slot => 
            slot.customActivity && slot.customActivity.toLowerCase().includes(searchInput.toLowerCase())
          )
        }
        
        // Filtrer par groupes selon le type de filtre sélectionné
        if (groupFilterType === 'mes-groupes' && userGroups.length > 0) {
          const userGroupIds = userGroups.map(group => group.id)
          filteredData = filteredData.filter(slot => {
            // Garder les slots qui ont des groupes visibles ET que l'utilisateur fait partie d'au moins un de ces groupes
            return slot.visibleToGroups && slot.visibleToGroups.length > 0 && 
                   slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId))
          })
        } else if (groupFilterType === 'hors-groupes') {
          // Garder seulement les slots qui n'ont pas de groupes visibles (disponibilités publiques)
          filteredData = filteredData.filter(slot => {
            return !slot.visibleToGroups || slot.visibleToGroups.length === 0
          })
        }
        // Si groupFilterType === 'tous', on ne filtre pas par groupes
        
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
      <div className="calendar-title-header">
        <div className="header-title-container">
          <div className="header-buttons">
            <div className="filter-dropdown">
              <button 
                className={`filter-btn ${groupFilterType !== 'tous' ? 'active' : ''}`}
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                title="Filtrer par groupes"
              >
                Filtre groupe
              </button>
              {showFilterDropdown && (
                <div className="filter-dropdown-menu">
                  <button 
                    className={`filter-option ${groupFilterType === 'tous' ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('tous')}
                  >
                    Tous
                  </button>
                  <button 
                    className={`filter-option ${groupFilterType === 'mes-groupes' ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('mes-groupes')}
                  >
                    Mes groupes
                  </button>
                  <button 
                    className={`filter-option ${groupFilterType === 'hors-groupes' ? 'selected' : ''}`}
                    onClick={() => handleFilterSelect('hors-groupes')}
                  >
                    Hors groupes
                  </button>
                </div>
              )}
            </div>
            {(activity === 'Tous' || activity === 'Autre' || activity === 'Sport' || activity === 'Social') && (
              <input
                type="text"
                className="search-input"
                placeholder="Recherche..."
                value={searchInput}
                onChange={handleSearchInputChange}
                title="Rechercher une activité"
              />
            )}
          </div>
        </div>
        
        {(searchInput || groupFilterType !== 'tous') && (
          <div className="filters-info">
            {searchInput && (
              <div className="search-filter-info">
                <p>🔍 Filtre : "{searchInput}"</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => {
                    setSearchInput('')
                    onSearchFilterChange('')
                  }}
                  title="Supprimer le filtre"
                >
                  ✕
                </button>
              </div>
            )}
            {groupFilterType === 'mes-groupes' && (
              <div className="groups-filter-info">
                <p>👥 Affichage : Mes Groupes uniquement</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => handleFilterSelect('tous')}
                  title="Afficher toutes les disponibilités"
                >
                  ✕
                </button>
              </div>
            )}
            {groupFilterType === 'hors-groupes' && (
              <div className="groups-filter-info">
                <p>🌐 Affichage : Hors groupes uniquement</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => handleFilterSelect('tous')}
                  title="Afficher toutes les disponibilités"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
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
      
      {/* Modal de recherche d'activités */}
      {showSearchModal && (
        <ActivitySearchModal 
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSelectActivity={handleActivitySelect}
        />
      )}
    </div>
  )
}

export default Calendar