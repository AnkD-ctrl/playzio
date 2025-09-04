import React, { useState } from 'react'
import './CustomActivityModal.css'

function CustomActivityModal({ isOpen, onClose, onConfirm }) {
  const [activityName, setActivityName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!activityName.trim()) {
      setError('Veuillez saisir un nom d\'activité')
      return
    }
    
    if (activityName.trim().length < 2) {
      setError('Le nom doit contenir au moins 2 caractères')
      return
    }
    
    if (activityName.trim().length > 100) {
      setError('Le nom ne peut pas dépasser 100 caractères')
      return
    }
    
    onConfirm(activityName.trim())
    setActivityName('')
    setError('')
  }

  const handleClose = () => {
    setActivityName('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content custom-activity-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Nouvelle activité</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="custom-activity-form">
          <div className="form-group">
            <label htmlFor="activityName">Nom de l'activité</label>
            <input
              type="text"
              id="activityName"
              value={activityName}
              onChange={(e) => {
                setActivityName(e.target.value)
                setError('')
              }}
              placeholder="Ex: Football, Basketball, Cinéma... (max 100 caractères)"
              maxLength={100}
              autoFocus
            />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleClose}>
              Annuler
            </button>
            <button type="submit" className="confirm-btn">
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomActivityModal
