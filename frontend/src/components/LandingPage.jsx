import React from 'react'
import './LandingPage.css'
import DownloadButton from './DownloadButton'

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
              <span className="highlight">Le calendrier inversé</span>
            </h1>
            <p className="hero-subtitle">
              Partage plutôt tes dispo, découvre qui est libre, et rejoignez-vous simplement!
            </p>
            <div className="hero-cta">
              <button 
                className="cta-button"
                onClick={handleGetStarted}
              >
                Commencer gratuitement
              </button>
              <DownloadButton />
              <p className="cta-note">
                ⭐⭐⭐⭐⭐ Rajoute tes dispo facilement
              </p>
              <div className="social-proof">
                <div className="user-avatars">
                  <div className="avatar">
                    <img src="/images/IA/fotor-ai-20250913204823.jpg" alt="Utilisateur 1" />
                  </div>
                  <div className="avatar">
                    <img src="/images/IA/openart-image_B_KtMGcm_1757788980530_raw.jpg" alt="Utilisateur 2" />
                  </div>
                  <div className="avatar">
                    <img src="/images/IA/openart-image_DddXYkRQ_1757788969939_raw.jpg" alt="Utilisateur 3" />
                  </div>
                  <div className="avatar">
                    <img src="/images/IA/openart-image_ho5cyNSy_1757788947800_raw.jpg" alt="Utilisateur 4" />
                  </div>
                </div>
                <p className="social-text">Rejoignez +500 utilisateurs qui affichent déjà leurs dispo</p>
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
                    <div className="mockup-slots-list">
                      <div className="mockup-slot-item">
                        <div className="mockup-slot-item-header">
                          <div className="mockup-slot-item-main">
                            <div className="mockup-slot-item-date">
                              <span className="date">15/01</span>
                              <span className="time">18h00 - 23h00</span>
                            </div>
                            <div className="mockup-slot-item-activity">
                              Apéro
                            </div>
                          </div>
                          <div className="mockup-slot-item-arrow">▼</div>
                        </div>
                        <div className="mockup-slot-item-content">
                          <div className="mockup-slot-description">
                            Apéro time !! Ramenez des boissons !
                          </div>
                          <div className="mockup-slot-participants">
                            👥 7 participants
                          </div>
                          <div className="mockup-slot-location">
                            📍 A la maison
                          </div>
                          <div className="mockup-slot-actions">
                            <button className="mockup-join-btn">Rejoindre</button>
                            <button className="mockup-discuss-btn">💬 Discuter</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mockup-activity-tabs">
                      <div className="tab">Sport</div>
                      <div className="tab active">Social</div>
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
            </div>
          </div>
        </div>
      </section>


      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="comparison-container">
          <h2>Pourquoi Playzio</h2>
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="comparison-th feature-header">Fonctionnalité</th>
                  <th className="comparison-th playzio-header">Playzio</th>
                  <th className="comparison-th competitor-header">WhatsApp</th>
                  <th className="comparison-th competitor-header">Agenda partagé</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="comparison-td feature-cell">Partager une dispo sans message</td>
                  <td className="comparison-td success-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#d4af8c"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Voir les dispos de mes amis</td>
                  <td className="comparison-td success-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#d4af8c"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Rejoindre une sortie en un clic</td>
                  <td className="comparison-td success-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#d4af8c"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Pas besoin de groupe dédié</td>
                  <td className="comparison-td success-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#d4af8c"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Pas d'engagement figé</td>
                  <td className="comparison-td success-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#d4af8c"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Accessible web + mobile facilement</td>
                  <td className="comparison-td success-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#d4af8c"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                  <td className="comparison-td error-cell">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#6b7280"/>
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
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
        </div>
      </footer>



    </div>
  )
}

export default LandingPage
