import React, { useState, useEffect } from 'react'
import './DisposAmis.css'
import { API_BASE_URL } from '../config'
import SlotDiscussion from './SlotDiscussion'

function DisposAmis({ currentUser, onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [expandedSlots, setExpandedSlots] = useState(new Set())
  const [userFriends, setUserFriends] = useState([])

  useEffect(() => {
    if (currentUser && currentUser.prenom) {
      fetchFriendsAndSlots()
    }
  }, [currentUser])

  const fetchFriendsAndSlots = async () => {
    try {
      setLoading(true)
      console.log('🔍 Récupération des amis et slots pour:', currentUser.prenom)
      
      // 1. Récupérer les amis
      const friendsResponse = await fetch(`${API_BASE_URL}/api/friends/${currentUser.prenom}`)
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json()
        setUserFriends(friendsData.friends || [])
        console.log('👥 Amis récupérés:', friendsData.friends)
      }

      // 2. Récupérer TOUS les slots
      const slotsResponse = await fetch(`${API_BASE_URL}/api/slots`)
      if (slotsResponse.ok) {
        const allSlots = await slotsResponse.json()
        console.log('📥 Tous les slots reçus:', allSlots.length)
        
        // 3. FILTRAGE SIMPLE : Slots des amis avec visibleToFriends=true
        const amisSlots = allSlots.filter(slot => {
          // Ne pas afficher mes propres slots
          if (slot.createdBy === currentUser.prenom) {
            return false
          }
          
          // Afficher seulement si créé par un ami ET visibleToFriends=true
          return userFriends.includes(slot.createdBy) && slot.visibleToFriends === true
        })
        
        console.log('📥 Slots des amis filtrés:', amisSlots.length)
        setSlots(amisSlots)
      } else {
        console.log('❌ Erreur API slots:', slotsResponse.status, slotsResponse.statusText)
        setError('Erreur lors du chargement des disponibilités des amis')
      }
    } catch (error) {
      console.log('❌ Erreur catch:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
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
        body: JSON.stringify({ participant: currentUser.prenom }),
      })

      if (response.ok) {
        alert('Vous avez rejoint cette disponibilité !')
        fetchFriendsAndSlots()
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
        alert('Vous avez quitté cette disponibilité')
        fetchFriendsAndSlots()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la sortie')
      }
    } catch (error) {
      alert('Erreur de connexion au serveur')
    }
  }

  if (loading) {
    return (
      <div className="dispos-amis">
        <div className="loading">Chargement des disponibilités des amis...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dispos-amis">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="dispos-amis">
      <div className="dispos-amis-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <h2>Dispos des amis</h2>
        <p>{slots.length} disponibilité{slots.length !== 1 ? 's' : ''} d'ami{slots.length !== 1 ? 's' : ''}</p>
      </div>

      {slots.length === 0 ? (
        <div className="no-slots">
          <p>Aucune disponibilité d'ami pour le moment.</p>
          <p>Vos amis n'ont pas encore créé de dispos visibles par les amis.</p>
        </div>
      ) : (
        <div className="slots-list">
          {slots.map(slot => {
            const isParticipant = slot.participants && slot.participants.includes(currentUser.prenom)
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
                    <div className="slot-item-creator">
                      👤 {slot.createdBy}
                    </div>
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
                        <span>Aucun participant pour le moment</span>
                      )}
                    </div>

                    <div className="slot-creator-detail">
                      <strong>Créé par:</strong> {slot.createdBy}
                    </div>

                    <div className="slot-item-actions-detail">
                      <button 
                        className="action-btn discuss-btn"
                        onClick={() => setSelectedSlot(slot)}
                        title="Voir la discussion"
                      >
                        Discussion
                      </button>
                      
                      {isParticipant ? (
                        <button 
                          className="action-btn leave-btn"
                          onClick={() => handleLeaveSlot(slot.id)}
                          title="Quitter"
                        >
                          Quitter
                        </button>
                      ) : (
                        <button 
                          className="action-btn join-btn"
                          onClick={() => handleJoinSlot(slot.id)}
                          title="Rejoindre"
                        >
                          Rejoindre
                        </button>
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
    </div>
  )
}

export default DisposAmis
