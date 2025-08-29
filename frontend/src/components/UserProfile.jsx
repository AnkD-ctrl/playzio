import React from 'react'
import './UserProfile.css'

function UserProfile({ user, onClose }) {
  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Profil utilisateur</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <div className="profile-info">
            <div className="profile-avatar">
              <span className="avatar-text">
                {user.prenom.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="profile-details">
              <h4>{user.prenom}</h4>
              <p className="user-email">{user.email}</p>
              <p className="user-role">
                <span className="role-badge">{user.role}</span>
              </p>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Membre depuis</span>
              <span className="stat-value">2024</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Activités</span>
              <span className="stat-value">Tennis, Padel, Soirées</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="action-btn primary">
              Modifier le profil
            </button>
            <button className="action-btn secondary">
              Paramètres
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile