import React, { useState, useEffect } from 'react'
import './AddSlot.css'
import { API_BASE_URL } from '../config'
import { trackSlotCreate } from '../utils/analytics'

function AddSlot({ activity, currentUser, onSlotAdded }) {
  const [formData, setFormData] = useState({
    date: '',
    heureDebut: '',
    heureFin: '',
    description: ''
  })
  const [selectedGroups, setSelectedGroups] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserGroups()
  }, [])

  const fetchUserGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups?user=${currentUser.prenom}`)
      const data = await response.json()
      setUserGroups(data)
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const slotData = {
        ...formData,
        type: activity,
        createdBy: currentUser.prenom,
        visibleToGroups: selectedGroups
      }

      const response = await fetch(`${API_BASE_URL}/api/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
      })

      if (response.ok) {
        trackSlotCreate(activity, selectedGroups.length > 0)
        alert('Disponibilité ajoutée avec succès !')
        setFormData({ date: '', heureDebut: '', heureFin: '', description: '' })
        setSelectedGroups([])
        onSlotAdded()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="add-slot">
      <div className="add-slot-content">
        <form onSubmit={handleSubmit} className="slot-form">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="heureDebut">Heure de début</label>
            <input
              type="time"
              id="heureDebut"
              name="heureDebut"
              value={formData.heureDebut}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="heureFin">Heure de fin</label>
            <input
              type="time"
              id="heureFin"
              name="heureFin"
              value={formData.heureFin}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez votre disponibilité..."
              rows="4"
            />
          </div>

          {userGroups.length > 0 && (
            <div className="form-group">
              <label>Visibilité (sélectionnez les groupes qui peuvent voir cette disponibilité)</label>
              <div className="groups-selection">
                {userGroups.map(group => (
                  <label key={group.id} className="group-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                    />
                    <span className="group-name">{group.name}</span>
                    <span className="group-members-count">({group.members.length} membres)</span>
                  </label>
                ))}
              </div>
              {selectedGroups.length === 0 && (
                <p className="visibility-info">
                  ⚠️ Aucun groupe sélectionné : cette disponibilité sera visible par tous les utilisateurs
                </p>
              )}
              {selectedGroups.length > 0 && (
                <p className="visibility-info">
                  ✅ Cette disponibilité sera visible par {selectedGroups.length} groupe(s) sélectionné(s)
                </p>
              )}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => onSlotAdded()}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter la disponibilité'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSlot