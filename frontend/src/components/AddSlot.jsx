import React, { useState } from 'react'
import './AddSlot.css'

function AddSlot({ activity, currentUser, onSlotAdded }) {
  const [formData, setFormData] = useState({
    date: '',
    heureDebut: '',
    heureFin: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const slotData = {
        ...formData,
        type: activity,
        user: currentUser.prenom,
        userId: currentUser.id
      }

      const response = await fetch('http://localhost:3001/api/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
      })

      if (response.ok) {
        alert('Disponibilité ajoutée avec succès !')
        setFormData({ date: '', heureDebut: '', heureFin: '', description: '' })
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