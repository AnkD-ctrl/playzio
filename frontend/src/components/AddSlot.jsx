import React, { useState, useEffect } from 'react'
import './AddSlot.css'
import { API_BASE_URL } from '../config'
import { trackSlotCreate } from '../utils/analytics'
import CustomActivityModal from './CustomActivityModal'

function AddSlot({ activity, currentUser, onSlotAdded, preSelectedDate }) {
  const [formData, setFormData] = useState({
    date: preSelectedDate || '',
    heureDebut: '',
    heureFin: '',
    description: '',
    lieu: '',
    maxParticipants: ''
  })
  const [selectedDates, setSelectedDates] = useState(preSelectedDate ? [preSelectedDate] : [])
  const [selectedActivities, setSelectedActivities] = useState([activity])
  const [selectedGroups, setSelectedGroups] = useState([])
  const [visibleToAll, setVisibleToAll] = useState(true)
  const [userGroups, setUserGroups] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showCustomActivityModal, setShowCustomActivityModal] = useState(false)
  const [customActivityName, setCustomActivityName] = useState('')

  const availableActivities = ['Sport', 'Social', 'Autre']

  useEffect(() => {
    fetchUserGroups()
  }, [])

  useEffect(() => {
    if (preSelectedDate) {
      setFormData(prev => ({ ...prev, date: preSelectedDate }))
      setSelectedDates([preSelectedDate])
    }
  }, [preSelectedDate])

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

  const handleDateAdd = () => {
    if (formData.date && !selectedDates.includes(formData.date)) {
      setSelectedDates(prev => [...prev, formData.date])
      setFormData(prev => ({ ...prev, date: '' }))
    }
  }

  const handleDateRemove = (dateToRemove) => {
    setSelectedDates(prev => prev.filter(date => date !== dateToRemove))
  }

  const handleActivityToggle = (activityName) => {
    setSelectedActivities(prev => 
      prev.includes(activityName) 
        ? prev.filter(act => act !== activityName)
        : [...prev, activityName]
    )
  }

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleVisibleToAllToggle = () => {
    setVisibleToAll(prev => !prev)
    if (!visibleToAll) {
      // Si on active "Publique", on désactive tous les groupes
      setSelectedGroups([])
    }
  }

  const handleCustomActivityConfirm = (activityName) => {
    setCustomActivityName(activityName)
    setShowCustomActivityModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (selectedActivities.length === 0) {
      setError('Veuillez sélectionner au moins une activité')
      setIsSubmitting(false)
      return
    }

    if (selectedDates.length === 0) {
      setError('Veuillez sélectionner au moins une date')
      setIsSubmitting(false)
      return
    }

    try {
      const baseSlotData = {
        heureDebut: formData.heureDebut,
        heureFin: formData.heureFin,
        description: formData.description,
        lieu: formData.lieu,
        maxParticipants: formData.maxParticipants,
        type: selectedActivities,
        customActivity: customActivityName || null,
        createdBy: currentUser.prenom,
        visibleToGroups: visibleToAll ? [] : selectedGroups,
        visibleToAll: visibleToAll
      }

      // Créer un slot pour chaque date sélectionnée
      const promises = selectedDates.map(date => {
        const slotData = {
          ...baseSlotData,
          date: date
        }

        return fetch(`${API_BASE_URL}/api/slots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slotData),
        })
      })

      const responses = await Promise.all(promises)
      const failedResponses = responses.filter(response => !response.ok)

      if (failedResponses.length === 0) {
        trackSlotCreate(selectedActivities.join(', '), selectedGroups.length > 0)
        alert(`${selectedDates.length} disponibilité(s) ajoutée(s) avec succès !`)
        setFormData({ date: '', heureDebut: '', heureFin: '', description: '', lieu: '', maxParticipants: '' })
        setSelectedDates([])
        setSelectedActivities([activity])
        setSelectedGroups([])
        setCustomActivityName('')
        onSlotAdded()
      } else {
        setError(`${failedResponses.length} disponibilité(s) n'a/ont pas pu être créée(s)`)
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
            <label htmlFor="date">Dates (sélectionner plusieurs si nécessaire)</label>
            <div className="date-selector">
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
              <button 
                type="button" 
                onClick={handleDateAdd}
                disabled={!formData.date || selectedDates.includes(formData.date)}
                className="add-date-btn"
              >
                Ajouter
              </button>
            </div>
            
            {selectedDates.length > 0 && (
              <div className="selected-dates">
                <p className="selected-dates-label">Dates sélectionnées ({selectedDates.length}) :</p>
                <div className="dates-list">
                  {selectedDates.map(date => (
                    <div key={date} className="date-tag">
                      <span>{new Date(date).toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}</span>
                      <button 
                        type="button" 
                        onClick={() => handleDateRemove(date)}
                        className="remove-date-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <label>Activités concernées</label>
            <div className="activities-selection">
              {availableActivities.map(activityName => (
                <label key={activityName} className="activity-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activityName)}
                    onChange={() => handleActivityToggle(activityName)}
                  />
                  <span className="activity-name">{activityName}</span>
                </label>
              ))}
            </div>
            
            {(selectedActivities.includes('Autre') || selectedActivities.includes('Sport') || selectedActivities.includes('Social')) && (
              <div className="custom-activity-section">
                {customActivityName ? (
                  <div className="custom-activity-display">
                    <span className="custom-activity-label">Activité personnalisée :</span>
                    <span className="custom-activity-name">{customActivityName}</span>
                    <button 
                      type="button" 
                      className="change-activity-btn"
                      onClick={() => setShowCustomActivityModal(true)}
                    >
                      Modifier
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="add-custom-activity-btn"
                    onClick={() => setShowCustomActivityModal(true)}
                  >
                    + Saisir le nom de l'activité
                  </button>
                )}
              </div>
            )}
            
            {selectedActivities.length === 0 && (
              <p className="selection-info">
                ⚠️ Veuillez sélectionner au moins une activité
              </p>
            )}

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

          <div className="form-group">
            <label htmlFor="lieu">Lieu</label>
            <input
              type="text"
              id="lieu"
              name="lieu"
              value={formData.lieu}
              onChange={handleInputChange}
              placeholder="Où se déroule l'activité ? (ex: Parc de la Tête d'Or, Lyon)"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxParticipants">Nombre maximum de participants</label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              placeholder="Nombre maximum de personnes (optionnel)"
              min="1"
              max="100"
            />
            <small className="field-help">Laissez vide pour un nombre illimité</small>
          </div>

          <div className="form-group">
            <label>Visibilité</label>
            <div className="visibility-options">
              <label className="visibility-option">
                <input
                  type="checkbox"
                  checked={visibleToAll}
                  onChange={handleVisibleToAllToggle}
                />
                <span className="visibility-label">Publique (visible par tout le monde)</span>
              </label>
            </div>
            
            {userGroups.length > 0 && (
              <div className="groups-selection">
                <label className="groups-subtitle">Groupes spécifiques (optionnel)</label>
                {userGroups.map(group => (
                  <label key={group.id} className="group-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupToggle(group.id)}
                      disabled={visibleToAll}
                    />
                    <span className="group-name">{group.name}</span>
                    <span className="group-members-count">({group.members.length} membres)</span>
                  </label>
                ))}
              </div>
            )}

            {visibleToAll && (
              <p className="visibility-info">
                ✅ Cette disponibilité sera visible par tout le monde
              </p>
            )}
            {!visibleToAll && selectedGroups.length === 0 && (
              <p className="visibility-info">
                ⚠️ Aucun groupe sélectionné : cette disponibilité sera visible par tous les utilisateurs
              </p>
            )}
            {!visibleToAll && selectedGroups.length > 0 && (
              <p className="visibility-info">
                ✅ Cette disponibilité sera visible par {selectedGroups.length} groupe(s) sélectionné(s)
              </p>
            )}
          </div>

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
      
      {/* Modal pour saisir le nom d'activité personnalisée */}
      {showCustomActivityModal && (
        <CustomActivityModal 
          isOpen={showCustomActivityModal}
          onClose={() => setShowCustomActivityModal(false)}
          onConfirm={handleCustomActivityConfirm}
        />
      )}
    </div>
  )
}

export default AddSlot