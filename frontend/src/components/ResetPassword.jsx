import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './ResetPassword.css'
import { API_BASE_URL } from '../config'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setMessage('Token de réinitialisation manquant')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!password || !confirmPassword) {
      setMessage('Veuillez remplir tous les champs')
      return
    }
    
    if (password.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password 
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess(true)
        setMessage(data.message)
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/')
        }, 3000)
      } else {
        setMessage(data.error || 'Erreur lors de la réinitialisation')
      }
    } catch (error) {
      console.error('Erreur reset password:', error)
      setMessage('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-modal">
          <div className="modal-header">
            <h2>Mot de passe réinitialisé !</h2>
          </div>
          
          <div className="modal-content">
            <div className="success-icon">✅</div>
            <p className="success-message">{message}</p>
            <p className="success-info">
              Vous allez être redirigé vers la page de connexion dans quelques secondes...
            </p>
            
            <div className="form-actions">
              <button 
                className="action-btn primary"
                onClick={() => navigate('/')}
              >
                Se connecter maintenant
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-modal">
          <div className="modal-header">
            <h2>Token invalide</h2>
          </div>
          
          <div className="modal-content">
            <div className="error-icon">❌</div>
            <p className="error-message">Le lien de réinitialisation est invalide ou expiré.</p>
            
            <div className="form-actions">
              <button 
                className="action-btn primary"
                onClick={() => navigate('/')}
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
    <div className="reset-password-container">
      <div className="reset-password-modal">
        <div className="modal-header">
          <h2>Nouveau mot de passe</h2>
        </div>
        
        <div className="modal-content">
          <p className="reset-password-info">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre nouveau mot de passe"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            {message && (
              <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="action-btn primary"
                disabled={loading}
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
