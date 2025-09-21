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
import SharePage from './components/SharePage'
import Groups from './components/Groups'
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
  const [selectedType, setSelectedType] = useState('mes-dispos')
  const [selectedDate, setSelectedDate] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [filterVersion, setFilterVersion] = useState(0)
  const [shareUsername, setShareUsername] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)


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
    
    // Vérifier le hash pour #share/
    if (window.location.hash.startsWith('#share/')) {
      const username = window.location.hash.split('#share/')[1]
      if (username) {
        setShareUsername(username)
        setCurrentView('share')
      }
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
    setSelectedType('mes-dispos') // Aller directement sur "Mes dispos"
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

  const handleShareUserDispo = () => {
    if (currentUser && currentUser.prenom) {
      const shareUrl = `${window.location.origin}/#share/${currentUser.prenom}`
      
      if (navigator.share) {
        // Utiliser l'API Web Share si disponible
        navigator.share({
          title: `Disponibilités de ${currentUser.prenom}`,
          text: `Découvrez les disponibilités de ${currentUser.prenom} sur Playzio`,
          url: shareUrl
        }).catch(console.error)
      } else {
        // Fallback: copier dans le presse-papiers
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Lien copié dans le presse-papiers !')
        }).catch(() => {
          // Fallback si clipboard API n'est pas disponible
          const textArea = document.createElement('textarea')
          textArea.value = shareUrl
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          alert('Lien copié dans le presse-papiers !')
        })
      }
    }
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
            {/* Bouton hamburger */}
            <button 
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <div className="header-actions">
              <button 
                className="groups-btn"
                onClick={() => setCurrentView('groups')}
                title="Mes Groupes"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="profile-btn"
                onClick={() => setShowUserProfile(true)}
                title="Mon compte"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="logout-btn" onClick={handleLogout} title="Déconnexion">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre latérale */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>Navigation</h3>
              <button 
                className="sidebar-close"
                onClick={() => setSidebarOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="sidebar-content">
              <div 
                className={`sidebar-item ${selectedType === 'mes-dispos' || selectedType === 'mes-dispos-calendar' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedType('mes-dispos')
                  setSidebarOpen(false)
                }}
              >
                <span className="sidebar-icon">👤</span>
                <span>Mes dispos</span>
              </div>
              <div 
                className={`sidebar-item ${selectedType === 'amis' || selectedType === 'amis-calendar' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedType('amis')
                  setSidebarOpen(false)
                }}
              >
                <span className="sidebar-icon">👫</span>
                <span>Dispos des amis</span>
              </div>
              <div 
                className={`sidebar-item ${selectedType === 'communaute' || selectedType === 'communaute-calendar' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedType('communaute')
                  setSidebarOpen(false)
                }}
              >
                <span className="sidebar-icon">👥</span>
                <span>Dispos des groupes</span>
              </div>
              <div 
                className={`sidebar-item ${selectedType === 'publiques' || selectedType === 'publiques-calendar' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedType('publiques')
                  setSidebarOpen(false)
                }}
              >
                <span className="sidebar-icon">🌐</span>
                <span>Publiques</span>
              </div>
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

      {currentView === 'share' && shareUsername && (
        <SharePage username={shareUsername} />
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


          <div className="activity-content">
            {/* Mes dispos - Vue liste */}
            {selectedType === 'mes-dispos' && (
              <SlotList 
                key={`mes-dispos-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="mes-dispos"
                onAddSlot={() => setSelectedType('add')}
              />
            )}
            
            {/* Mes dispos - Vue calendrier */}
            {selectedType === 'mes-dispos-calendar' && (
              <Calendar 
                key={`mes-dispos-calendar-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                onDateSelect={handleDateSelect}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="mes-dispos"
                onAddSlot={(date) => {
                  setSelectedDate(date)
                  setSelectedType('add')
                }}
              />
            )}

            {/* Dispos des amis - Vue liste */}
            {selectedType === 'amis' && (
              <SlotList 
                key={`amis-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="amis"
              />
            )}
            
            {/* Dispos des amis - Vue calendrier */}
            {selectedType === 'amis-calendar' && (
              <Calendar 
                key={`amis-calendar-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                onDateSelect={handleDateSelect}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="amis"
                onAddSlot={(date) => {
                  setSelectedDate(date)
                  setSelectedType('add')
                }}
              />
            )}
            
            {/* Dispo de ma communauté - Vue liste */}
            {selectedType === 'communaute' && (
              <SlotList 
                key={`communaute-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="communaute"
              />
            )}
            
            {/* Dispo de ma communauté - Vue calendrier */}
            {selectedType === 'communaute-calendar' && (
              <Calendar 
                key={`communaute-calendar-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                onDateSelect={handleDateSelect}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="communaute"
                onAddSlot={(date) => {
                  setSelectedDate(date)
                  setSelectedType('add')
                }}
              />
            )}
            
            {/* Publiques - Vue liste */}
            {selectedType === 'publiques' && (
              <SlotList 
                key={`publiques-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                selectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="publiques"
              />
            )}
            
            {/* Publiques - Vue calendrier */}
            {selectedType === 'publiques-calendar' && (
              <Calendar 
                key={`publiques-calendar-${selectedActivity}-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
                activity={selectedActivity}
                currentUser={currentUser}
                onDateSelect={handleDateSelect}
                searchFilter={searchFilter}
                onSearchFilterChange={handleSearchFilterChange}
                lieuFilter={lieuFilter}
                organizerFilter={organizerFilter}
                filterType="publiques"
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
                onSlotAdded={() => setSelectedType('mes-dispos')}
                preSelectedDate={selectedDate}
                onClearDate={() => setSelectedDate(null)}
              />
            )}
          </div>
        </div>
      )}

      {currentView === 'activity' && selectedActivity && (
        <div className="activity-switcher-footer">
          <div className="footer-content">
            {/* Boutons de filtre, ajout et basculement vue liste/calendrier */}
            <div className="view-toggle-container">
              {/* Bouton filtre */}
              <div className="footer-btn-wrapper">
                <button 
                  className="view-toggle-btn filter-btn"
                  onClick={() => setShowFilterModal(true)}
                  title="Filtres"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="btn-label">Filtre</span>
              </div>
              
              {/* Bouton rafraîchir */}
              <div className="footer-btn-wrapper">
                <button 
                  className="view-toggle-btn refresh-btn"
                  onClick={() => window.location.reload()}
                  title="Rafraîchir la page"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="btn-label">Actualiser</span>
              </div>
              
              {/* Bouton partager */}
              {selectedType === 'mes-dispos' && currentUser && (
                <div className="footer-btn-wrapper">
                  <button 
                    className="view-toggle-btn share-btn"
                    onClick={() => handleShareUserDispo()}
                    title="Partager mes disponibilités"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <span className="btn-label">Partager</span>
                </div>
              )}
              
              {/* Bouton + pour ajouter une dispo */}
              <div className="footer-btn-wrapper">
                <button 
                  className="view-toggle-btn add-btn"
                  onClick={() => setSelectedType('add')}
                  title="Ajouter une disponibilité"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="btn-label">Ajouter</span>
              </div>
              
              <div className="footer-btn-wrapper">
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
                <span className="btn-label">{selectedType.includes('-calendar') ? 'Liste' : 'Calendrier'}</span>
              </div>
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
                  setSelectedDate(null)
                  setLieuFilter('')
                  setOrganizerFilter('')
                  setFilterVersion(prev => prev + 1)
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