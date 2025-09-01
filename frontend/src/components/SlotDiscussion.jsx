import React, { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../config'
import './SlotDiscussion.css'

function SlotDiscussion({ slot, currentUser, onClose }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    fetchMessages()
  }, [slot.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slot.id}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        setError('Erreur lors du chargement des messages')
      }
    } catch (error) {
      setError('Erreur de connexion')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slot.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userPrenom: currentUser.prenom,
          message: newMessage.trim()
        })
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages([...messages, newMsg])
        setNewMessage('')
      } else {
        setError('Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userPrenom: currentUser.prenom
        })
      })

      if (response.ok) {
        setMessages(messages.filter(msg => msg.id !== messageId))
      } else {
        setError('Erreur lors de la suppression')
      }
    } catch (error) {
      setError('Erreur de connexion')
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="slot-discussion-overlay" onClick={onClose}>
      <div className="slot-discussion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="discussion-header">
          <div className="slot-info">
            <h3>{slot.type} - {slot.date}</h3>
            <p>{slot.heureDebut} - {slot.heureFin}</p>
            {slot.description && <p className="slot-description">{slot.description}</p>}
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Aucun message pour le moment</p>
              <p>Soyez le premier à commenter !</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.user_prenom === currentUser.prenom ? 'own-message' : 'other-message'}`}
                >
                  <div className="message-header">
                    <span className="message-author">{message.user_prenom}</span>
                    <span className="message-time">{formatTime(message.created_at)}</span>
                    {message.user_prenom === currentUser.prenom && (
                      <button 
                        className="delete-message-btn"
                        onClick={() => handleDeleteMessage(message.id)}
                        title="Supprimer le message"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="message-content">{message.message}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={loading}
            maxLength={500}
          />
          <button type="submit" disabled={loading || !newMessage.trim()}>
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SlotDiscussion
