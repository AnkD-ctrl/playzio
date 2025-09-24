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
            <span>Mes dispos</span>
          </div>
          
          <div 
            className={`sidebar-item ${currentView === 'dispos-amis' ? 'active' : ''}`}
            onClick={() => {
              onNavigate('dispos-amis')
              onClose()
            }}
          >
            <span>Dispos des amis</span>
          </div>

          <div 
            className={`sidebar-item ${currentView === 'dispos-groupes' ? 'active' : ''}`}
            onClick={() => {
              onNavigate('dispos-groupes')
              onClose()
            }}
          >
            <span>Dispos des groupes</span>
          </div>

          <div 
            className={`sidebar-item ${currentView === 'dispos-publiques' ? 'active' : ''}`}
            onClick={() => {
              onNavigate('dispos-publiques')
              onClose()
            }}
          >
            <span>Dispos publiques</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar