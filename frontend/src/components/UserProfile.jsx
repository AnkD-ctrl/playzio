import React, { useState, useEffect } from 'react'
import './UserProfile.css'
import { API_BASE_URL } from '../config'
import { useCSRFRequest } from '../hooks/useCSRF'

function UserProfile({ user, onClose, onUserUpdate }) {
  const csrfRequest = useCSRFRequest()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [emailForm, setEmailForm] = useState({
    email: ''
  })

  // États pour la gestion des amis
  const [userFriends, setUserFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [searchUsername, setSearchUsername] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [sentFriendRequests, setSentFriendRequests] = useState([])
  const [friendsTab, setFriendsTab] = useState('friends') // 'friends', 'received', 'sent'

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Charger les groupes de l'utilisateur et les amis
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
      const response = await fetch(`${API_BASE_URL}/api/friends/${encodeURIComponent(user.prenom)}`)
      if (response.ok) {
        const data = await response.json()
        setUserFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/requests/received/${encodeURIComponent(user.prenom)}`)
      if (response.ok) {
        const data = await response.json()
        setFriendRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes reçues:', error)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/friends/requests/sent/${encodeURIComponent(user.prenom)}`)
      if (response.ok) {
        const data = await response.json()
        setSentFriendRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes envoyées:', error)
    }
  }

  const handleAcceptFriend = async (requestId, senderPrenom) => {
    try {
      const response = await csrfRequest(`${API_BASE_URL}/api/friends/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId
        }),
      })

      if (response.ok) {
        setMessage('Demande d\'ami acceptée !')
        fetchUserFriends() // Recharger la liste
      } else {
        const errorData = await response.json()
        setMessage(`Erreur lors de l'acceptation: ${errorData.error || 'Erreur inconnue'}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error)
      setMessage('Erreur lors de l\'acceptation')
    }
  }

  const handleCancelSentRequest = async (requestId) => {
    try {
      const response = await csrfRequest(`${API_BASE_URL}/api/friends/requests/${requestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('Demande d\'ami annulée')
        fetchUserFriends() // Recharger la liste
      } else {
        setMessage('Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      setMessage('Erreur lors de l\'annulation')
    }
  }

  const validateAndSendRequest = async () => {
    if (!searchUsername.trim()) {
      setMessage('Veuillez entrer un nom d\'utilisateur')
      return
    }

    setSearchLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(searchUsername)}`)
      if (response.ok) {
        const users = await response.json()
        setSearchResults(users)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSendFriendRequest = async (targetPrenom) => {
    try {
      const response = await csrfRequest(`${API_BASE_URL}/api/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: user.prenom,
          receiver: targetPrenom
        }),
      })

      if (response.ok) {
        setMessage('Demande d\'ami envoyée !')
        setShowAddFriendModal(false)
        setSearchUsername('')
        setSearchResults([])
        fetchUserFriends() // Recharger la liste
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || 'Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      setMessage('Erreur lors de l\'envoi')
    }
  }

  const handleRemoveFriend = async (friendPrenom) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${friendPrenom} de vos amis ?`)) {
      return
    }

    try {
      const response = await csrfRequest(`${API_BASE_URL}/api/friends/${user.prenom}/${friendPrenom}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage(`${friendPrenom} a été supprimé de vos amis`)
        fetchUserFriends() // Recharger la liste
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleRejectFriend = async (requestId) => {
    try {
      const response = await csrfRequest(`${API_BASE_URL}/api/friends/requests/${requestId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('Demande d\'ami refusée')
        fetchUserFriends() // Recharger la liste
      } else {
        const errorData = await response.json()
        setMessage(errorData.error || 'Erreur lors du refus')
      }
    } catch (error) {
      console.error('Erreur lors du refus:', error)
      setMessage('Erreur lors du refus')
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
      
      const response = await csrfRequest(`${API_BASE_URL}/api/users/${encodeURIComponent(user.prenom)}/email`, {
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
      const response = await csrfRequest(`${API_BASE_URL}/api/users/${encodeURIComponent(user.prenom)}/password`, {
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
              </div>
            </div>
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
            <button 
              className="action-btn secondary"
              onClick={() => setShowFriendsModal(true)}
            >
              Amis ({userFriends.length})
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
                <form className="form" onSubmit={handlePasswordChange}>
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
                <form className="form" onSubmit={handleEmailAdd}>
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
                      L'adresse email est utilisée pour récupérer un mot de passe perdu et recevoir des notifications liées à tes dispos.
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

          {/* Modal de gestion des amis */}
          {showFriendsModal && (
            <div className="sub-modal-overlay" onClick={() => setShowFriendsModal(false)}>
              <div className="sub-modal friends-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h4>Mes amis</h4>
                  <button className="close-btn" onClick={() => setShowFriendsModal(false)}>
                    ✕
                  </button>
                </div>
                
                <div className="friends-tabs">
                  <button 
                    className={`friends-tab ${friendsTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setFriendsTab('friends')}
                  >
                    Amis ({userFriends.length})
                  </button>
                  <button 
                    className={`friends-tab ${friendsTab === 'received' ? 'active' : ''}`}
                    onClick={() => setFriendsTab('received')}
                  >
                    Reçues ({friendRequests.length})
                  </button>
                  <button 
                    className={`friends-tab ${friendsTab === 'sent' ? 'active' : ''}`}
                    onClick={() => setFriendsTab('sent')}
                  >
                    Envoyées ({sentFriendRequests.length})
                  </button>
                </div>

                <div className="friends-content">
                  {/* Bouton ajouter un ami - visible sur tous les onglets */}
                  <div className="add-friend-btn-container">
                    <button 
                      className="action-btn primary"
                      onClick={() => setShowAddFriendModal(true)}
                    >
                      Ajouter un ami
                    </button>
                  </div>

                  {friendsTab === 'friends' && (
                    <div>
                      {userFriends.length === 0 ? (
                        <p className="no-friends-message">Aucun ami pour le moment</p>
                      ) : (
                        <ul className="friends-list">
                          {userFriends.map((friend, index) => (
                            <li key={index} className="friend-item">
                              <span>{friend}</span>
                              <button 
                                className="remove-friend-btn"
                                onClick={() => handleRemoveFriend(friend)}
                                title="Supprimer cet ami"
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {friendsTab === 'received' && (
                    <div>
                      {friendRequests.length === 0 ? (
                        <p>Aucune demande reçue</p>
                      ) : (
                        <ul className="friends-list">
                          {friendRequests.map((request) => (
                            <li key={request.id} className="friend-item">
                              <span>{request.sender}</span>
                              <div className="request-actions">
                                <button 
                                  className="accept-btn-icon"
                                  onClick={() => handleAcceptFriend(request.id, request.sender)}
                                  title="Accepter la demande"
                                >
                                  ✓
                                </button>
                                <button 
                                  className="reject-btn-icon"
                                  onClick={() => handleRejectFriend(request.id)}
                                  title="Refuser la demande"
                                >
                                  ✕
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {friendsTab === 'sent' && (
                    <div>
                      {sentFriendRequests.length === 0 ? (
                        <p>Aucune demande envoyée</p>
                      ) : (
                        <ul className="friends-list">
                          {sentFriendRequests.map((request) => (
                            <li key={request.id} className="friend-item">
                              <span>{request.receiver}</span>
                              <div className="request-actions">
                                <button 
                                  className="cancel-btn"
                                  onClick={() => handleCancelSentRequest(request.id)}
                                >
                                  Annuler
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal d'ajout d'ami */}
          {showAddFriendModal && (
            <div className="sub-modal-overlay" onClick={() => setShowAddFriendModal(false)}>
              <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h4>Ajouter un ami</h4>
                  <button className="close-btn" onClick={() => setShowAddFriendModal(false)}>
                    ✕
                  </button>
                </div>
                
                <div className="add-friend-content">
                  <div className="form-group">
                    <label>Nom d'utilisateur</label>
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      placeholder="Entrez le nom d'utilisateur"
                    />
                    <button 
                      className="action-btn primary"
                      onClick={validateAndSendRequest}
                      disabled={searchLoading}
                    >
                      {searchLoading ? 'Recherche...' : 'Rechercher'}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="search-results">
                      <h5>Résultats de recherche :</h5>
                      <ul className="friends-list">
                        {searchResults.map((user) => (
                          <li key={user.prenom} className="friend-item clickable-friend">
                            <span 
                              className="clickable-username"
                              onClick={() => handleSendFriendRequest(user.prenom)}
                              title="Cliquer pour envoyer une demande d'ami"
                            >
                              {user.prenom}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {message && <div className={`message ${message.includes('succès') || message.includes('envoyée') ? 'success' : 'error'}`}>{message}</div>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  )
}

export default UserProfile