import React, { useState, useEffect } from 'react'
import './CookieBanner.css'

function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('playzio_cookie_consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('playzio_cookie_consent', 'accepted')
    setShowBanner(false)
    console.log('Cookies acceptés')
  }

  const handleReject = () => {
    localStorage.setItem('playzio_cookie_consent', 'rejected')
    setShowBanner(false)
    console.log('Cookies refusés')
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <div className="cookie-banner-text">
          <h4>🍪 Cookies et données personnelles</h4>
          <p>
            Nous utilisons des cookies pour améliorer votre expérience et sauvegarder votre session de connexion. 
            Aucune donnée n'est partagée avec des tiers.
            <br/>
            <a href="/legal" style={{ color: '#d4af8c', textDecoration: 'underline' }}>
              En savoir plus sur notre politique de confidentialité
            </a>
            <br/>
            <span style={{ fontSize: '0.9rem', color: '#b0b0b0' }}>
              Contact : playzio.fr@gmail.com
            </span>
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button 
            className="cookie-btn reject-btn" 
            onClick={handleReject}
          >
            Refuser
          </button>
          <button 
            className="cookie-btn accept-btn" 
            onClick={handleAccept}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookieBanner
