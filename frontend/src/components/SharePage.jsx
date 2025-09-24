import React, { useState } from 'react'
import SlotList from './SlotList'
import Calendar from './Calendar'
import '../App.css'

const SharePage = ({ username }) => {
  // États pour les filtres et la vue
  const [showFilterModal, setShowFilterModal] = useState(false)
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

  const handleJoinSlot = () => {
    // Rediriger vers la page d'inscription
    window.location.href = `${window.location.origin}/#login`
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
        <button 
          onClick={handleJoinSlot}
          style={{
            background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(212, 175, 140, 0.3)'
          }}
        >
          S'inscrire pour rejoindre
        </button>
      </div>

      {/* Boutons de contrôle */}
      <div className="view-toggle-container" style={{ 
        position: 'relative',
        top: 'auto',
        left: 'auto',
        transform: 'none',
        zIndex: 'auto',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '8px', 
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        {/* Bouton filtre */}
        <button 
          className="view-toggle-btn filter-btn"
          onClick={() => setShowFilterModal(true)}
          title="Filtres"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Bouton rafraîchir */}
        <button 
          className="view-toggle-btn refresh-btn"
          onClick={() => window.location.reload()}
          title="Rafraîchir la page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Bouton basculement vue liste/calendrier */}
        <button 
          className="view-toggle-btn"
          onClick={() => setCurrentView(currentView === 'list' ? 'calendar' : 'list')}
          title={currentView === 'list' ? 'Vue calendrier' : 'Vue liste'}
        >
          {currentView === 'list' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
        </button>
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
          filterType="mes-dispo"
          activity={activityFilter}
          searchFilter={searchFilter}
          lieuFilter={lieuFilter}
          organizerFilter={organizerFilter}
          filterVersion={filterVersion}
          userGroups={[]}
          onJoinSlot={handleJoinSlot}
          selectedDate={selectedDate}
          onClearDate={handleClearDate}
        />
      ) : (
        <Calendar
          currentUser={mockUser}
          filterType="mes-dispo"
          activity={activityFilter}
          searchFilter={searchFilter}
          lieuFilter={lieuFilter}
          organizerFilter={organizerFilter}
          filterVersion={filterVersion}
          userGroups={[]}
          onJoinSlot={handleJoinSlot}
          selectedDate={selectedDate}
          onClearDate={handleClearDate}
          onDateSelect={handleDateSelect}
        />
      )}

      {/* Modal de filtres */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Filtres</h3>
            <div className="filter-options">
              <div className="filter-group">
                <label>Activité</label>
                <input 
                  type="text" 
                  placeholder="Rechercher une activité..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Lieu</label>
                <input 
                  type="text" 
                  placeholder="Rechercher un lieu..."
                  value={lieuFilter}
                  onChange={(e) => setLieuFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Organisateur</label>
                <input 
                  type="text" 
                  placeholder="Rechercher un organisateur..."
                  value={organizerFilter}
                  onChange={(e) => setOrganizerFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn btn-clear"
                onClick={() => {
                  setSearchFilter('')
                  setSelectedDate('')
                  setLieuFilter('')
                  setOrganizerFilter('')
                  setFilterVersion(prev => prev + 1)
                  setShowFilterModal(false)
                }}
              >
                Effacer
              </button>
              <button 
                className="modal-btn btn-apply"
                onClick={() => {
                  setFilterVersion(prev => prev + 1)
                  setShowFilterModal(false)
                }}
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SharePage
