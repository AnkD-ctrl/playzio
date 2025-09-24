import React, { useState, useEffect } from 'react'
import SlotList from './SlotList'
import Calendar from './Calendar'
import { API_BASE_URL } from '../config'
import '../App.css'

const SharePage = ({ username, onNavigateToRegister }) => {
  // États pour les filtres et la vue
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [activityFilter, setActivityFilter] = useState('Tous')
  const [searchFilter, setSearchFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [filterVersion, setFilterVersion] = useState(0)
  const [currentView, setCurrentView] = useState('list') // 'list' ou 'calendar'
  const [linkExpired, setLinkExpired] = useState(false)
  
  // Créer un objet utilisateur fictif pour SlotList
  const mockUser = {
    prenom: username,
    role: 'user'
  }

  // Vérifier si le token est valide
  useEffect(() => {
    const validateToken = async () => {
      // Récupérer le token depuis l'URL
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1])
      const token = urlParams.get('token')
      
      if (!token) {
        setLinkExpired(true)
        return
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/share/validate-token/${username}/${token}`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.valid) {
            setLinkExpired(false)
          } else {
            setLinkExpired(true)
          }
        } else {
          setLinkExpired(true)
        }
      } catch (error) {
        console.error('Erreur lors de la validation du token:', error)
        setLinkExpired(true)
      }
    }

    validateToken()
  }, [username])


  const handleClearDate = () => {
    setSelectedDate('')
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setCurrentView('list') // Passer en vue liste quand on sélectionne une date
  }

  // Si le lien a expiré, afficher un message d'expiration
  if (linkExpired) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Playzio
          </h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#e0e0e0' }}>
            Lien expiré
          </h2>
          <p style={{ color: '#b0b0b0', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Ce lien de partage a expiré. Les liens de partage sont valables 24h seulement.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
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
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
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
        <div style={{ 
          backgroundColor: 'rgba(212, 175, 140, 0.1)', 
          border: '1px solid rgba(212, 175, 140, 0.3)', 
          borderRadius: '6px', 
          padding: '0.5rem 1rem', 
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: '#d4af8c'
        }}>
          ⏰ Ce lien de partage expire dans 24h
        </div>
        <button 
          onClick={() => onNavigateToRegister && onNavigateToRegister()}
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

      {/* Footer supprimé pour la page share */}

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
