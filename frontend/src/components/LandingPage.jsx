import React, { useState } from 'react'
import './LandingPage.css'
import ContactModal from './ContactModal'

const LandingPage = ({ onLogin, onRegister }) => {
  const [showContactModal, setShowContactModal] = useState(false)

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
              <span className="highlight">Simple</span>
            </h1>
            <p className="hero-subtitle">
              Fini les boucles WhatsApp : posez vos dispos, vos amis les voient et vous rejoignent.
            </p>
            <div className="hero-cta">
              <button 
                className="cta-button"
                onClick={handleGetStarted}
              >
                Commencer gratuitement
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
                          <div className="slot sport">14h</div>
                          <div className="slot social">16h</div>
                        </div>
                      </div>
                      <div className="mockup-day">
                        <span className="day-number">16</span>
                        <div className="day-slots">
                          <div className="slot autre">20h</div>
                        </div>
                      </div>
                      <div className="mockup-day">
                        <span className="day-number">17</span>
                      </div>
                    </div>
                    <div className="mockup-activity-tabs">
                      <div className="tab active">Sport</div>
                      <div className="tab">Social</div>
                      <div className="tab">Autre</div>
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
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#d4af8c" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#d4af8c" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#d4af8c" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#d4af8c" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Posez vos dispo</h3>
              <p>Ajoutez vos créneaux libres en quelques secondes : Sport, Social, Autre...</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#d4af8c" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="#d4af8c" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#d4af8c" strokeWidth="2"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#d4af8c" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Visible par vos groupes</h3>
              <p>Vos disponibilités apparaissent automatiquement pour les membres de vos groupes.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#d4af8c" strokeWidth="2"/>
                  <path d="M8 9h8" stroke="#d4af8c" strokeWidth="2"/>
                  <path d="M8 13h6" stroke="#d4af8c" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Chaque dispo a sa discussion</h3>
              <p>Chaque dispo a sa discussion → plus besoin de groupes WhatsApp inutiles.</p>
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
                  <div className="whatsapp-header">
                    <div className="whatsapp-avatar">👥</div>
                    <div className="whatsapp-info">
                      <div className="whatsapp-name">Groupe Tennis</div>
                      <div className="whatsapp-status">5 membres</div>
                    </div>
                    <div className="whatsapp-actions">⋮</div>
                  </div>
                  <div className="whatsapp-messages">
                    <div className="message received">
                      <div className="message-content">Qui est libre demain ?</div>
                    </div>
                    <div className="message sent">
                      <div className="message-content">Moi mais pas avant 16h</div>
                    </div>
                    <div className="message received">
                      <div className="message-content">Et moi qu'à 14h</div>
                    </div>
                    <div className="message received">
                      <div className="message-content">Bon bah on reporte ? 😅</div>
                    </div>
                  </div>
                  <div className="whatsapp-input">
                    <div className="input-placeholder">Tapez un message...</div>
                  </div>
                </div>
              </div>
              <div className="arrow">→</div>
              <div className="after-mockup">
                <div className="mockup-title">Avec Playzio</div>
                <div className="playzio-simple">
                  <div className="slot-card-demo">
                    <div className="slot-header">
                      <div className="slot-activity">⚽ Sport</div>
                      <div className="slot-time">15h00 - 17h00</div>
                    </div>
                    <div className="slot-date">Demain 15/01</div>
                    <div className="slot-participants">👥 2 participants</div>
                    <div className="arrow-to-button">↓</div>
                    <button className="join-button">Rejoindre</button>
                  </div>
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
              Commencer gratuitement
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

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-content">
          <button 
            className="contact-btn"
            onClick={() => setShowContactModal(true)}
          >
            💬 Nous contacter
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>Organisez vos activités entre amis, simplement.</p>
        </div>
      </footer>

      {/* Modal de Contact */}
      {showContactModal && (
        <ContactModal 
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          currentUser={null}
        />
      )}


    </div>
  )
}

export default LandingPage
