import React from 'react'
import './WelcomeScreen.css'

function WelcomeScreen({ onActivitySelect, currentUser }) {
  const activities = [
    { id: 'tennis', name: 'Tennis', icon: 'circle' },
    { id: 'padel', name: 'Padel', icon: 'square' },
    { id: 'soiree', name: 'Soirée', icon: 'star' },
    { id: 'autre', name: 'Autre', icon: 'diamond' }
  ]

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>Bienvenue sur Playzio</h1>
          <p>Ne ratez pas une occasion de vous voir</p>
        </div>

        <div className="activities-grid">
          {activities.map(activity => (
            <div 
              key={activity.id}
              className="activity-card"
              onClick={() => onActivitySelect(activity.name)}
            >
              <div className={`activity-icon ${activity.icon}`}></div>
              <h3>{activity.name}</h3>
            </div>
          ))}
        </div>

        <div className="welcome-footer">
          <p>Connecté en tant que : <strong>{currentUser.prenom}</strong></p>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen