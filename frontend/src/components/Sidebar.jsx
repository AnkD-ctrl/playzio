import React from 'react'
import './Sidebar.css'

function Sidebar({ currentView, onViewChange, selectedActivity }) {
  const menuItems = [
    { id: 'welcome', name: 'Accueil', icon: '🏠' },
    { id: 'activity', name: selectedActivity || 'Activité', icon: '🎯' },
    { id: 'add', name: 'Ajouter', icon: '➕' }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h3>Navigation</h3>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-name">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar