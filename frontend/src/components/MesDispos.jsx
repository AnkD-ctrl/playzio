import React, { useState, useEffect } from 'react'
import './MesDispos.css'
import { API_BASE_URL } from '../config'
import SlotDiscussion from './SlotDiscussion'

function MesDispos({ currentUser, onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [expandedSlots, setExpandedSlots] = useState(new Set())

  useEffect(() => {
    if (currentUser && currentUser.prenom) {
      fetchMySlots()
    }
  }, [currentUser])

  const fetchMySlots = async () => {
    try {
      setLoading(true)
      console.log('🔍 Récupération des slots de:', currentUser.prenom)
      
      // LOGIQUE SIMPLE : Récupérer TOUS les slots et filtrer côté frontend
      const url = `${API_BASE_URL}/api/slots`
      const response = await fetch(url)
      
      if (response.ok) {
        const allSlots = await response.json()
        console.log('📥 Tous les slots reçus:', allSlots.length)
        
        // FILTRAGE SIMPLE : Seulement les slots créés par l'utilisateur
        const mySlots = allSlots.filter(slot => slot.createdBy === currentUser.prenom)
        console.log('📥 Mes slots filtrés:', mySlots.length)
        
        setSlots(mySlots)
      } else {
        console.log('❌ Erreur API:', response.status, response.statusText)
        setError('Erreur lors du chargement de vos disponibilités')
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
        fetchMySlots()
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
      <div className="mes-dispos">
        <div className="loading">Chargement de vos disponibilités...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mes-dispos">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="mes-dispos">
      <div className="mes-dispos-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <h2>Mes disponibilités</h2>
        <p>{slots.length} disponibilité{slots.length !== 1 ? 's' : ''}</p>
      </div>

      {slots.length === 0 ? (
        <div className="no-slots">
          <p>Vous n'avez créé aucune disponibilité pour le moment.</p>
          <p>Créez votre première dispo en cliquant sur le bouton +</p>
        </div>
      ) : (
        <div className="slots-list">
          {slots.map(slot => {
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

                    <div className="slot-visibility">
                      <strong>Visibilité:</strong>
                      <div className="visibility-tags">
                        {slot.visibleToAll && <span className="visibility-tag public">Public</span>}
                        {slot.visibleToFriends && <span className="visibility-tag friends">Amis</span>}
                        {slot.visibleToGroups && slot.visibleToGroups.length > 0 && (
                          <span className="visibility-tag groups">Groupes</span>
                        )}
                        {!slot.visibleToAll && !slot.visibleToFriends && (!slot.visibleToGroups || slot.visibleToGroups.length === 0) && (
                          <span className="visibility-tag private">Privé</span>
                        )}
                      </div>
                    </div>

                    <div className="slot-item-actions-detail">
                      <button 
                        className="action-btn discuss-btn"
                        onClick={() => setSelectedSlot(slot)}
                        title="Voir la discussion"
                      >
                        Discussion
                      </button>
                      
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteSlot(slot.id)}
                        title="Supprimer"
                      >
                        Supprimer
                      </button>
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

export default MesDispos
