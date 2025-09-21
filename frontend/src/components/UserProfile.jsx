import React, { useState, useEffect } from 'react'
import './UserProfile.css'
import { API_BASE_URL } from '../config'

function UserProfile({ user, onClose, onUserUpdate }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [userGroups, setUserGroups] = useState([])
  const [userFriends, setUserFriends] = useState([])
  const [friendRequests, setFriendRequests] = useState([])
  const [sentFriendRequests, setSentFriendRequests] = useState([])
  const [showFriendsModal, setShowFriendsModal] = useState(false)
  const [showAddFriendModal, setShowAddFriendModal] = useState(false)
  const [searchUsername, setSearchUsername] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [friendsTab, setFriendsTab] = useState('friends') // 'friends', 'received', 'sent'
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
    
    // Charger les amis depuis localStorage au démarrage
    const savedFriends = localStorage.getItem(`playzio_friends_${user.prenom}`)
    const savedRequests = localStorage.getItem(`playzio_friend_requests_${user.prenom}`)
    const savedSentRequests = localStorage.getItem(`playzio_sent_friend_requests_${user.prenom}`)
    
    if (savedFriends) {
      setUserFriends(JSON.parse(savedFriends))
    }
    if (savedRequests) {
      setFriendRequests(JSON.parse(savedRequests))
    }
    if (savedSentRequests) {
      setSentFriendRequests(JSON.parse(savedSentRequests))
    }
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
      // Récupérer les amis
      const friendsResponse = await fetch(`${API_BASE_URL}/api/friends/${encodeURIComponent(user.prenom)}`)
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json()
        setUserFriends(friendsData.friends || [])
      } else {
        // Si l'utilisateur n'existe pas dans la base, utiliser localStorage
        const savedFriends = localStorage.getItem(`playzio_friends_${user.prenom}`)
        setUserFriends(savedFriends ? JSON.parse(savedFriends) : [])
      }

      // Récupérer les demandes reçues
      const receivedResponse = await fetch(`${API_BASE_URL}/api/friends/requests/received/${encodeURIComponent(user.prenom)}`)
      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json()
        setFriendRequests(receivedData.requests || [])
      } else {
        const savedRequests = localStorage.getItem(`playzio_friend_requests_${user.prenom}`)
        setFriendRequests(savedRequests ? JSON.parse(savedRequests) : [])
      }

      // Récupérer les demandes envoyées
      const sentResponse = await fetch(`${API_BASE_URL}/api/friends/requests/sent/${encodeURIComponent(user.prenom)}`)
      if (sentResponse.ok) {
        const sentData = await sentResponse.json()
        setSentFriendRequests(sentData.requests || [])
      } else {
        const savedSentRequests = localStorage.getItem(`playzio_sent_friend_requests_${user.prenom}`)
        setSentFriendRequests(savedSentRequests ? JSON.parse(savedSentRequests) : [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error)
      // En cas d'erreur, utiliser localStorage
      const savedFriends = localStorage.getItem(`playzio_friends_${user.prenom}`)
      const savedRequests = localStorage.getItem(`playzio_friend_requests_${user.prenom}`)
      const savedSentRequests = localStorage.getItem(`playzio_sent_friend_requests_${user.prenom}`)
      
      setUserFriends(savedFriends ? JSON.parse(savedFriends) : [])
      setFriendRequests(savedRequests ? JSON.parse(savedRequests) : [])
      setSentFriendRequests(savedSentRequests ? JSON.parse(savedSentRequests) : [])
    }
  }

  const handleAcceptFriend = async (friendName) => {
    try {
      // Essayer d'accepter via l'API serveur
      const response = await fetch(`${API_BASE_URL}/api/friends/accept-by-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: friendName,
          to: user.prenom
        })
      })

      if (response.ok) {
        alert(`Vous êtes maintenant ami avec ${friendName}`)
        // Recharger les données depuis le serveur
        await fetchUserFriends()
      } else {
        // Si le serveur échoue, utiliser localStorage comme fallback
        const currentFriends = JSON.parse(localStorage.getItem(`playzio_friends_${user.prenom}`) || '[]')
        if (!currentFriends.includes(friendName)) {
          currentFriends.push(friendName)
          localStorage.setItem(`playzio_friends_${user.prenom}`, JSON.stringify(currentFriends))
        }

        const otherFriends = JSON.parse(localStorage.getItem(`playzio_friends_${friendName}`) || '[]')
        if (!otherFriends.includes(user.prenom)) {
          otherFriends.push(user.prenom)
          localStorage.setItem(`playzio_friends_${friendName}`, JSON.stringify(otherFriends))
        }

        const currentRequests = JSON.parse(localStorage.getItem(`playzio_friend_requests_${user.prenom}`) || '[]')
        const updatedRequests = currentRequests.filter(req => req !== friendName)
        localStorage.setItem(`playzio_friend_requests_${user.prenom}`, JSON.stringify(updatedRequests))

        const otherSentRequests = JSON.parse(localStorage.getItem(`playzio_sent_friend_requests_${friendName}`) || '[]')
        const updatedOtherSentRequests = otherSentRequests.filter(req => req !== user.prenom)
        localStorage.setItem(`playzio_sent_friend_requests_${friendName}`, JSON.stringify(updatedOtherSentRequests))

        // Mettre à jour l'état local
        setUserFriends(currentFriends)
        setFriendRequests(updatedRequests)

        alert(`Vous êtes maintenant ami avec ${friendName}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation d\'ami:', error)
      alert('Erreur lors de l\'acceptation de la demande')
    }
  }

  const handleCancelSentRequest = async (friendName) => {
    try {
      // Retirer de la liste des demandes envoyées
      const sentRequests = JSON.parse(localStorage.getItem(`playzio_sent_friend_requests_${user.prenom}`) || '[]')
      const updatedSentRequests = sentRequests.filter(req => req !== friendName)
      localStorage.setItem(`playzio_sent_friend_requests_${user.prenom}`, JSON.stringify(updatedSentRequests))

      // Retirer de la liste des demandes reçues de l'autre utilisateur
      const otherRequests = JSON.parse(localStorage.getItem(`playzio_friend_requests_${friendName}`) || '[]')
      const updatedOtherRequests = otherRequests.filter(req => req !== user.prenom)
      localStorage.setItem(`playzio_friend_requests_${friendName}`, JSON.stringify(updatedOtherRequests))

      // Mettre à jour l'état local
      setSentFriendRequests(updatedSentRequests)

      alert(`Demande d'ami annulée pour ${friendName}`)
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la demande:', error)
      alert('Erreur lors de l\'annulation de la demande')
    }
  }

  const validateAndSendRequest = async () => {
    if (!searchUsername.trim()) {
      alert('Veuillez entrer un nom d\'utilisateur')
      return
    }

    setSearchLoading(true)
    try {
      console.log('🔍 Recherche utilisateur:', searchUsername.trim())
      
      // Vérifier si l'utilisateur existe exactement
      const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(searchUsername.trim())}`)
      console.log('📡 Réponse API recherche:', response.status, response.ok)
      
      if (response.ok) {
        const users = await response.json()
        console.log('👥 Utilisateurs trouvés:', users)
        
        const exactUser = users.find(u => u.prenom.toLowerCase() === searchUsername.trim().toLowerCase())
        console.log('✅ Utilisateur exact trouvé:', exactUser)
        
        if (!exactUser) {
          console.log('❌ Aucun utilisateur exact trouvé')
          alert(`Aucun utilisateur trouvé avec le nom "${searchUsername.trim()}"`)
          setSearchLoading(false)
          return
        }

        if (exactUser.prenom === user.prenom) {
          alert('Vous ne pouvez pas vous ajouter vous-même')
          setSearchLoading(false)
          return
        }

        // Vérifier dans localStorage aussi
        const localFriends = JSON.parse(localStorage.getItem(`playzio_friends_${user.prenom}`) || '[]')
        const localRequests = JSON.parse(localStorage.getItem(`playzio_friend_requests_${user.prenom}`) || '[]')
        const localSentRequests = JSON.parse(localStorage.getItem(`playzio_sent_friend_requests_${user.prenom}`) || '[]')

        if (userFriends.includes(exactUser.prenom) || localFriends.includes(exactUser.prenom)) {
          alert(`${exactUser.prenom} est déjà votre ami`)
          setSearchLoading(false)
          return
        }

        if (friendRequests.includes(exactUser.prenom) || localRequests.includes(exactUser.prenom) || localSentRequests.includes(exactUser.prenom)) {
          alert(`Vous avez déjà une demande en cours avec ${exactUser.prenom}`)
          setSearchLoading(false)
          return
        }

        // Envoyer la demande d'ami
        await handleSendFriendRequest(exactUser)
      } else {
        console.log('❌ Erreur API recherche:', response.status)
        alert(`Erreur lors de la recherche: ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation:', error)
      alert('Erreur de connexion au serveur')
    }
    setSearchLoading(false)
  }

  const handleSendFriendRequest = async (targetUser) => {
    try {
      // Envoyer au serveur d'abord
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

      if (response.ok) {
        alert(`Demande d'ami envoyée à ${targetUser.prenom}`)
        setShowAddFriendModal(false)
        setSearchUsername('')
        setSearchResults([])
        
        // Recharger les données depuis le serveur
        await fetchUserFriends()
      } else {
        // Si le serveur échoue, utiliser localStorage comme fallback
        const targetRequests = JSON.parse(localStorage.getItem(`playzio_friend_requests_${targetUser.prenom}`) || '[]')
        if (!targetRequests.includes(user.prenom)) {
          targetRequests.push(user.prenom)
          localStorage.setItem(`playzio_friend_requests_${targetUser.prenom}`, JSON.stringify(targetRequests))
        }

        const sentRequests = JSON.parse(localStorage.getItem(`playzio_sent_friend_requests_${user.prenom}`) || '[]')
        if (!sentRequests.includes(targetUser.prenom)) {
          sentRequests.push(targetUser.prenom)
          localStorage.setItem(`playzio_sent_friend_requests_${user.prenom}`, JSON.stringify(sentRequests))
        }

        alert(`Demande d'ami envoyée à ${targetUser.prenom}`)
        setShowAddFriendModal(false)
        setSearchUsername('')
        setSearchResults([])
        
        // Recharger les données locales
        await fetchUserFriends()
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error)
      alert('Erreur lors de l\'envoi de la demande')
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

      {/* Modal de liste des amis avec onglets */}
      {showFriendsModal && (
        <div className="sub-modal-overlay" onClick={() => setShowFriendsModal(false)}>
          <div className="sub-modal friends-modal" onClick={(e) => e.stopPropagation()}>
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
            
            {/* Onglets */}
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
                Demandes reçues ({friendRequests.length})
              </button>
              <button 
                className={`friends-tab ${friendsTab === 'sent' ? 'active' : ''}`}
                onClick={() => setFriendsTab('sent')}
              >
                Demandes envoyées ({sentFriendRequests.length})
              </button>
            </div>

            <div className="sub-modal-content">
              <div className="friends-modal-content">
                {/* Onglet Amis */}
                {friendsTab === 'friends' && (
                  <div className="friends-tab-content">
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
                  </div>
                )}

                {/* Onglet Demandes reçues */}
                {friendsTab === 'received' && (
                  <div className="friends-tab-content">
                    {friendRequests.length > 0 ? (
                      <div className="friend-requests">
                        {friendRequests.map(request => (
                          <div key={request} className="friend-request-item">
                            <span>👤 {request}</span>
                            <div className="request-actions">
                              <button 
                                className="accept-btn"
                                onClick={() => handleAcceptFriend(request)}
                              >
                                Accepter
                              </button>
                              <button 
                                className="reject-btn"
                                onClick={() => handleCancelSentRequest(request)}
                              >
                                Refuser
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-friends">Aucune demande d'ami reçue</p>
                    )}
                  </div>
                )}

                {/* Onglet Demandes envoyées */}
                {friendsTab === 'sent' && (
                  <div className="friends-tab-content">
                    {sentFriendRequests.length > 0 ? (
                      <div className="friend-requests">
                        {sentFriendRequests.map(request => (
                          <div key={request} className="friend-request-item">
                            <span>👤 {request}</span>
                            <button 
                              className="cancel-btn"
                              onClick={() => handleCancelSentRequest(request)}
                            >
                              Annuler
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-friends">Aucune demande d'ami envoyée</p>
                    )}
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