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
  const [searchTimeout, setSearchTimeout] = useState(null)
  
  // Nouveaux filtres
  const [dateFilter, setDateFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
  const [lieuSearchInput, setLieuSearchInput] = useState('')
  const [lieuSearchTimeout, setLieuSearchTimeout] = useState(null)

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
  }, [activity, searchFilter, groupFilterType, dateFilter, lieuFilter])

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
        if (searchFilter) {
          filteredData = filteredData.filter(slot => 
            slot.customActivity && slot.customActivity.toLowerCase().includes(searchFilter.toLowerCase())
          )
        }
        
        // Filtrer par date si un filtre de date est défini
        if (dateFilter) {
          filteredData = filteredData.filter(slot => 
            slot.date && slot.date.includes(dateFilter)
          )
        }
        
        // Filtrer par lieu si un filtre de lieu est défini
        if (lieuFilter) {
          filteredData = filteredData.filter(slot => 
            slot.lieu && slot.lieu.toLowerCase().includes(lieuFilter.toLowerCase())
          )
        }
        
        // Filtrer par groupes selon le type de filtre sélectionné
        if (groupFilterType === 'mes-groupes' && userGroups.length > 0) {
          const userGroupIds = userGroups.map(group => group.id)
          filteredData = filteredData.filter(slot => {
            // Garder les slots visibles par tous OU qui ont des groupes visibles ET que l'utilisateur fait partie d'au moins un de ces groupes
            return slot.visibleToAll || 
                   (slot.visibleToGroups && slot.visibleToGroups.length > 0 && 
                    slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId)))
          })
        } else if (groupFilterType === 'hors-groupes') {
          // Garder seulement les slots visibles par tous OU qui n'ont pas de groupes visibles (disponibilités publiques)
          filteredData = filteredData.filter(slot => {
            return slot.visibleToAll || !slot.visibleToGroups || slot.visibleToGroups.length === 0
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
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Recherche activité..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleSearchKeyPress}
                  title="Rechercher une activité"
                />
                <button
                  className="search-confirm-btn"
                  onClick={handleSearchConfirm}
                  title="Lancer la recherche"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Deuxième ligne de filtres */}
        <div className="filters-row-2">
          <div className="date-filter-container">
            <input
              type="date"
              className="date-filter-input"
              value={dateFilter}
              onChange={handleDateFilterChange}
              title="Filtrer par date"
            />
          </div>
          <div className="lieu-search-container">
            <input
              type="text"
              className="lieu-search-input"
              placeholder="Recherche lieu..."
              value={lieuSearchInput}
              onChange={handleLieuSearchInputChange}
              onKeyPress={handleLieuSearchKeyPress}
              title="Rechercher par lieu"
            />
            <button
              className="lieu-search-confirm-btn"
              onClick={() => setLieuFilter(lieuSearchInput)}
              title="Lancer la recherche lieu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        {(searchFilter || groupFilterType !== 'tous' || dateFilter || lieuFilter) && (
          <div className="filters-info">
            {searchFilter && (
              <div className="search-filter-info">
                <p>🔍 Filtre : "{searchFilter}"</p>
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
            {dateFilter && (
              <div className="date-filter-info">
                <p>📅 Date : "{dateFilter}"</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => setDateFilter('')}
                  title="Supprimer le filtre date"
                >
                  ✕
                </button>
              </div>
            )}
            {lieuFilter && (
              <div className="lieu-filter-info">
                <p>📍 Lieu : "{lieuFilter}"</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => {
                    setLieuFilter('')
                    setLieuSearchInput('')
                  }}
                  title="Supprimer le filtre lieu"
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