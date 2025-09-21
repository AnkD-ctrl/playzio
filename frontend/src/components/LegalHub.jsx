import React, { useState } from 'react'
import { MentionsLegales, PolitiqueConfidentialite, ConditionsUtilisation, ContactPage } from './LegalPages'
import './LegalHub.css'

const LegalHub = ({ onBack }) => {
  const [currentPage, setCurrentPage] = useState('hub')

  const renderPage = () => {
    switch (currentPage) {
      case 'mentions':
        return <MentionsLegales onBack={() => setCurrentPage('hub')} />
      case 'confidentialite':
        return <PolitiqueConfidentialite onBack={() => setCurrentPage('hub')} />
      case 'conditions':
        return <ConditionsUtilisation onBack={() => setCurrentPage('hub')} />
      case 'contact':
        return <ContactPage onBack={() => setCurrentPage('hub')} />
      default:
        return renderHub()
    }
  }

  const renderHub = () => {
    return (
      <div className="legal-hub">
        <div className="legal-hub-header">
          <button onClick={onBack} className="back-btn">
            ← Retour à l'accueil
          </button>
          <h1>Informations légales</h1>
          <p className="hub-description">
            Consultez nos pages légales pour comprendre comment nous protégeons vos données et les conditions d'utilisation de Playzio.
          </p>
        </div>
        
        <div className="legal-cards">
          <div className="legal-card" onClick={() => setCurrentPage('mentions')}>
            <div className="card-icon">⚖️</div>
            <h3>Mentions légales</h3>
            <p>Informations sur l'éditeur, l'hébergement et les responsabilités légales</p>
            <div className="card-arrow">→</div>
          </div>

          <div className="legal-card" onClick={() => setCurrentPage('confidentialite')}>
            <div className="card-icon">🔒</div>
            <h3>Politique de confidentialité</h3>
            <p>Comment nous collectons, utilisons et protégeons vos données personnelles</p>
            <div className="card-arrow">→</div>
          </div>

          <div className="legal-card" onClick={() => setCurrentPage('conditions')}>
            <div className="card-icon">📋</div>
            <h3>Conditions d'utilisation</h3>
            <p>Règles et conditions d'utilisation du service Playzio</p>
            <div className="card-arrow">→</div>
          </div>

          <div className="legal-card" onClick={() => setCurrentPage('contact')}>
            <div className="card-icon">📞</div>
            <h3>Contact</h3>
            <p>Comment nous contacter pour toute question ou réclamation</p>
            <div className="card-arrow">→</div>
          </div>
        </div>

        <div className="legal-footer">
          <p>
            <strong>Playzio</strong> - Plateforme de partage de disponibilités<br/>
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    )
  }

  return renderPage()
}

export default LegalHub
