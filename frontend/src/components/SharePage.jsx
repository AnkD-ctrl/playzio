import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config'

const SharePage = ({ username }) => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUserSlots()
  }, [username])

  const fetchUserSlots = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/slots/user/${encodeURIComponent(username)}`)
      if (response.ok) {
        const data = await response.json()
        setSlots(data)
      } else {
        setError('Erreur lors du chargement des disponibilités')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSlot = () => {
    // Rediriger vers la page d'inscription
    window.location.href = `${window.location.origin}#login`
  }

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#e0e0e0',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
      }}>
        <h2>Chargement des disponibilités de {username}...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#ff6b6b',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
      }}>
        <h2>Erreur</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.href = window.location.origin}
          style={{
            background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      color: '#e0e0e0',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Playzio
          </h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Disponibilités de {username}
          </h2>
          <p style={{ color: '#b0b0b0', marginBottom: '2rem' }}>
            Découvrez les créneaux disponibles de {username} et rejoignez-les !
          </p>
          <button 
            onClick={handleJoinSlot}
            style={{
              background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(212, 175, 140, 0.3)'
            }}
          >
            S'inscrire pour rejoindre
          </button>
        </div>

        {/* Liste des slots */}
        {slots.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {slots.map((slot, index) => (
              <div 
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      marginBottom: '0.5rem',
                      color: '#d4af8c'
                    }}>
                      {slot.activity}
                    </h3>
                    <p style={{ color: '#b0b0b0', marginBottom: '0.5rem' }}>
                      📅 {new Date(slot.date).toLocaleDateString('fr-FR')}
                    </p>
                    <p style={{ color: '#b0b0b0', marginBottom: '0.5rem' }}>
                      🕐 {slot.startTime} - {slot.endTime}
                    </p>
                    {slot.location && (
                      <p style={{ color: '#b0b0b0', marginBottom: '0.5rem' }}>
                        📍 {slot.location}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={handleJoinSlot}
                    style={{
                      background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    Rejoindre
                  </button>
                </div>
                {slot.description && (
                  <p style={{ color: '#e0e0e0', fontSize: '0.95rem' }}>
                    {slot.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.2rem', color: '#b0b0b0', marginBottom: '2rem' }}>
              {username} n'a pas encore de disponibilités partagées
            </p>
            <button 
              onClick={() => window.location.href = window.location.origin}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#e0e0e0',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Découvrir Playzio
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SharePage
