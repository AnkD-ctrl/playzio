import React, { useState } from 'react'
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
              <span className="highlight">Partage tes dispos et on voit si ça match !</span>
            </h1>
            <p className="hero-subtitle">
            Le calendrier inversé pour passer à l’action : indiquez vos dispos, découvrez qui est libre, 
            et lancez une séance de sport ou un moment ensemble en un clic.
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
                  <div className="avatar">👤</div>
                  <div className="avatar">👩</div>
                  <div className="avatar">👨</div>
                  <div className="avatar">👩‍💼</div>
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

      {/* Personnas Section */}
      <section className="personnas-section">
        <div className="personnas-content">
          <h2 className="section-title">Ils utilisent déjà Playzio</h2>
          <div className="personnas-grid">
            <div className="personna-card">
              <div className="personna-avatar">👩‍💼</div>
              <div className="personna-info">
                <h3>Julie, 27 ans</h3>
                <p className="personna-title">Jeune active urbaine</p>
                <p className="personna-description">Vie sociale remplie mais agenda fluctuant. Frustrée par les boucles WhatsApp interminables pour organiser un apéro.</p>
                <div className="personna-benefit">
                  <strong>Bénéfice clé :</strong> spontanéité et simplicité.
                </div>
              </div>
            </div>
            
            <div className="personna-card">
              <div className="personna-avatar">🏓</div>
              <div className="personna-info">
                <h3>Marc, 35 ans</h3>
                <p className="personna-title">Sportif loisir</p>
                <p className="personna-description">Joue au padel et au tennis avec différents groupes d'amis. Fatigué des Doodle et des SMS groupés.</p>
                <div className="personna-benefit">
                  <strong>Bénéfice clé :</strong> voir quand quelqu'un est dispo et rejoindre instantanément.
                </div>
              </div>
            </div>
            
            <div className="personna-card">
              <div className="personna-avatar">🎓</div>
              <div className="personna-info">
                <h3>Amina, 21 ans</h3>
                <p className="personna-title">Étudiante introvertie</p>
                <p className="personna-description">Aimerait voir plus souvent ses amis, mais n'ose pas proposer. Craint les refus directs.</p>
                <div className="personna-benefit">
                  <strong>Bénéfice clé :</strong> elle peut signaler une dispo sans pression.
                </div>
              </div>
            </div>
            
            <div className="personna-card">
              <div className="personna-avatar">👨‍👩‍👧‍👦</div>
              <div className="personna-info">
                <h3>Claire & David, 40 ans</h3>
                <p className="personna-title">Parents occupés</p>
                <p className="personna-description">Peu de temps libre, veulent optimiser les créneaux.</p>
                <div className="personna-benefit">
                  <strong>Bénéfice clé :</strong> identifier rapidement quand des amis ou de la famille sont disponibles.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="comparison-container">
          <h2>Pourquoi Playzio fait la différence</h2>
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
                  <td className="comparison-td success-cell">Oui</td>
                  <td className="comparison-td error-cell">Non</td>
                  <td className="comparison-td error-cell">Non</td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Voir les dispos de mes amis</td>
                  <td className="comparison-td success-cell">Oui</td>
                  <td className="comparison-td error-cell">Non</td>
                  <td className="comparison-td error-cell">Non</td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Rejoindre une sortie en un clic</td>
                  <td className="comparison-td success-cell">Oui</td>
                  <td className="comparison-td error-cell">Non</td>
                  <td className="comparison-td error-cell">Non</td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Pas besoin de groupe dédié</td>
                  <td className="comparison-td success-cell">Oui</td>
                  <td className="comparison-td error-cell">Non</td>
                  <td className="comparison-td error-cell">Non</td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Pas d'engagement figé</td>
                  <td className="comparison-td success-cell">Oui</td>
                  <td className="comparison-td warning-cell">Partiel</td>
                  <td className="comparison-td error-cell">Non</td>
                </tr>
                <tr>
                  <td className="comparison-td feature-cell">Accessible web + mobile facilement</td>
                  <td className="comparison-td success-cell">Oui</td>
                  <td className="comparison-td warning-cell">Partiel</td>
                  <td className="comparison-td warning-cell">Partiel</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="comparison-cta">
            <button 
              className="comparison-button"
              onClick={handleGetStarted}
            >
              Essayez Playzio – Gratuit et sans engagement
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
        </div>
      </footer>



    </div>
  )
}

export default LandingPage
