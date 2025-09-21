import React, { useState, useEffect } from 'react'
import './UserProfile.css'
import { API_BASE_URL } from '../config'

function UserProfile({ user, onClose, onUserUpdate }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [userFriends, setUserFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [searchUsername, setSearchUsername] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [emailForm, setEmailForm] = useState({
    email: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Charger les groupes et amis de l'utilisateur
  useEffect(() => {
    fetchUserGroups()
    fetchUserFriends()
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

  const fetchUserFriends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(user.prenom)}`)
      if (response.ok) {
        const userData = await response.json()
        setUserFriends(userData.friends || [])
        setFriendRequests(userData.friend_requests || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error)
    }
  }

  const handleAcceptFriend = async (friendName) => {
    try {
      // Pour accepter une demande d'ami, on doit trouver l'ID de la demande
      // Pour simplifier, on va créer une nouvelle demande acceptée
      const response = await fetch(`${API_BASE_URL}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: `${friendName}_${user.prenom}` // ID simplifié
        })
      })

      if (response.ok) {
        alert(`Vous êtes maintenant ami avec ${friendName}`)
        fetchUserFriends() // Recharger les amis
      } else {
        alert('Erreur lors de l\'acceptation de la demande')
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation d\'ami:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  const validateAndSendRequest = async () => {
    if (!searchUsername.trim()) {
      alert('Veuillez entrer un nom d\'utilisateur')
      return
    }

    console.log('🔴 DEBUG: Recherche utilisateur:', searchUsername.trim())
    setSearchLoading(true)
    try {
      // Vérifier si l'utilisateur existe exactement
      const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(searchUsername.trim())}`)
      
      console.log('🔴 DEBUG: Réponse recherche:', response.status, response.statusText)
      if (response.ok) {
        const users = await response.json()
        const exactUser = users.find(u => u.prenom.toLowerCase() === searchUsername.trim().toLowerCase())
        
        if (!exactUser) {
          alert(`Aucun utilisateur trouvé avec le nom "${searchUsername.trim()}"`)
          setSearchLoading(false)
          return
        }

        if (exactUser.prenom === user.prenom) {
          alert('Vous ne pouvez pas vous ajouter vous-même')
          setSearchLoading(false)
          return
        }

        if (userFriends.includes(exactUser.prenom)) {
          alert(`${exactUser.prenom} est déjà votre ami`)
          setSearchLoading(false)
          return
        }

        if (friendRequests.includes(exactUser.prenom)) {
          alert(`Vous avez déjà envoyé une demande à ${exactUser.prenom}`)
          setSearchLoading(false)
          return
        }

        // Envoyer la demande d'ami
        await handleSendFriendRequest(exactUser)
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      alert('Erreur de connexion au serveur')
    }
    setSearchLoading(false)
  }

  const handleSendFriendRequest = async (targetUser) => {
    try {
      console.log('🔴 DEBUG: Envoi demande d\'ami vers:', targetUser.prenom)
      console.log('🔴 DEBUG: Depuis:', user.prenom)
      
      const response = await fetch(`${API_BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: user.prenom,
          to: targetUser.prenom
        })
      })

      console.log('🔴 DEBUG: Réponse serveur:', response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log('🔴 DEBUG: Résultat:', result)
        alert(`Demande d'ami envoyée à ${targetUser.prenom}`)
        setShowAddFriendModal(false)
        setSearchUsername('')
        setSearchResults([])
        fetchUserFriends() // Recharger pour mettre à jour les demandes envoyées
      } else {
        const data = await response.json()
        console.log('🔴 DEBUG: Erreur serveur:', data)
        alert(data.error || 'Erreur lors de l\'envoi de la demande')
      }
    } catch (error) {
      console.error('🔴 DEBUG: Erreur lors de l\'envoi de la demande:', error)
      alert('Erreur de connexion au serveur')
    }
  }

  const handleEmailAdd = async (e) => {
    e.preventDefault()
    
    if (!emailForm.email) {
      setMessage('Veuillez entrer une adresse email')
      return
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailForm.email)) {
      setMessage('Veuillez entrer une adresse email valide')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    try {
      console.log('Envoi de l\'email:', emailForm.email, 'pour l\'utilisateur:', user.prenom)
      
      const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(user.prenom)}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailForm.email
        })
      })
      
      console.log('Réponse du serveur:', response.status, response.statusText)
      
      const data = await response.json()
      console.log('Données reçues:', data)
      
      if (response.ok) {
        setMessage('Email ajouté avec succès !')
        setEmailForm({ email: '' })
        setShowEmailModal(false)
        // Mettre à jour l'utilisateur localement
        onUserUpdate({ ...user, email: emailForm.email })
      } else {
        setMessage(data.error || 'Erreur lors de l\'ajout de l\'email')
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'email:', error)
      setMessage('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
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
            
            <div className="profile-details">
              <h4>{user.prenom}</h4>
              
              {/* Email directement sous le nom */}
              <div className="user-email">
                {user.email ? (
                  <span className="email-value">{user.email}</span>
                ) : (
                  <span className="email-warning-text">Aucun email associé</span>
                )}
              </div>
              
              <div className="user-badges">
                <span className="role-badge">{user.role}</span>
                {user.isFounder && (
                  <span className="founder-badge">
                    <span className="founder-crown">👑</span>
                    <span className="founder-text">Membre premium</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section Amis */}
          <div className="profile-friends-section">
            <button 
              className="friends-button"
              onClick={() => setShowFriendsModal(true)}
              title="Voir mes amis"
            >
              <span className="friends-text">Amis ({userFriends.length})</span>
              <div className="friends-button-actions">
                <button 
                  className="add-friend-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAddFriendModal(true)
                  }}
                  title="Ajouter un ami"
                >
                  +
                </button>
              </div>
            </button>
          </div>
          
          {/* Espace entre groupes et actions */}
          <div className="profile-spacer"></div>
          
          <div className="profile-actions">
            <button 
              className="action-btn secondary"
              onClick={() => setShowEmailModal(true)}
            >
              {user.email ? 'Modifier l\'email' : 'Ajouter un email'}
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              Modifier le mot de passe
            </button>
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

          {/* Modal d'ajout/modification d'email */}
          {showEmailModal && (
            <div className="sub-modal-overlay" onClick={() => setShowEmailModal(false)}>
              <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h4>{user.email ? 'Modifier l\'email' : 'Ajouter un email'}</h4>
                  <button className="close-btn" onClick={() => setShowEmailModal(false)}>
                    ✕
                  </button>
                </div>
                <form onSubmit={handleEmailAdd}>
                  <div className="form-group">
                    <label htmlFor="email">Adresse email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ email: e.target.value })}
                      placeholder={user.email || "votre@email.com"}
                      required
                    />
                    <p className="form-help">
                      {user.email 
                        ? "Modifiez votre adresse email pour la récupération de mot de passe."
                        : "Cet email vous permettra de récupérer votre compte en cas d'oubli de mot de passe."
                      }
                    </p>
                  </div>
                  {message && <div className={`message ${message.includes('succès') ? 'success' : 'error'}`}>{message}</div>}
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowEmailModal(false)} disabled={loading}>
                      Annuler
                    </button>
                    <button type="submit" disabled={loading}>
                      {loading 
                        ? (user.email ? 'Modification...' : 'Ajout...') 
                        : (user.email ? 'Modifier l\'email' : 'Ajouter l\'email')
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          

        </div>
      </div>

      {/* Modal de recherche d'utilisateurs */}
      {showAddFriendModal && (
        <div className="sub-modal-overlay" onClick={() => setShowAddFriendModal(false)}>
          <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sub-modal-header">
              <h3>Ajouter un ami</h3>
              <button 
                className="sub-modal-close" 
                onClick={() => setShowAddFriendModal(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <div className="sub-modal-content">
              <div className="search-users-form">
                <div className="form-group">
                  <label>Nom d'utilisateur exact</label>
                  <input
                    type="text"
                    placeholder="Entrez le nom exact de l'utilisateur..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        validateAndSendRequest()
                      }
                    }}
                  />
                </div>
                
                {searchLoading && (
                  <div className="search-loading">Vérification en cours...</div>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowAddFriendModal(false)}
                    disabled={searchLoading}
                  >
                    Annuler
                  </button>
                  <button 
                    className="validate-btn"
                    onClick={validateAndSendRequest}
                    disabled={searchLoading || !searchUsername.trim()}
                  >
                    {searchLoading ? 'Vérification...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de liste des amis */}
      {showFriendsModal && (
        <div className="sub-modal-overlay" onClick={() => setShowFriendsModal(false)}>
          <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sub-modal-header">
              <h3>Mes amis</h3>
              <button 
                className="sub-modal-close" 
                onClick={() => setShowFriendsModal(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <div className="sub-modal-content">
              <div className="friends-modal-content">
                {userFriends.length > 0 ? (
                  <div className="friends-list">
                    {userFriends.map(friend => (
                      <div key={friend} className="friend-item">
                        <span className="friend-name">👤 {friend}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-friends">Vous n'avez pas encore d'amis</p>
                )}
                
                {friendRequests.length > 0 && (
                  <div className="friend-requests">
                    <h4>Demandes d'amis ({friendRequests.length})</h4>
                    {friendRequests.map(request => (
                      <div key={request} className="friend-request-item">
                        <span>👤 {request}</span>
                        <button 
                          className="accept-btn"
                          onClick={() => handleAcceptFriend(request)}
                          title="Accepter"
                        >
                          ✓
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile