import React, { useState, useEffect } from 'react'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import { trackSlotJoin, trackSlotLeave } from '../utils/analytics'
import SlotDiscussion from './SlotDiscussion'
import ActivitySearchModal from './ActivitySearchModal'
import { useCSRFRequest } from '../hooks/useCSRF'

function SlotList({ activity, currentUser, selectedDate, onClearDate, searchFilter, onSearchFilterChange, lieuFilter, organizerFilter, onAddSlot, onJoinSlot, onLeaveSlot, onDeleteSlot, viewToggleContainer, customSlots }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Hook CSRF pour les requêtes protégées
  const csrfRequest = useCSRFRequest()
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)
  const [expandedSlots, setExpandedSlots] = useState(new Set())
  const [userGroups, setUserGroups] = useState([])
  
  // Nouveaux filtres
  const [dateFilter, setDateFilter] = useState('')
  const [showActivityModal, setShowActivityModal] = useState(false)
  
  const [showLieuModal, setShowLieuModal] = useState(false)
  const [showOrganizerModal, setShowOrganizerModal] = useState(false)
  const [activityInput, setActivityInput] = useState('')
  const [lieuInput, setLieuInput] = useState('')
  const [organizerInput, setOrganizerInput] = useState('')
  const [localLieuFilter, setLocalLieuFilter] = useState('')
  const [localOrganizerFilter, setLocalOrganizerFilter] = useState('')
  const [localSearchFilter, setLocalSearchFilter] = useState('')
  const [allSlots, setAllSlots] = useState([])
  
  

  const handleActivitySelect = (activityName) => {
    onSearchFilterChange(activityName)
    setShowSearchModal(false)
  }

  // Handlers pour les nouveaux filtres
  const handleActivityConfirm = () => {
    setLocalSearchFilter(activityInput)
    setShowActivityModal(false)
    applyFilters()
  }

  const applyFilters = (slotsToFilter = allSlots) => {
    let filteredSlots = [...slotsToFilter]
    
    // Filtrer par date si sélectionnée
    if (selectedDate) {
      filteredSlots = filteredSlots.filter(slot => slot.date === selectedDate)
    }
    
    // Filtrer par recherche
    if (localSearchFilter) {
      filteredSlots = filteredSlots.filter(slot => {
        const activityMatch = slot.customActivity && slot.customActivity.toLowerCase().includes(localSearchFilter.toLowerCase())
        const typeMatch = slot.type && slot.type.some(t => t.toLowerCase().includes(localSearchFilter.toLowerCase()))
        const activityFieldMatch = slot.activity && slot.activity.toLowerCase().includes(localSearchFilter.toLowerCase())
        return activityMatch || typeMatch || activityFieldMatch
      })
    }
    
    // Filtrer par lieu
    if (localLieuFilter) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.lieu && slot.lieu.toLowerCase().includes(localLieuFilter.toLowerCase())
      )
    }
    
    // Filtrer par organisateur
    if (localOrganizerFilter) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.createdBy && slot.createdBy.toLowerCase().includes(localOrganizerFilter.toLowerCase())
      )
    }
    
    console.log(`✅ Slots après filtrage: ${filteredSlots.length}`)
    console.log('🔍 Recherche pour:', localSearchFilter)
    console.log('📋 Premier slot pour debug:', allSlots[0])
    setSlots(filteredSlots)
  }

  const handleLieuConfirm = () => {
    setLocalLieuFilter(lieuInput)
    setShowLieuModal(false)
    applyFilters()
  }

  const handleOrganizerConfirm = () => {
    setLocalOrganizerFilter(organizerInput)
    setShowOrganizerModal(false)
    applyFilters()
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
    if (customSlots) {
      // Utiliser les slots personnalisés fournis
      setSlots(customSlots)
      setLoading(false)
      setError('')
    } else if (currentUser && currentUser.prenom) {
      fetchSlots()
      fetchUserGroups()
    }
  }, [currentUser, activity, selectedDate, customSlots])

  // Synchroniser le filtre de recherche local avec le filtre passé en props
  useEffect(() => {
    if (searchFilter !== localSearchFilter) {
      setLocalSearchFilter(searchFilter || '')
      applyFilters()
    }
  }, [searchFilter])



  const fetchSlots = async () => {
    try {
      setLoading(true)
      console.log('🔍 fetchSlots appelé avec currentUser:', currentUser)
      
      // Vérifier que currentUser est défini
      if (!currentUser || !currentUser.prenom) {
        console.log('❌ currentUser non défini:', currentUser)
        setError('Utilisateur non connecté')
        setLoading(false)
        return
      }
      
      // Récupérer TOUS les slots depuis l'API
      const url = `${API_BASE_URL}/api/slots`
      console.log('🌐 Appel API:', url)
      const response = await fetch(url)
      
      if (response.ok) {
        const allSlots = await response.json()
        console.log('📥 Tous les slots reçus:', allSlots.length)
        
        // Stocker tous les slots et appliquer les filtres
        setAllSlots(allSlots)
        applyFilters(allSlots)
      } else {
        console.log('❌ Erreur API:', response.status, response.statusText)
        setError('Erreur lors du chargement des disponibilités')
      }
    } catch (error) {
      console.log('❌ Erreur catch:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups?user=${currentUser.prenom}`)
      if (response.ok) {
        const groups = await response.json()
        setUserGroups(groups)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    }
  }

  const handleJoinSlot = async (slotId) => {
    console.log('🚀 handleJoinSlot appelé pour slotId:', slotId)
    try {
      const response = await csrfRequest(`${API_BASE_URL}/api/slots/${slotId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant: currentUser.prenom }),
      })

      if (response.ok) {
        const data = await response.json()
        trackSlotJoin(activity)
        alert('Vous avez rejoint cette disponibilité !')
        
        // Mettre à jour localement le slot modifié
        if (customSlots) {
          // Si on utilise customSlots, mettre à jour localement
          setSlots(prevSlots => 
            prevSlots.map(slot => 
              slot.id === slotId 
                ? { ...slot, participants: [...(slot.participants || []), currentUser.prenom] }
                : slot
            )
          )
        } else {
          // Sinon, rafraîchir depuis l'API
          fetchSlots()
        }
        
        // Pas de popup automatique, l'utilisateur peut cliquer sur le bouton "Notifier"
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
      const response = await csrfRequest(`${API_BASE_URL}/api/slots/${slotId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant: currentUser.prenom }),
      })

      if (response.ok) {
        trackSlotLeave(activity)
        alert('Vous avez quitté cette disponibilité')
        
        // Mettre à jour localement le slot modifié
        if (customSlots) {
          // Si on utilise customSlots, mettre à jour localement
          setSlots(prevSlots => 
            prevSlots.map(slot => 
              slot.id === slotId 
                ? { ...slot, participants: (slot.participants || []).filter(p => p !== currentUser.prenom) }
                : slot
            )
          )
        } else {
          // Sinon, rafraîchir depuis l'API
          fetchSlots()
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la sortie')
      }
    } catch (error) {
      alert('Erreur de connexion au serveur')
    }
  }


  const handleNotifyOrganizer = async (slot) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slot.id}/notify-organizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant: currentUser.prenom }),
      })

      if (response.ok) {
        alert('L\'organisateur a été notifié par email !')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'envoi de la notification')
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
      const response = await csrfRequest(`${API_BASE_URL}/api/slots/${slotId}`, {
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
        
        // Mettre à jour localement le slot supprimé
        if (customSlots) {
          // Si on utilise customSlots, mettre à jour localement
          setSlots(prevSlots => prevSlots.filter(slot => slot.id !== slotId))
          // Notifier le parent pour mettre à jour ses données
          if (onDeleteSlot) {
            onDeleteSlot(slotId)
          }
        } else {
          // Sinon, rafraîchir depuis l'API
          fetchSlots()
        }
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
    console.log('🚨 Erreur affichée:', error)
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
            const currentParticipants = slot.participants ? slot.participants.length : 0
            const isMaxParticipantsReached = slot.maxParticipants && slot.maxParticipants > 0 && currentParticipants >= slot.maxParticipants
            
            return (
              <div key={slot.id} className={`slot-item ${isExpanded ? 'expanded' : ''} ${isOwner ? 'owner-slot' : ''}`}>
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
                      👥 {slot.participants ? slot.participants.length : 0}{slot.maxParticipants && slot.maxParticipants > 0 ? `/${slot.maxParticipants}` : ''}
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
                      ) : isMaxParticipantsReached ? (
                        <button 
                          className="quick-action-btn disabled-btn"
                          disabled
                          title={`Nombre maximum de participants atteint (${slot.maxParticipants})`}
                        >
                          Complet
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
                      <strong>Participants ({currentParticipants}{slot.maxParticipants && slot.maxParticipants > 0 ? `/${slot.maxParticipants}` : ''}):</strong>
                      {slot.participants && slot.participants.length > 0 ? (
                        <div className="participants-list">
                          {slot.participants.join(', ')}
                        </div>
                      ) : (
                        <span className="no-participants">Aucun participant pour le moment</span>
                      )}
                    </div>

        <div className="slot-visibility-detail">
          <strong>Visibilité:</strong> <span className="visibility-text">{slot.visibleToAll ? 'Publique' : [
            slot.visibleToFriends && 'Amis',
            slot.visibleToGroups && slot.visibleToGroups.length > 0 && 'Groupes',
            !slot.visibleToFriends && (!slot.visibleToGroups || slot.visibleToGroups.length === 0) && 'Visibilité privée'
          ].filter(Boolean).join(', ')}</span>
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
                        
                        {/* Bouton pour notifier l'organisateur - seulement si l'utilisateur est participant */}
                        {slot.participants && slot.participants.includes(currentUser.prenom) && (
                          <button 
                            className="action-btn notify-btn"
                            onClick={() => handleNotifyOrganizer(slot)}
                            title="Notifier l'organisateur par email"
                          >
                            Notifier
                          </button>
                        )}

                        {(isAdmin || isOwner) && (
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteSlot(slot.id)}
                            title="Supprimer"
                          >
                            Supprimer
                          </button>
                        )}
                        
                        <span className="owner-badge">Organisateur: {slot.createdBy}</span>
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