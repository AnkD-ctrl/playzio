import React, { useState, useEffect } from 'react'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import { trackSlotJoin, trackSlotLeave } from '../utils/analytics'
import SlotDiscussion from './SlotDiscussion'
import ActivitySearchModal from './ActivitySearchModal'

function SlotList({ activity, currentUser, selectedDate, onClearDate, searchFilter, onSearchFilterChange, filterType = 'toutes-dispo', onAddSlot }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showOnlyMyGroups, setShowOnlyMyGroups] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [expandedSlots, setExpandedSlots] = useState(new Set())
  
  // Nouveaux filtres
  const [dateFilter, setDateFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
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
  }, [activity, selectedDate, searchFilter, dateFilter, lieuFilter])

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
      
      // Si "Tous" est sélectionné, ne pas filtrer par type d'activité
      const url = activity === 'Tous' 
        ? `${API_BASE_URL}/api/slots?user=${encodeURIComponent(currentUser.prenom)}`
        : `${API_BASE_URL}/api/slots?type=${encodeURIComponent(activity.toLowerCase())}&user=${encodeURIComponent(currentUser.prenom)}`
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data = await response.json()
        let filteredData = data
        
        // Filtrer selon le type d'onglet
        if (filterType === 'mes-dispo') {
          // Afficher seulement les créneaux créés par l'utilisateur
          filteredData = filteredData.filter(slot => slot.creator === currentUser.prenom)
        } else if (filterType === 'communaute') {
          // Afficher seulement les créneaux des groupes de l'utilisateur
          const userGroupNames = userGroups.map(group => group.name)
          filteredData = filteredData.filter(slot => 
            slot.group && userGroupNames.includes(slot.group)
          )
        }
        // 'toutes-dispo' affiche tout (pas de filtre supplémentaire)
        
        // Filtrer par date si une date est sélectionnée
        filteredData = selectedDate 
          ? filteredData.filter(slot => slot.date === selectedDate)
          : filteredData
        
        // Filtrer par activité personnalisée si un filtre de recherche est défini
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
        <div className="header-title-container">
          <div className="header-buttons">
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
            {/* Bouton + pour ajouter une dispo dans l'onglet "Mes dispo" */}
            {filterType === 'mes-dispo' && onAddSlot && (
              <button 
                className="add-slot-btn"
                onClick={onAddSlot}
                title="Ajouter une disponibilité"
              >
                +
              </button>
            )}
          </div>
        </div>
        
        {/* Deuxième ligne de filtres */}
        <div className="filters-row-2">
          <div className="date-filter-dropdown">
            <button 
              className={`date-filter-btn ${dateFilter ? 'active' : ''}`}
              onClick={handleDateFilterToggle}
              title="Filtrer par date"
            >
              Filtre date
            </button>
            {showDatePicker && (
              <div className="date-picker-dropdown">
                <input
                  type="date"
                  className="date-picker-input"
                  value={dateFilter}
                  onChange={handleDateFilterChange}
                  title="Sélectionner une date"
                />
                <div className="date-picker-actions">
                  <button 
                    className="date-picker-clear"
                    onClick={() => {
                      setDateFilter('')
                      setShowDatePicker(false)
                    }}
                  >
                    Effacer
                  </button>
                  <button 
                    className="date-picker-apply"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            )}
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
          <p>{activity === 'Tous' ? 'Aucune disponibilité pour le moment.' : `Aucune disponibilité pour ${activity} pour le moment.`}</p>
          <p>Soyez le premier à en créer une !</p>
        </div>
      ) : (
        <div className="slots-list">
          {slots.map(slot => {
            const isParticipant = slot.participants && slot.participants.includes(currentUser.prenom)
            const isOwner = slot.createdBy === currentUser.prenom
            const isAdmin = currentUser.role === 'admin'
            const isExpanded = expandedSlots.has(slot.id)
            
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
                          handleJoinSlot(slot.id)
                        }}
                        title="Rejoindre"
                      >
                        Rejoindre
                      </button>
                    )}
                    <div className="expand-icon">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>
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
                        <span>Aucun participant pour le moment</span>
                      )}
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
                          onClick={() => handleDeleteSlot(slot.id)}
                          title="Supprimer"
                        >
                          Supprimer
                        </button>
                      )}
                      
                      {isOwner && (
                        <span className="owner-badge">Vous êtes l'organisateur</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      
      {selectedSlot && (
        <SlotDiscussion
          slot={selectedSlot}
          currentUser={currentUser}
          onClose={() => setSelectedSlot(null)}
        />
      )}
      
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

export default SlotList