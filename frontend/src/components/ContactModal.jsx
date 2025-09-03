import React, { useState } from 'react'
import './ContactModal.css'
import { API_BASE_URL } from '../config'

function ContactModal({ isOpen, onClose, currentUser }) {
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          fromUser: currentUser?.prenom || 'Visiteur',
          fromEmail: currentUser?.email || email || 'N/A'
        }),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setMessage('')
        setTimeout(() => {
          onClose()
          setSubmitStatus(null)
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('')
      setEmail('')
      setSubmitStatus(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="contact-modal-overlay" onClick={handleClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <div className="contact-modal-header">
          <h3>Contactez-nous</h3>
          <button 
            className="contact-modal-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="contact-modal-content">
          <p className="contact-modal-description">
            Vous avez une question, une suggestion ou besoin d'aide ? 
            Envoyez-nous un message et nous vous répondrons rapidement.
          </p>

          <form onSubmit={handleSubmit} className="contact-form">
            {!currentUser && (
              <div className="contact-form-group">
                <label htmlFor="email">Votre email (optionnel) :</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  disabled={isSubmitting}
                />
              </div>
            )}
            
            <div className="contact-form-group">
              <label htmlFor="message">Votre message :</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre question ou suggestion..."
                rows={6}
                maxLength={1000}
                disabled={isSubmitting}
                required
              />
              <div className="contact-form-counter">
                {message.length}/1000 caractères
              </div>
            </div>

            {submitStatus === 'success' && (
              <div className="contact-form-success">
                ✅ Message envoyé avec succès ! Nous vous répondrons bientôt.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="contact-form-error">
                ❌ Erreur lors de l'envoi. Veuillez réessayer.
              </div>
            )}

            <div className="contact-form-actions">
              <button 
                type="button" 
                className="contact-btn-cancel"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="contact-btn-send"
                disabled={!message.trim() || isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactModal
