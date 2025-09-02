import React, { useState, useEffect } from 'react'
import './LoginScreen.css'
import Logo from './Logo'
import { API_BASE_URL } from '../config'

function LoginScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    prenom: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [founderStats, setFounderStats] = useState(null)

  // Charger les statistiques des membres fondateurs
  useEffect(() => {
    const fetchFounderStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/founder-stats`)
        if (response.ok) {
          const stats = await response.json()
          setFounderStats(stats)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      }
    }
    
    fetchFounderStats()
  }, [])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register'
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          onLogin(data.user)
        } else {
          setIsLogin(true)
          setFormData({ prenom: '', password: '' })
          if (data.isFounder) {
            alert(`🎉 ${data.message}\n\nVous êtes le ${data.founderCount}ème membre fondateur de Playzio !`)
          } else {
            alert('Compte créé avec succès !')
          }
        }
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-container">
            <Logo size="large" showText={true} />
          </div>
          <p>Ne ratez pas une occasion de vous voir</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="prenom">Utilisateur</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              required
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>



          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button">
            {isLogin ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>

        <div className="toggle-form">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-button"
          >
            {isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        {/* Offre de lancement */}
        {!isLogin && (
          <div className="launch-offer">
            <div className="offer-badge">
              <span className="crown-icon">👑</span>
              <span className="offer-text">Offre de lancement</span>
            </div>
            <div className="offer-content">
              <h4>Premium offert aux 1 000 premiers inscrits</h4>
              <p>Devenez membre fondateur de Playzio et profitez à vie de toutes les fonctionnalités avancées, gratuitement.</p>
              {founderStats && (
                <div className="founder-stats">
                  <div className="stats-item">
                    <span className="stats-number">{founderStats.founderCount}</span>
                    <span className="stats-label">membres fondateurs</span>
                  </div>
                  <div className="stats-separator">•</div>
                  <div className="stats-item">
                    <span className={`stats-number ${founderStats.remainingFounderSlots <= 50 ? 'urgent' : ''}`}>
                      {founderStats.remainingFounderSlots}
                    </span>
                    <span className="stats-label">places restantes</span>
                  </div>
                </div>
              )}
              {founderStats && founderStats.remainingFounderSlots <= 50 && founderStats.remainingFounderSlots > 0 && (
                <div className="urgency-message">
                  ⚡ Plus que {founderStats.remainingFounderSlots} places disponibles !
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default LoginScreen