import React, { useState, useEffect } from 'react'
import './App.css'
import Logo from './components/Logo'
import LandingPage from './components/LandingPage'
import LoginScreen from './components/LoginScreen'
import ResetPassword from './components/ResetPassword'

import AddSlot from './components/AddSlot'
import SlotList from './components/SlotList'
import Calendar from './components/Calendar'
import UserProfile from './components/UserProfile'
import Groups from './components/Groups'
import ContactModal from './components/ContactModal'
import CookieBanner from './components/CookieBanner'
import PWAInstaller from './components/PWAInstaller'
import InstallGuide from './components/InstallGuide'
import { trackPageView, trackLogin, trackLogout, trackActivitySelect, trackNavigation } from './utils/analytics'
import { testAnalyticsExclusion } from './utils/testAnalytics'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentView, setCurrentView] = useState('landing') // Commencer par la landing page
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [selectedType, setSelectedType] = useState('mes-dispo')
  const [selectedDate, setSelectedDate] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')


  // Vérifier si on est sur la page de réinitialisation de mot de passe ou guide d'installation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('token')) {
      setCurrentView('reset-password')
    }
    
    // Vérifier aussi le pathname pour /reset-password
    if (window.location.pathname === '/reset-password') {
      setCurrentView('reset-password')
    }
    
    // Vérifier le pathname pour /install-guide
    if (window.location.pathname === '/install-guide') {
      setCurrentView('install-guide')
    }
  }, [])

  // Restaurer la session au chargement
  useEffect(() => {
    const cookieConsent = localStorage.getItem('playzio_cookie_consent')
    const savedUser = localStorage.getItem('playzio_user')
    const savedLoginState = localStorage.getItem('playzio_logged_in')
    
    // Ne restaurer la session que si les cookies sont acceptés
    if (cookieConsent === 'accepted' && savedUser && savedLoginState === 'true') {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsLoggedIn(true)
        setCurrentView('activity')
        setSelectedActivity('Tous')
        console.log('Session restaurée:', user.prenom)
      } catch (error) {
        console.error('Erreur lors de la restauration de la session:', error)
        // Nettoyer les données corrompues
        localStorage.removeItem('playzio_user')
        localStorage.removeItem('playzio_logged_in')
      }
    } else if (cookieConsent === 'rejected') {
      // Nettoyer les données si les cookies sont refusés
      localStorage.removeItem('playzio_user')
      localStorage.removeItem('playzio_logged_in')
    }
  }, [])

  // Test d'exclusion d'IP au chargement
  useEffect(() => {
    console.log('App loaded, currentView:', currentView)
    testAnalyticsExclusion()
  }, [])

  // Track page views when view changes
  useEffect(() => {
    if (currentView === 'groups') {
      trackPageView('Groups Page')
    } else if (currentView === 'activity') {
      trackPageView(`Activity: ${selectedActivity}`)
    }
  }, [currentView, selectedActivity])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
    setSelectedActivity('Tous') // Aller directement à l'activité "Tous"
    setSelectedType('list') // Afficher la liste par défaut
    setCurrentView('activity')
    
    // Sauvegarder la session dans localStorage seulement si les cookies sont acceptés
    const cookieConsent = localStorage.getItem('playzio_cookie_consent')
    if (cookieConsent === 'accepted') {
      localStorage.setItem('playzio_user', JSON.stringify(user))
      localStorage.setItem('playzio_logged_in', 'true')
      console.log('Session sauvegardée:', user.prenom)
    } else {
      console.log('Session non sauvegardée - cookies non acceptés')
    }
    
    trackLogin(user.role || 'user')
  }

  const handleLogout = () => {
    trackLogout()
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentView('landing') // Retourner à la landing page après déconnexion
    setSelectedActivity(null)
    setSelectedType('list')
    
    // Nettoyer la session du localStorage
    localStorage.removeItem('playzio_user')
    localStorage.removeItem('playzio_logged_in')
    
    console.log('Session supprimée')
  }

  // Fonctions pour la navigation depuis la landing page
  const handleLandingLogin = () => {
    setCurrentView('login')
    trackNavigation('landing', 'login')
  }

  const handleLandingRegister = () => {
    setCurrentView('register')
    trackNavigation('landing', 'register')
  }



  const handleActivitySelect = (activity) => {
    trackActivitySelect(activity)
    setSelectedActivity(activity)
    setCurrentView('activity')
    setSelectedType('calendar')
    setSelectedDate(null)
    setSearchFilter('') // Réinitialiser le filtre de recherche
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedType('list')
  }

  const handleViewChange = (view) => {
    trackNavigation(currentView, view)
    setCurrentView(view)
  }

  const handleTypeChange = (type) => {
    setSelectedType(type)
  }

  const handleSearchFilterChange = (filter) => {
    setSearchFilter(filter)
  }

  // Suppression de la redirection automatique pour permettre la landing page
  // if (!isLoggedIn) {
  //   return <LoginScreen onLogin={handleLogin} />
  // }

  return (
    <div className="app">
      {currentView !== 'landing' && currentView !== 'login' && currentView !== 'register' && isLoggedIn && (
        <div className="app-header">
          <div className="header-content">
            <div className="header-actions">
              <button 
                className="groups-btn"
                onClick={() => setCurrentView('groups')}
              >
                Mes Groupes
              </button>
              <button 
                className="profile-btn"
                onClick={() => setShowUserProfile(true)}
              >
                Mon compte
              </button>
              <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'landing' && (
        <>
          {console.log('Rendering LandingPage')}
          <LandingPage 
            onLogin={handleLandingLogin}
            onRegister={handleLandingRegister}
          />
        </>
      )}

      {currentView === 'login' && (
        <LoginScreen 
          onLogin={handleLogin}
          isLogin={true}
          onBack={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'register' && (
        <LoginScreen 
          onLogin={handleLogin}
          isLogin={false}
          onBack={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'groups' && (
        <Groups 
          currentUser={currentUser} 
          onBack={() => setCurrentView('activity')}
        />
      )}

      {currentView === 'activity' && selectedActivity && (
        <div className="activity-container">
          <div className="main-tabs">
            <div 
              className={`main-tab ${selectedType === 'mes-dispo' || selectedType === 'mes-dispo-calendar' ? 'active' : ''}`}
              onClick={() => setSelectedType('mes-dispo')}
            >
              Mes dispo
            </div>
            <div 
              className={`main-tab ${selectedType === 'communaute' || selectedType === 'communaute-calendar' ? 'active' : ''}`}
              onClick={() => setSelectedType('communaute')}
            >
              Dispo des groupes
            </div>
            <div 
              className={`main-tab ${selectedType === 'toutes-dispo' || selectedType === 'toutes-dispo-calendar' ? 'active' : ''}`}
              onClick={() => setSelectedType('toutes-dispo')}
            >
              Toutes
            </div>
          </div>

          {/* Boutons de filtre, ajout et basculement vue liste/calendrier */}
          <div className="view-toggle-container">
            {/* Bouton filtre */}
            <button 
              className="view-toggle-btn filter-btn"
              onClick={() => setShowFilterModal(true)}
              title="Filtres"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Bouton + pour ajouter une dispo dans l'onglet "Mes dispo" */}
            {selectedType === 'mes-dispo' && (
              <button 
                className="view-toggle-btn add-btn"
                onClick={() => setSelectedType('add')}
                title="Ajouter une disponibilité"
              >
                +
              </button>
            )}
            
            <button 
              className="view-toggle-btn"
              onClick={() => {
                if (selectedType.includes('-calendar')) {
                  // Passer de calendrier à liste
                  const baseType = selectedType.replace('-calendar', '')
                  setSelectedType(baseType)
                } else {
                  // Passer de liste à calendrier
                  setSelectedType(`${selectedType}-calendar`)
                }
              }}
              title={selectedType.includes('-calendar') ? 'Vue liste' : 'Vue calendrier'}
            >
              {selectedType.includes('-calendar') ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>

          <div className="activity-content">
            {/* Mes dispo - Vue liste */}
            {selectedType === 'mes-dispo' && (
              <SlotList 
                key={`mes-dispo-${selectedActivity}-${selectedDate || 'all'}`}
                activity={selectedActivity}
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                filterType="mes-dispo"
                onAddSlot={() => setSelectedType('add')}
              />
            )}
            
            {/* Mes dispo - Vue calendrier */}
            {selectedType === 'mes-dispo-calendar' && (
              <Calendar 
                activity={selectedActivity}
                currentUser={currentUser}
                onDateSelect={handleDateSelect}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                filterType="mes-dispo"
                onAddSlot={(date) => {
                  setSelectedDate(date)
                  setSelectedType('add')
                }}
              />
            )}
            
            {/* Dispo de ma communauté - Vue liste */}
            {selectedType === 'communaute' && (
              <SlotList 
                key={`communaute-${selectedActivity}-${selectedDate || 'all'}`}
                activity={selectedActivity}
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                filterType="communaute"
              />
            )}
            
            {/* Dispo de ma communauté - Vue calendrier */}
            {selectedType === 'communaute-calendar' && (
              <Calendar 
                activity={selectedActivity}
                currentUser={currentUser}
                onDateSelect={handleDateSelect}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                filterType="communaute"
                onAddSlot={(date) => {
                  setSelectedDate(date)
                  setSelectedType('add')
                }}
              />
            )}
            
            {/* Toutes les dispo - Vue liste */}
            {selectedType === 'toutes-dispo' && (
              <SlotList 
                key={`toutes-dispo-${selectedActivity}-${selectedDate || 'all'}`}
                activity={selectedActivity}
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                filterType="toutes-dispo"
              />
            )}
            
            {/* Toutes les dispo - Vue calendrier */}
            {selectedType === 'toutes-dispo-calendar' && (
              <Calendar 
                activity={selectedActivity}
                currentUser={currentUser}
                onDateSelect={handleDateSelect}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                filterType="toutes-dispo"
                onAddSlot={(date) => {
                  setSelectedDate(date)
                  setSelectedType('add')
                }}
              />
            )}
            
            {/* Ajouter une dispo */}
            {selectedType === 'add' && (
              <AddSlot 
                activity={selectedActivity}
                currentUser={currentUser}
                onSlotAdded={() => setSelectedType('mes-dispo')}
                preSelectedDate={selectedDate}
              />
            )}
          </div>
        </div>
      )}

      {currentView === 'activity' && selectedActivity && (
        <div className="activity-switcher-footer">
          <div className="footer-content">
            <div className="activity-switcher">
              <button 
                className={`activity-switch-btn ${selectedActivity === 'Sport' ? 'active' : ''}`}
                onClick={() => setSelectedActivity('Sport')}
              >
                <span>Sport</span>
              </button>
              <button 
                className={`activity-switch-btn ${selectedActivity === 'Social' ? 'active' : ''}`}
                onClick={() => setSelectedActivity('Social')}
              >
                <span>Social</span>
              </button>
              <button 
                className={`activity-switch-btn ${selectedActivity === 'Autre' ? 'active' : ''}`}
                onClick={() => setSelectedActivity('Autre')}
              >
                <span>Autre</span>
              </button>
              <button 
                className={`activity-switch-btn ${selectedActivity === 'Tous' ? 'active' : ''}`}
                onClick={() => setSelectedActivity('Tous')}
              >
                <span>Tous</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserProfile && (
        <UserProfile 
          user={currentUser}
          onClose={() => setShowUserProfile(false)}
          onUserUpdate={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}



      {/* Page de réinitialisation de mot de passe */}
      {currentView === 'reset-password' && (
        <ResetPassword />
      )}

      {/* Page de guide d'installation */}
      {currentView === 'install-guide' && (
        <InstallGuide />
      )}

      {/* Modal de Contact */}
      {showContactModal && (
        <ContactModal 
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          currentUser={currentUser}
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
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value || null)}
                />
              </div>
              <div className="filter-group">
                <label>Lieu</label>
                <input 
                  type="text" 
                  placeholder="Rechercher un lieu..."
                />
              </div>
              <div className="filter-group">
                <label>Organisateur</label>
                <input 
                  type="text" 
                  placeholder="Rechercher un organisateur..."
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn btn-clear"
                onClick={() => {
                  setSearchFilter('')
                  setSelectedDate(null)
                }}
              >
                Effacer
              </button>
              <button 
                className="modal-btn btn-apply"
                onClick={() => setShowFilterModal(false)}
              >
                Appliquer
              </button>
              <button 
                className="modal-btn btn-close"
                onClick={() => setShowFilterModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bannière de cookies */}
      <CookieBanner />
      
      {/* PWA Installer */}
      <PWAInstaller />
    </div>
  )
}

export default App