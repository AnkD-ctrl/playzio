import React from 'react'
import './Sidebar.css'

function Sidebar({ isOpen, onClose, onNavigate, currentView }) {
  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="sidebar-overlay" onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="sidebar-content">
          <div 
            className={`sidebar-item ${currentView === 'mes-dispos' ? 'active' : ''}`}
            onClick={() => {
              onNavigate('mes-dispos')
              onClose()
            }}
          >
            <span className="sidebar-icon">📅</span>
            <span>Mes dispos</span>
          </div>
          
          <div 
            className={`sidebar-item ${currentView === 'activity' ? 'active' : ''}`}
            onClick={() => {
              onNavigate('activity')
              onClose()
            }}
          >
            <span className="sidebar-icon">🏃</span>
            <span>Toutes les dispos</span>
          </div>
          
          <div 
            className={`sidebar-item ${currentView === 'groups' ? 'active' : ''}`}
            onClick={() => {
              onNavigate('groups')
              onClose()
            }}
          >
            <span className="sidebar-icon">👥</span>
            <span>Groupes</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar
