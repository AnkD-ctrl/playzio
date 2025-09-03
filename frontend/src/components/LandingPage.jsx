import React, { useState, useEffect } from 'react'
import './LandingPage.css'
import Logo from './Logo'
import { API_BASE_URL } from '../config'

const LandingPage = ({ onLogin, onRegister, onStatsRefresh }) => {
  const [founderStats, setFounderStats] = useState(null)

  // Fonction pour charger les statistiques des membres premium
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

  // Charger les statistiques au montage du composant
  useEffect(() => {
    fetchFounderStats()
  }, [])

  // Recharger les statistiques toutes les 30 secondes pour avoir des données à jour
  useEffect(() => {
    const interval = setInterval(fetchFounderStats, 30000)
    return () => clearInterval(interval)
  }, [])

  // Recharger les statistiques quand la landing page devient visible
  useEffect(() => {
    fetchFounderStats()
  }, [onStatsRefresh])

  const handleGetStarted = () => {
    onRegister()
  }

  const handleAlreadyMember = () => {
    onLogin()
  }

  return (
    <div className="landing-page">
      {/* Header avec navigation */}
      <header className="landing-header">
        <div className="header-content">
          <Logo />
          <div className="header-actions">
            <button 
              className="btn-secondary"
              onClick={handleAlreadyMember}
            >
              Se connecter
            </button>
            <button 
              className="btn-primary"
              onClick={handleGetStarted}
            >
              Commencer gratuitement
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="highlight">Playzio</span>
            </h1>
            <p className="hero-subtitle">
              Plus besoin de s'envoyer des messages dans tous les sens. Posez votre disponibilité, 
              les membres de vos groupes la voient instantanément et vous contactent directement.
            </p>
            <div className="hero-cta">
              <button 
                className="cta-button"
                onClick={handleGetStarted}
              >
                <span className="cta-icon">🚀</span>
                Rejoindre Playzio
              </button>
              <p className="cta-note">
                Gratuit • {founderStats ? founderStats.founderCount : '238'} membres premium déjà inscrits
              </p>
              <div className="social-proof">
                <div className="user-avatars">
                  <div className="avatar">👤</div>
                  <div className="avatar">👩</div>
                  <div className="avatar">👨</div>
                  <div className="avatar">👩‍💼</div>
                  <div className="avatar">👨‍🎓</div>
                </div>
                <p className="social-text">Rejoignez des centaines d'utilisateurs qui organisent déjà leurs activités</p>
              </div>
            </div>
          </div>
          <div className="hero-mockup">
            <div className="mockup-container">
              <div className="mockup-phone">
                <div className="mockup-screen">
                  <div className="mockup-header">
                    <div className="mockup-dots">
                      <span></span><span></span><span></span>
                    </div>
                    <div className="mockup-title">Playzio</div>
                  </div>
                  <div className="mockup-content">
                    <div className="mockup-calendar">
                      <div className="mockup-day active">
                        <span className="day-number">15</span>
                        <div className="day-slots">
                          <div className="slot tennis">14h</div>
                          <div className="slot padel">16h</div>
                        </div>
                      </div>
                      <div className="mockup-day">
                        <span className="day-number">16</span>
                        <div className="day-slots">
                          <div className="slot soirée">20h</div>
                        </div>
                      </div>
                      <div className="mockup-day">
                        <span className="day-number">17</span>
                      </div>
                    </div>
                    <div className="mockup-activity-tabs">
                      <div className="tab active">Tennis</div>
                      <div className="tab">Padel</div>
                      <div className="tab">Soirée</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>1. Posez votre dispo</h3>
              <p>Ajoutez vos créneaux libres en quelques secondes : Tennis, Padel, Soirée...</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>2. Visible par vos groupes</h3>
              <p>Vos disponibilités apparaissent automatiquement pour les membres de vos groupes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>3. Contact direct</h3>
              <p>Ils vous contactent via la messagerie intégrée et hop, c'est parti !</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2>Fini les messages perdus dans les groupes WhatsApp</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Organisation claire et centralisée</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Plus de créneaux ratés</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Messagerie intégrée</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Calendrier visuel</span>
              </div>
            </div>
          </div>
          <div className="benefits-mockup">
            <div className="mockup-comparison">
              <div className="before-mockup">
                <div className="mockup-title">Avant</div>
                <div className="whatsapp-mockup">
                  <div className="message">"Qui est libre demain ?"</div>
                  <div className="message">"Moi mais pas avant 16h"</div>
                  <div className="message">"Et moi je peux qu'à 14h"</div>
                  <div className="message">"Bon bah on reporte ?"</div>
                </div>
              </div>
              <div className="arrow">→</div>
              <div className="after-mockup">
                <div className="mockup-title">Avec Playzio</div>
                <div className="playzio-mockup">
                  <div className="availability">🎾 Tennis - 15h</div>
                  <div className="availability">🏓 Padel - 17h</div>
                  <div className="availability">🍻 Soirée - 20h</div>
                  <div className="contact">💬 "Je rejoins le tennis !"</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offre de lancement */}
      <section className="launch-offer-section">
        <div className="launch-offer-content">
          <div className="offer-badge">
            <span className="crown-icon">👑</span>
            <span className="offer-text">Offre de lancement</span>
          </div>
          <div className="offer-main">
            <h2>Premium offert aux 1 000 premiers inscrits</h2>
            <p>Devenez membre premium de Playzio et profitez à vie de toutes les fonctionnalités avancées, gratuitement.</p>
            {founderStats && (
              <div className="founder-stats">
                <div className="stats-item">
                  <span className="stats-number">{founderStats.founderCount}</span>
                  <span className="stats-label">membres premium</span>
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
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="cta-content">
          <h2>Prêt à organiser vos activités ?</h2>
          <p>Rejoignez les {founderStats ? founderStats.founderCount : '238'} membres premium et profitez de toutes les fonctionnalités gratuitement</p>
          <div className="cta-buttons">
            <button 
              className="cta-button large"
              onClick={handleGetStarted}
            >
              <span className="cta-icon">👑</span>
              Devenir membre premium
            </button>
            <button 
              className="btn-secondary large"
              onClick={handleAlreadyMember}
            >
              J'ai déjà un compte
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <Logo />
          <p>Organisez vos activités entre amis, simplement.</p>
        </div>
      </footer>


    </div>
  )
}

export default LandingPage
