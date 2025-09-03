import React from 'react'
import './LandingPage.css'

const LandingPage = ({ onLogin, onRegister }) => {

  const handleGetStarted = () => {
    onRegister()
  }

  const handleAlreadyMember = () => {
    onLogin()
  }

  return (
    <div className="landing-page" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%)', 
      color: '#ffffff',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Header avec navigation */}
      <header className="landing-header">
        <div className="header-content">
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
                Gratuit • Rejoignez la communauté
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

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="cta-content">
          <h2>Prêt à organiser vos activités ?</h2>
          <p>Rejoignez la communauté et profitez de toutes les fonctionnalités gratuitement</p>
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
