import React, { useState, useEffect } from 'react'
import './MessagesList.css'
import { API_BASE_URL } from '../config'

function MessagesList({ isOpen, onClose }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen])

  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/contact-messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        setError('Erreur lors du chargement des messages')
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des messages:', err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleClose = () => {
    setMessages([])
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="messages-list-overlay" onClick={handleClose}>
      <div className="messages-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="messages-list-header">
          <h3>Messages de Contact</h3>
          <button 
            className="messages-list-close" 
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <div className="messages-list-content">
          {loading && (
            <div className="messages-list-loading">
              <div className="loading-spinner"></div>
              <p>Chargement des messages...</p>
            </div>
          )}

          {error && (
            <div className="messages-list-error">
              <p>❌ {error}</p>
              <button onClick={fetchMessages} className="retry-btn">
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div className="messages-list-empty">
              <p>📭 Aucun message de contact pour le moment</p>
            </div>
          )}

          {!loading && !error && messages.length > 0 && (
            <div className="messages-list-items">
              {messages.map((message) => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <div className="message-sender">
                      <strong>{message.from_user}</strong>
                      {message.from_email && message.from_email !== 'N/A' && (
                        <span className="message-email">({message.from_email})</span>
                      )}
                    </div>
                    <div className="message-date">
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                  
                  <div className="message-content">
                    {message.message}
                  </div>
                  
                  {message.admin_response && (
                    <div className="message-response">
                      <strong>Réponse admin :</strong>
                      <p>{message.admin_response}</p>
                      {message.admin_response_at && (
                        <small>Répondu le {formatDate(message.admin_response_at)}</small>
                      )}
                    </div>
                  )}
                  
                  <div className="message-status">
                    {message.is_read ? (
                      <span className="status-read">✅ Lu</span>
                    ) : (
                      <span className="status-unread">🔴 Non lu</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="messages-list-footer">
          <button onClick={fetchMessages} className="refresh-btn">
            🔄 Actualiser
          </button>
          <button onClick={handleClose} className="close-btn">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessagesList
