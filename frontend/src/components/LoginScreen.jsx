import React, { useState, useEffect } from 'react'
import './LoginScreen.css'
import Logo from './Logo'
import { API_BASE_URL } from '../config'

function LoginScreen({ onLogin, isLogin: initialIsLogin = true, onBack }) {
  const [isLogin, setIsLogin] = useState(initialIsLogin)
  const [formData, setFormData] = useState({
    prenom: '',
    password: ''
  })
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
          {onBack && (
            <button 
              type="button" 
              className="back-button"
              onClick={onBack}
            >
              ← Retour
            </button>
          )}
          <div className="logo-container">
            <Logo size="large" showText={true} />
          </div>
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



      </div>
    </div>
  )
}

export default LoginScreen