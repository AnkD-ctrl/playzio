import React, { useState, useEffect } from 'react'
import './UserProfile.css'
import { API_BASE_URL } from '../config'
import ContactModal from './ContactModal'
import MessagesList from './MessagesList'

function UserProfile({ user, onClose, onUserUpdate }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showMessagesList, setShowMessagesList] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Charger les groupes de l'utilisateur
  useEffect(() => {
    fetchUserGroups()
  }, [user.prenom])

  const fetchUserGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups?user=${encodeURIComponent(user.prenom)}`)
      if (response.ok) {
        const groups = await response.json()
        setUserGroups(groups)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas')
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(user.prenom)}/password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Mot de passe mis à jour avec succès')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => {
          setShowPasswordModal(false)
          setMessage('')
        }, 2000)
      } else {
        setMessage(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      setMessage('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }



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
              <div className="user-badges">
                <span className="role-badge">{user.role}</span>
                {user.isFounder && (
                  <span className="founder-badge">
                    <span className="founder-crown">👑</span>
                    <span className="founder-text">Membre premium</span>
                  </span>
                )}
              </div>
              
              {/* Section Email */}
              <div className="email-section">
                {user.email ? (
                  <div className="email-info">
                    <span className="email-label">📧 Email :</span>
                    <span className="email-value">{user.email}</span>
                  </div>
                ) : (
                  <div className="email-warning">
                    <p>⚠️ <strong>Aucun email associé</strong></p>
                    <p>Ajoutez votre email pour pouvoir récupérer votre compte en cas d'oubli de mot de passe.</p>
                    <button 
                      className="add-email-btn"
                      onClick={() => setMessage('Fonctionnalité à venir : ajout d\'email')}
                    >
                      Ajouter un email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Membre depuis</span>
              <span className="stat-value">2024</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Groupes</span>
              <span className="stat-value">
                {userGroups.length > 0 
                  ? userGroups.map(group => group.name).join(', ')
                  : 'Aucun groupe'
                }
              </span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowPasswordModal(true)}
            >
              Modifier le mot de passe
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => setShowContactModal(true)}
            >
              💬 Nous contacter
            </button>
            {user.role === 'admin' && (
              <button 
                className="action-btn admin"
                onClick={() => setShowMessagesList(true)}
              >
                📨 Messages
              </button>
            )}
          </div>
          
          {/* Modal de changement de mot de passe */}
          {showPasswordModal && (
            <div className="sub-modal-overlay" onClick={() => setShowPasswordModal(false)}>
              <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h4>Modifier le mot de passe</h4>
                  <button className="close-btn" onClick={() => setShowPasswordModal(false)}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  {message && <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>{message}</div>}
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowPasswordModal(false)} disabled={loading}>
                      Annuler
                    </button>
                    <button type="submit" disabled={loading}>
                      {loading ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Modal de Contact */}
          {showContactModal && (
            <ContactModal 
              isOpen={showContactModal}
              onClose={() => setShowContactModal(false)}
              currentUser={user}
            />
          )}

          {/* Modal Messages (Admin seulement) */}
          {showMessagesList && (
            <MessagesList 
              isOpen={showMessagesList}
              onClose={() => setShowMessagesList(false)}
            />
          )}

        </div>
      </div>
    </div>
  )
}

export default UserProfile