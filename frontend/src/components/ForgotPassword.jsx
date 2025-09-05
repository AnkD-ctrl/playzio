import React, { useState } from 'react'
import './ForgotPassword.css'
import { API_BASE_URL } from '../config'

function ForgotPassword({ onBack, onSuccess }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setMessage('Veuillez entrer votre adresse email')
      return
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Veuillez entrer une adresse email valide')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        setMessage(data.message)
      } else {
        setMessage(data.error || 'Erreur lors de l\'envoi de l\'email')
      }
    } catch (error) {
      console.error('Erreur forgot password:', error)
      setMessage('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-modal">
          <div className="modal-header">
            <h2>Email envoyé !</h2>
          </div>
          
          <div className="modal-content">
            <div className="success-icon">📧</div>
            <p className="success-message">{message}</p>
            <p className="success-info">
              Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
            </p>
            
            <div className="form-actions">
              <button 
                className="action-btn primary"
                onClick={onBack}
              >
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-modal">
        <div className="modal-header">
          <h2>Mot de passe oublié</h2>
          <button className="close-btn" onClick={onBack}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <p className="forgot-password-info">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={loading}
              />
            </div>
            
            {message && (
              <div className={`message ${message.includes('envoyé') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="action-btn secondary"
                onClick={onBack}
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="action-btn primary"
                disabled={loading}
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
