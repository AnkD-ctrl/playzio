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
              <span className="highlight">Vivez les tous!</span>
            </h1>
            <p className="hero-subtitle">
              Combien de fois tu n'as pas vu tes amis alors que vous étiez dispo?
            </p>
            <div className="hero-cta">
              <button 
                className="cta-button"
                onClick={handleGetStarted}
              >
                Commencer gratuitement
              </button>
              <p className="cta-note">
                Gratuit • Rejoignez les +500 utilisateurs
              </p>
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
                    <div className="mockup-slots-list">
                      <div className="mockup-slot-item">
                        <div className="mockup-slot-item-header">
                          <div className="mockup-slot-item-main">
                            <div className="mockup-slot-item-date">
                              <span className="date">15/01</span>
                              <span className="time">14h30 - 16h30</span>
                            </div>
                            <div className="mockup-slot-item-activity">
                              Padel
                            </div>
                          </div>
                          <div className="mockup-slot-item-arrow">▼</div>
                        </div>
                        <div className="mockup-slot-item-content">
                          <div className="mockup-slot-description">
                            Partie de padel entre amis, niveau intermédiaire.
                          </div>
                          <div className="mockup-slot-participants">
                            👥 2 participants
                          </div>
                          <div className="mockup-slot-location">
                            📍 Club de tennis
                          </div>
                          <div className="mockup-slot-actions">
                            <button className="mockup-join-btn">Rejoindre</button>
                            <button className="mockup-discuss-btn">💬 Discuter</button>
                          </div>
                        </div>
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
              <h3>Pose ta dispo</h3>
              <p>Un clic, aucun engagement.</p>
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
              <h3>Vois celles des autres</h3>
              <p>Repère les opportunités.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#d4af8c" strokeWidth="2"/>
                  <path d="M8 9h8" stroke="#d4af8c" strokeWidth="2"/>
                  <path d="M8 13h6" stroke="#d4af8c" strokeWidth="2"/>
                </svg>
              </div>
              <h3>Rejoins en un clic</h3>
              <p>Une notif et c'est parti.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Playzio is NOT Section */}
      <section className="what-not-section">
        <div className="what-not-content">
          <h2 className="section-title">Playzio</h2>
          <div className="what-not-grid">
            <div className="what-not-item negative">
              <div className="what-not-text">
                <h3>Ce n'est pas un agenda connecté</h3>
                <p>Pas besoin de synchroniser vos calendriers</p>
              </div>
            </div>
            <div className="what-not-item negative">
              <div className="what-not-text">
                <h3>Ce n'est pas un sondage</h3>
                <p>Pas de questions à répondre, pas de contraintes</p>
              </div>
            </div>
            <div className="what-not-item negative">
              <div className="what-not-text">
                <h3>Ce n'est pas une messagerie de plus</h3>
                <p>Pas de notifications en continu, pas de spam</p>
              </div>
            </div>
            <div className="what-not-item positive">
              <div className="what-not-text">
                <h3>C'est juste le bouton "Je suis dispo"</h3>
                <p>Partagé avec tes amis, c'est tout !</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-content">
          <h2 className="section-title">Efficace</h2>
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
          <div className="offer-main">
            <h2>1 000 premiers inscrits</h2>
            <p>Toutes les fonctionnalités restent gratuites pour tous. 
              Les membres premium nous ont fait confiance les premiers et en seront récompensés.</p>
            <button 
              className="cta-button large"
              onClick={handleGetStarted}
            >
              Commencer gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="cta-content">
          <h2>Prêt à saisir tes dispo ?</h2>
          <p>Rejoignez les utilisateurs et profitez de toutes les fonctionnalités gratuitement</p>
          <div className="cta-buttons">
            <button 
              className="cta-button large"
              onClick={handleGetStarted}
            >
              Commencer gratuitement
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-contact">
            <span 
              className="contact-link"
              onClick={() => setShowContactModal(true)}
            >
              Nous contacter
            </span>
          </div>
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
