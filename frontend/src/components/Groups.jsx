import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'
import './Groups.css'
import { trackGroupCreate, trackGroupMemberAdd, trackGroupMemberRemove, trackGroupLeave, trackGroupDelete } from '../utils/analytics'

const Groups = ({ currentUser, onBack }) => {
  const [groups, setGroups] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showManageForm, setShowManageForm] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [newMember, setNewMember] = useState('')
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups?user=${currentUser.prenom}`)
      const data = await response.json()
      setGroups(data)
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error)
    }
  }

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }



  const handleCreateGroup = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          creator: currentUser.prenom
        })
      })

      if (response.ok) {
        trackGroupCreate()
        setCreateForm({ name: '', description: '' })
        setShowCreateForm(false)
        fetchGroups()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error)
      alert('Erreur lors de la création du groupe')
    }
  }

  const handleAddMember = async (groupId) => {
    if (!newMember.trim()) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberUsername: newMember.trim(),
          requester: currentUser.prenom
        })
      })

      if (response.ok) {
        trackGroupMemberAdd()
        setNewMember('')
        fetchGroups()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error)
      alert('Erreur lors de l\'ajout du membre')
    }
  }

  const handleRemoveMember = async (groupId, memberUsername) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberUsername,
          requester: currentUser.prenom
        })
      })

      if (response.ok) {
        trackGroupMemberRemove()
        fetchGroups()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du membre:', error)
      alert('Erreur lors de la suppression du membre')
    }
  }

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Êtes-vous sûr de vouloir quitter ce groupe ?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberUsername: currentUser.prenom
        })
      })

      if (response.ok) {
        trackGroupLeave()
        fetchGroups()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la sortie du groupe:', error)
      alert('Erreur lors de la sortie du groupe')
    }
  }

  const handleDeleteGroup = async (groupId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requester: currentUser.prenom
        })
      })

      if (response.ok) {
        trackGroupDelete()
        fetchGroups()
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error)
      alert('Erreur lors de la suppression du groupe')
    }
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h2>Mes Groupes</h2>
        <button 
          className="create-group-btn-icon"
          onClick={() => setShowCreateForm(true)}
          title="Créer un nouveau groupe"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Créer un nouveau groupe</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Nom du groupe *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </button>
                <button type="submit">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="groups-list">
        {groups.length === 0 ? (
          <p className="no-groups">Vous n'êtes membre d'aucun groupe pour le moment.</p>
        ) : (
          <div className="groups-list">
            {groups.map(group => {
              const isExpanded = expandedGroups.has(group.id)
              const isCreator = group.creator === currentUser.prenom
              
              return (
                <div key={group.id} className={`group-item ${isExpanded ? 'expanded' : ''}`}>
                  <div className="group-item-header" onClick={() => toggleGroupExpansion(group.id)}>
                    <div className="group-item-main">
                      <div className="group-item-name">
                        <h3>{group.name}</h3>
                        {isCreator && (
                          <span className="creator-badge">Créateur</span>
                        )}
                      </div>
                      <div className="group-item-members">
                        👥 {group.members.length}
                      </div>
                    </div>
                    <div className="group-item-actions">
                      <div className="expand-icon">
                        {isExpanded ? '▼' : '▶'}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="group-item-details">
                      {group.description && (
                        <div className="group-description-detail">
                          <strong>Description:</strong> {group.description}
                        </div>
                      )}

                      <div className="group-members-detail">
                        <strong>Membres ({group.members.length}):</strong>
                        <div className="members-list">
                          {group.members.map(member => (
                            <span key={member} className="member-tag">
                              {member}
                              {isCreator && member !== group.creator && (
                                <button
                                  className="remove-member-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveMember(group.id, member)
                                  }}
                                  title="Supprimer ce membre"
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isCreator ? (
                        <div className="group-actions-detail">
                          <div className="add-member-section">
                            <input
                              type="text"
                              placeholder="Nom d'utilisateur"
                              value={newMember}
                              onChange={(e) => setNewMember(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddMember(group.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddMember(group.id)
                              }}
                              disabled={!newMember.trim()}
                            >
                              Ajouter
                            </button>
                          </div>
                          
                          <button
                            className="delete-group-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteGroup(group.id)
                            }}
                          >
                            Supprimer le groupe
                          </button>
                        </div>
                      ) : (
                        <div className="group-actions-detail">
                          <button
                            className="leave-group-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLeaveGroup(group.id)
                            }}
                          >
                            Quitter le groupe
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Groups
