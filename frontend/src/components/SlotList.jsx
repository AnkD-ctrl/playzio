import React, { useState, useEffect } from 'react'
import './SlotList.css'
import { API_BASE_URL } from '../config'
import { trackSlotJoin, trackSlotLeave } from '../utils/analytics'
import SlotDiscussion from './SlotDiscussion'
import ActivitySearchModal from './ActivitySearchModal'

function SlotList({ activity, currentUser, selectedDate, onClearDate, searchFilter, onSearchFilterChange }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showOnlyMyGroups, setShowOnlyMyGroups] = useState(false)
  const [userGroups, setUserGroups] = useState([])

  const handleActivitySelect = (activityName) => {
    onSearchFilterChange(activityName)
    setShowSearchModal(false)
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
  }, [activity, selectedDate, searchFilter, showOnlyMyGroups])

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
        // Filtrer par date si une date est sélectionnée
        let filteredData = selectedDate 
          ? data.filter(slot => slot.date === selectedDate)
          : data
        
        // Filtrer par activité personnalisée si un filtre de recherche est défini
        if (searchFilter) {
          filteredData = filteredData.filter(slot => 
            slot.customActivity && slot.customActivity.toLowerCase().includes(searchFilter.toLowerCase())
          )
        }
        
        // Filtrer par groupes si le filtre "Mes Groupes" est activé
        if (showOnlyMyGroups && userGroups.length > 0) {
          const userGroupIds = userGroups.map(group => group.id)
          filteredData = filteredData.filter(slot => {
            // Garder les slots qui ont des groupes visibles ET que l'utilisateur fait partie d'au moins un de ces groupes
            return slot.visibleToGroups && slot.visibleToGroups.length > 0 && 
                   slot.visibleToGroups.some(groupId => userGroupIds.includes(groupId))
          })
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
          <h3>{activity === 'Tous' ? 'Toutes les disponibilités' : `Disponibilités ${activity}`}</h3>
          <div className="header-buttons">
            <button 
              className={`groups-filter-btn ${showOnlyMyGroups ? 'active' : ''}`}
              onClick={handleGroupsFilterToggle}
              title={showOnlyMyGroups ? "Afficher toutes les disponibilités" : "Afficher seulement mes groupes"}
            >
              👥
            </button>
            {(activity === 'Tous' || activity === 'Autre') && (
              <button 
                className="search-btn"
                onClick={() => setShowSearchModal(true)}
                title="Rechercher une activité"
              >
                🔍
              </button>
            )}
          </div>
        </div>
        
        {(searchFilter || showOnlyMyGroups) && (
          <div className="filters-info">
            {searchFilter && (
              <div className="search-filter-info">
                <p>🔍 Filtre : "{searchFilter}"</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => onSearchFilterChange('')}
                  title="Supprimer le filtre"
                >
                  ✕
                </button>
              </div>
            )}
            {showOnlyMyGroups && (
              <div className="groups-filter-info">
                <p>👥 Affichage : Mes Groupes uniquement</p>
                <button 
                  className="clear-filter-btn"
                  onClick={() => setShowOnlyMyGroups(false)}
                  title="Afficher toutes les disponibilités"
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
        <div className="slots-grid">
          {slots.map(slot => {
            const isParticipant = slot.participants && slot.participants.includes(currentUser.prenom)
            const isOwner = slot.createdBy === currentUser.prenom
            const isAdmin = currentUser.role === 'admin'
            
            return (
              <div key={slot.id} className="slot-card">
                <div className="slot-header">
                  <div className="slot-date">
                    <span className="date">{slot.date.split('-').reverse().join('/')}</span>
                    <span className="time">{slot.heureDebut} - {slot.heureFin}</span>
                  </div>
                  <div className="slot-activity">
                    {slot.customActivity ? slot.customActivity : (Array.isArray(slot.type) ? slot.type.join(', ') : slot.type)}
                  </div>
                </div>

                <div className="slot-content">
                  
                  {slot.description && (
                    <div className="slot-description">
                      {slot.description}
                    </div>
                  )}

                  <div className="slot-participants">
                    <span>👥 {slot.participants ? slot.participants.length : 0} participant{(slot.participants ? slot.participants.length : 0) !== 1 ? 's' : ''}</span>
                    {slot.participants && slot.participants.length > 0 && (
                      <div className="participants-list">
                        {slot.participants.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="slot-actions">
                  <div className="action-buttons">
                    <button 
                      className="discuss-btn"
                      onClick={() => setSelectedSlot(slot)}
                      title="Voir la discussion"
                    >
                      Discussion
                    </button>
                    
                    {isParticipant ? (
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
                    
                    {(isAdmin || isOwner) && (
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  
                  {isOwner && (
                    <span className="owner-badge">Vous êtes l'organisateur</span>
                  )}
                </div>
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