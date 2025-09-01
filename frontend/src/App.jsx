import React, { useState, useEffect } from 'react'
import './App.css'
import Logo from './components/Logo'
import LoginScreen from './components/LoginScreen'
import WelcomeScreen from './components/WelcomeScreen'
import AddSlot from './components/AddSlot'
import SlotList from './components/SlotList'
import Calendar from './components/Calendar'
import UserProfile from './components/UserProfile'
import Groups from './components/Groups'
import { trackPageView, trackLogin, trackLogout, trackActivitySelect, trackNavigation } from './utils/analytics'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentView, setCurrentView] = useState('welcome')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [selectedType, setSelectedType] = useState('list')
  const [selectedDate, setSelectedDate] = useState(null)
  const [showUserProfile, setShowUserProfile] = useState(false)

  // Track page views when view changes
  useEffect(() => {
    if (currentView === 'welcome') {
      trackPageView('Welcome Screen')
    } else if (currentView === 'groups') {
      trackPageView('Groups Page')
    } else if (currentView === 'activity') {
      trackPageView(`Activity: ${selectedActivity}`)
    }
  }, [currentView, selectedActivity])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setIsLoggedIn(true)
    setCurrentView('welcome')
    trackLogin(user.role || 'user')
  }

  const handleLogout = () => {
    trackLogout()
    setIsLoggedIn(false)
    setCurrentUser(null)
    setCurrentView('welcome')
    setSelectedActivity(null)
    setSelectedType('list')
  }

  const handleActivitySelect = (activity) => {
    trackActivitySelect(activity)
    setSelectedActivity(activity)
    setCurrentView('activity')
    setSelectedType('list')
    setSelectedDate(null)
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

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="app">
      {currentView !== 'welcome' && (
        <div className="app-header">
          <div className="header-content">
            <div className="header-actions">
              <button 
                className="groups-btn"
                onClick={() => setCurrentView('groups')}
              >
                👥 Mes Groupes
              </button>
              <button 
                className="profile-btn"
                onClick={() => setShowUserProfile(true)}
              >
                👤 {currentUser.prenom}
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="app-content">
        {currentView === 'welcome' && (
          <WelcomeScreen 
            onActivitySelect={handleActivitySelect}
            currentUser={currentUser}
          />
        )}

        {currentView === 'groups' && (
          <Groups 
            currentUser={currentUser} 
            onBack={() => setCurrentView('welcome')}
          />
        )}

        {currentView === 'activity' && selectedActivity && (
          <div className="activity-container">
            <div className="activity-header">
              <h2 className="activity-title">{selectedActivity}</h2>
            </div>

            <div className="main-tabs">
              <button 
                className={`main-tab ${selectedType === 'list' ? 'active' : ''}`}
                onClick={() => setSelectedType('list')}
              >
                📋 Disponibilités
              </button>
              <button 
                className={`main-tab ${selectedType === 'calendar' ? 'active' : ''}`}
                onClick={() => setSelectedType('calendar')}
              >
                📅 Calendrier
              </button>
              <button 
                className={`main-tab add-tab ${selectedType === 'add' ? 'active' : ''}`}
                onClick={() => setSelectedType('add')}
              >
                <span className="add-icon">+</span> Ajouter
              </button>
            </div>

            <div className="activity-content">
              {selectedType === 'list' && (
                <SlotList 
                  key={`${selectedActivity}-${selectedDate || 'all'}`}
                  activity={selectedActivity}
                  currentUser={currentUser}
                  selectedDate={selectedDate}
                  onClearDate={() => setSelectedDate(null)}
                />
              )}
              {selectedType === 'calendar' && (
                <Calendar 
                  activity={selectedActivity}
                  currentUser={currentUser}
                  onDateSelect={handleDateSelect}
                />
              )}
              {selectedType === 'add' && (
                <AddSlot 
                  activity={selectedActivity}
                  currentUser={currentUser}
                  onSlotAdded={() => setSelectedType('list')}
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
                  className={`activity-switch-btn ${selectedActivity === 'Tennis' ? 'active' : ''}`}
                  onClick={() => setSelectedActivity('Tennis')}
                >
                  <span>Tennis</span>
                </button>
                <button 
                  className={`activity-switch-btn ${selectedActivity === 'Padel' ? 'active' : ''}`}
                  onClick={() => setSelectedActivity('Padel')}
                >
                  <span>Padel</span>
                </button>
                <button 
                  className={`activity-switch-btn ${selectedActivity === 'Soirée' ? 'active' : ''}`}
                  onClick={() => setSelectedActivity('Soirée')}
                >
                  <span>Soirée</span>
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
      </div>

      {showUserProfile && (
        <UserProfile 
          user={currentUser}
          onClose={() => setShowUserProfile(false)}
          onUserUpdate={(updatedUser) => setCurrentUser(updatedUser)}
        />
      )}
    </div>
  )
}

export default App