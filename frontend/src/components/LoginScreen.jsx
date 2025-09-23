import React, { useState, useEffect } from 'react'
import './LoginScreen.css'
import { API_BASE_URL } from '../config'
import ForgotPassword from './ForgotPassword'

function LoginScreen({ onLogin, isLogin: initialIsLogin = true, onBack }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin)
  const [formData, setFormData] = useState({
    prenom: '',
    password: '',
    email: ''
  })
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    console.log('🔐 handleSubmit appelé!')
    e.preventDefault()
    setError('')

    console.log('📝 Données du formulaire:', formData)
    console.log('🔑 Mode:', isLogin ? 'connexion' : 'inscription')

    // Validation email obligatoire pour l'inscription
    if (!isLogin) {
      if (!formData.email) {
        setError('Veuillez entrer une adresse email')
        return
      }
      if (!validateEmail(formData.email)) {
        setError('Veuillez entrer une adresse email valide')
        return
      }
    }

    console.log('🌐 Appel API vers:', `${API_BASE_URL}${isLogin ? '/api/login' : '/api/register'}`)

    try {
      const endpoint = isLogin ? '/api/login' : '/api/register'
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('📡 Réponse reçue:', response.status, response.statusText)
      const data = await response.json()
      console.log('📦 Données reçues:', data)

      if (response.ok) {
        console.log('✅ Connexion réussie!')
        if (isLogin) {
          onLogin(data.user)
        } else {
          setIsLogin(true)
          setFormData({ prenom: '', password: '', email: '' })
          if (data.isFounder) {
            alert(`🎉 ${data.message}`)
          } else {
            alert('Compte créé avec succès !')
          }
        }
      } else {
        console.log('❌ Erreur de connexion:', data.error)
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.log('💥 Erreur catch:', error.message)
      setError('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          {onBack && (
            <button 
              type="button" 
              className="back-button"
              onClick={onBack}
              title="Retour à l'accueil"
            >
              <span className="back-icon">←</span>
              <span className="back-text">Retour</span>
            </button>
          )}
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

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="votre@email.com"
              />
            </div>
          )}



          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button">
            {isLogin ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>

        {isLogin && (
          <div className="forgot-password-link">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="forgot-password-button"
            >
              Mot de passe oublié ?
            </button>
          </div>
        )}

        <div className="toggle-form">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="toggle-button"
          >
            {isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
          </button>
        </div>

        {/* Modal Mot de passe oublié */}
        {showForgotPassword && (
          <ForgotPassword
            onBack={() => setShowForgotPassword(false)}
            onSuccess={() => setShowForgotPassword(false)}
          />
        )}

      </div>
    </div>
  )
}

export default LoginScreen