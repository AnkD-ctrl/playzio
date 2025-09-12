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
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showLieuModal, setShowLieuModal] = useState(false)
  const [showOrganizerModal, setShowOrganizerModal] = useState(false)
  const [activityInput, setActivityInput] = useState('')
  const [lieuInput, setLieuInput] = useState('')
  const [organizerInput, setOrganizerInput] = useState('')

  const handleActivitySelect = (activityName) => {
    onSearchFilterChange(activityName)
    setShowSearchModal(false)
  }

  // Handlers pour les nouveaux filtres
  const handleActivityConfirm = () => {
    onSearchFilterChange(activityInput)
    setShowActivityModal(false)
  }

  const handleLieuConfirm = () => {
    setLieuFilter(lieuInput)
    setShowLieuModal(false)
  }

  const handleOrganizerConfirm = () => {
    setOrganizerFilter(organizerInput)
    setShowOrganizerModal(false)
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
  }, [activity, selectedDate, searchFilter, dateFilter, lieuFilter, organizerFilter, filterType, userGroups])

  useEffect(() => {
    fetchUserGroups()
  }, [currentUser])


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
        } else if (filterType === 'communaute' && userGroups.length > 0) {
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
        
        // Filtrer par organisateur si un filtre d'organisateur est défini
        if (organizerFilter) {
          filteredData = filteredData.filter(slot => 
            slot.creator && slot.creator.toLowerCase().includes(organizerFilter.toLowerCase())
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
            <div className="filter-buttons">
              {/* Première ligne : Activité et Date */}
              <div className="filter-row">
                {/* Filtre Activité */}
                <button 
                  className={`filter-btn ${searchFilter ? 'active' : ''}`}
                  onClick={() => setShowActivityModal(true)}
                  title="Filtrer par activité"
                >
                  Activité {searchFilter && <span className="filter-indicator">•</span>}
                </button>
                
                {/* Filtre Date - Bouton comme les autres */}
                <button 
                  className={`filter-btn ${dateFilter ? 'active' : ''}`}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'date';
                    input.value = dateFilter;
                    input.style.position = 'absolute';
                    input.style.opacity = '0';
                    input.style.pointerEvents = 'none';
                    document.body.appendChild(input);
                    input.showPicker();
                    input.onchange = (e) => {
                      setDateFilter(e.target.value);
                      document.body.removeChild(input);
                    };
                    input.onblur = () => {
                      if (document.body.contains(input)) {
                        document.body.removeChild(input);
                      }
                    };
                  }}
                  title="Filtrer par date"
                >
                  Date {dateFilter && <span className="filter-indicator">•</span>}
                </button>
              </div>
              
              {/* Deuxième ligne : Lieu et Organisateur */}
              <div className="filter-row">
                {/* Filtre Lieu */}
                <button 
                  className={`filter-btn ${lieuFilter ? 'active' : ''}`}
                  onClick={() => setShowLieuModal(true)}
                  title="Filtrer par lieu"
                >
                  Lieu {lieuFilter && <span className="filter-indicator">•</span>}
                </button>
                
                {/* Filtre Organisateur */}
                <button 
                  className={`filter-btn ${organizerFilter ? 'active' : ''}`}
                  onClick={() => setShowOrganizerModal(true)}
                  title="Filtrer par organisateur"
                >
                  Organisateur {organizerFilter && <span className="filter-indicator">•</span>}
                </button>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Boutons de basculement vue liste/calendrier et ajout */}
        <div className="view-toggle-container">
          {/* Bouton + pour ajouter une dispo dans l'onglet "Mes dispo" */}
          {filterType === 'mes-dispo' && (
            <button 
              className="view-toggle-btn add-btn"
              onClick={() => {
                // Naviguer vers l'écran d'ajout
                window.location.hash = '#add';
                window.location.reload();
              }}
              title="Ajouter une disponibilité"
            >
              +
            </button>
          )}
          
          <button 
            className="view-toggle-btn"
            onClick={() => {
              // Basculer entre vue liste et calendrier
              const currentPath = window.location.hash;
              if (currentPath.includes('-calendar')) {
                window.location.hash = currentPath.replace('-calendar', '');
              } else {
                window.location.hash = currentPath + '-calendar';
              }
              window.location.reload();
            }}
            title={filterType.includes('-calendar') ? 'Vue liste' : 'Vue calendrier'}
          >
            {filterType.includes('-calendar') ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 6h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </button>
        </div>
        
        {(searchFilter || dateFilter || lieuFilter || organizerFilter) && (
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
                  onClick={() => setLieuFilter('')}
                  title="Supprimer le filtre lieu"
                >
                  ✕
                </button>
              </div>
            )}
            {organizerFilter && (
              <div className="organizer-filter-info">
                <p>👤 Organisateur : "{organizerFilter}"</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => setOrganizerFilter('')}
                  title="Supprimer le filtre organisateur"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Modales de filtres */}
        
        {/* Modal Activité */}
        {showActivityModal && (
          <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
            <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Filtrer par activité</h3>
              <input
                type="text"
                className="modal-input"
                placeholder="Entrez le nom de l'activité..."
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleActivityConfirm()}
              />
              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowActivityModal(false)}>
                  Annuler
                </button>
                <button className="modal-btn primary" onClick={handleActivityConfirm}>
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}
        
        
        {/* Modal Lieu */}
        {showLieuModal && (
          <div className="modal-overlay" onClick={() => setShowLieuModal(false)}>
            <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Filtrer par lieu</h3>
              <input
                type="text"
                className="modal-input"
                placeholder="Entrez le nom du lieu..."
                value={lieuInput}
                onChange={(e) => setLieuInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLieuConfirm()}
              />
              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowLieuModal(false)}>
                  Annuler
                </button>
                <button className="modal-btn primary" onClick={handleLieuConfirm}>
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal Organisateur */}
        {showOrganizerModal && (
          <div className="modal-overlay" onClick={() => setShowOrganizerModal(false)}>
            <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Filtrer par organisateur</h3>
              <input
                type="text"
                className="modal-input"
                placeholder="Entrez le nom de l'organisateur..."
                value={organizerInput}
                onChange={(e) => setOrganizerInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleOrganizerConfirm()}
              />
              <div className="modal-actions">
                <button className="modal-btn secondary" onClick={() => setShowOrganizerModal(false)}>
                  Annuler
                </button>
                <button className="modal-btn primary" onClick={handleOrganizerConfirm}>
                  Appliquer
                </button>
              </div>
            </div>
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