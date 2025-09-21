import React, { useState } from 'react'
import SlotList from './SlotList'
import Calendar from './Calendar'
import '../App.css'

const SharePage = ({ username }) => {
  // États pour les filtres et la vue
  const [activityFilter, setActivityFilter] = useState('Tous')
  const [searchFilter, setSearchFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [filterVersion, setFilterVersion] = useState(0)
  const [currentView, setCurrentView] = useState('list') // 'list' ou 'calendar'
  
  // Créer un objet utilisateur fictif pour SlotList
  const mockUser = {
    prenom: username,
    role: 'user'
  }


  const handleClearDate = () => {
    setSelectedDate('')
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setCurrentView('list') // Passer en vue liste quand on sélectionne une date
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
    }}>
      {/* Header simplifié */}
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem 1rem 1rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Playzio
        </h1>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#e0e0e0' }}>
          Disponibilités de {username}
        </h2>
        <p style={{ color: '#b0b0b0', marginBottom: '1rem' }}>
          Découvrez les créneaux disponibles et rejoignez-les !
        </p>
      </div>


      {/* Indicateur de filtre date actif */}
      {selectedDate && (
        <div style={{
          textAlign: 'center',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(212, 175, 140, 0.1)',
          border: '1px solid rgba(212, 175, 140, 0.3)',
          borderRadius: '6px',
          margin: '0 1rem 1rem 1rem',
          color: '#d4af8c'
        }}>
          <span>📅 Filtre par date : {new Date(selectedDate).toLocaleDateString('fr-FR')}</span>
          <button 
            onClick={handleClearDate}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af8c',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              fontSize: '1rem'
            }}
            title="Effacer le filtre date"
          >
            ✕
          </button>
        </div>
      )}

      {/* Afficher SlotList ou Calendar selon currentView */}
      {currentView === 'list' ? (
        <SlotList
          currentUser={mockUser}
          filterType="mes-dispos"
          activity={activityFilter}
          searchFilter={searchFilter}
          lieuFilter={lieuFilter}
          organizerFilter={organizerFilter}
          filterVersion={filterVersion}
          userGroups={[]}
          onJoinSlot={null}
          selectedDate={selectedDate}
          onClearDate={handleClearDate}
        />
      ) : (
        <Calendar
          currentUser={mockUser}
          filterType="mes-dispos"
          activity={activityFilter}
          searchFilter={searchFilter}
          lieuFilter={lieuFilter}
          organizerFilter={organizerFilter}
          filterVersion={filterVersion}
          userGroups={[]}
          onJoinSlot={null}
          selectedDate={selectedDate}
          onClearDate={handleClearDate}
          onDateSelect={handleDateSelect}
        />
      )}

      {/* Footer */}
      <div className="activity-switcher-footer">
        <div className="view-toggle-container">
          <div className="footer-btn-wrapper">
            <button 
              className="view-toggle-btn"
              onClick={() => window.location.href = `${window.location.origin}/#login`}
              title="Se connecter"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="btn-label">Se connecter</span>
            </button>
          </div>
          
          <div className="footer-btn-wrapper">
            <button 
              className="view-toggle-btn"
              onClick={() => window.location.href = `${window.location.origin}/#register`}
              title="S'inscrire"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="btn-label">S'inscrire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharePage
