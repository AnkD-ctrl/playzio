import React, { useState, useEffect } from 'react'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import { trackSlotJoin, trackSlotLeave } from '../utils/analytics'
import SlotDiscussion from './SlotDiscussion'
import ActivitySearchModal from './ActivitySearchModal'

function SlotList({ activity, currentUser, selectedDate, onClearDate, searchFilter, onSearchFilterChange, lieuFilter, organizerFilter, onAddSlot, onJoinSlot, viewToggleContainer }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [expandedSlots, setExpandedSlots] = useState(new Set())
  
  // Nouveaux filtres
  const [dateFilter, setDateFilter] = useState('')
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



  useEffect(() => {
    fetchSlots()
  }, [activity, selectedDate, searchFilter, lieuFilter, organizerFilter])



  const fetchSlots = async () => {
    try {
      setLoading(true)
      
      // Récupérer TOUS les slots depuis l'API
      const url = `${API_BASE_URL}/api/slots`
      const response = await fetch(url)
      
      if (response.ok) {
        const allSlots = await response.json()
        console.log('📥 Tous les slots reçus:', allSlots.length)
        
        // LOGIQUE DE FILTRAGE INTELLIGENTE
        // Afficher seulement les slots auxquels l'utilisateur a accès
        let filteredSlots = allSlots.filter(slot => {
          // 1. Mes propres slots (toujours visibles)
          if (slot.createdBy === currentUser.prenom) {
            return true
          }
          
          // 2. Slots publics (visibleToAll = true)
          if (slot.visibleToAll === true) {
            return true
          }
          
          // 3. Slots des amis (visibleToFriends = true)
          if (slot.visibleToFriends === true) {
            return true
          }
          
          // 4. Slots des groupes (visibleToGroups contient des groupes)
          if (slot.visibleToGroups && slot.visibleToGroups.length > 0) {
            return true
          }
          
          // 5. Si aucun des critères ci-dessus n'est rempli, ne pas afficher
          return false
        })
        
        // Filtrer par date si sélectionnée
        if (selectedDate) {
          filteredSlots = filteredSlots.filter(slot => slot.date === selectedDate)
        }
        
        // Filtrer par recherche
        if (searchFilter) {
          filteredSlots = filteredSlots.filter(slot => 
            slot.customActivity && slot.customActivity.toLowerCase().includes(searchFilter.toLowerCase())
          )
        }
        
        // Filtrer par lieu
        if (lieuFilter) {
          filteredSlots = filteredSlots.filter(slot => 
            slot.lieu && slot.lieu.toLowerCase().includes(lieuFilter.toLowerCase())
          )
        }
        
        // Filtrer par organisateur
        if (organizerFilter) {
          filteredSlots = filteredSlots.filter(slot => 
            slot.createdBy && slot.createdBy.toLowerCase().includes(organizerFilter.toLowerCase())
          )
        }
        
        console.log(`✅ Slots accessibles affichés: ${filteredSlots.length}`)
        setSlots(filteredSlots)
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
      {viewToggleContainer}
      <div className="slot-list-header" style={{ marginTop: '0' }}>
        
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
        
        <p>{slots.length} disponibilité{slots.length !== 1 ? 's' : ''} trouvée{slots.length !== 1 ? 's' : ''}</p>
      </div>

        {slots.length === 0 ? (
          <div className="no-slots">
            <p>{activity === 'Tous' ? 'Aucune disponibilité pour le moment.' : `Aucune disponibilité pour ${activity} pour le moment.`}</p>
            <p>Crée ta première dispo en cliquant sur le bouton +</p>
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
                  {onJoinSlot && (
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
                              onJoinSlot(slot.id)
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
                  )}
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
                        <span>Aucun participant pour le moment</span>
                      )}
                    </div>

                    {onJoinSlot && (
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
                    )}
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