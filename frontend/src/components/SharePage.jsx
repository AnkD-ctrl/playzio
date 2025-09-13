import React from 'react'
import SlotList from './SlotList'

const SharePage = ({ username }) => {
  // Créer un objet utilisateur fictif pour SlotList
  const mockUser = {
    prenom: username,
    role: 'user'
  }

  const handleJoinSlot = () => {
    // Rediriger vers la page d'inscription
    window.location.href = `${window.location.origin}#login`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
    }}>
      {/* Header simplifié */}
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem 1rem 1rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Playzio
        </h1>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#e0e0e0' }}>
          Disponibilités de {username}
        </h2>
        <p style={{ color: '#b0b0b0', marginBottom: '1rem' }}>
          Découvrez les créneaux disponibles et rejoignez-les !
        </p>
        <button 
          onClick={handleJoinSlot}
          style={{
            background: 'linear-gradient(135deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(212, 175, 140, 0.3)'
          }}
        >
          S'inscrire pour rejoindre
        </button>
      </div>

      {/* Utiliser SlotList avec les paramètres pour afficher seulement les dispo de l'utilisateur */}
      <SlotList
        currentUser={mockUser}
        filterType="mes-dispo"
        activity="Tous"
        searchFilter=""
        lieuFilter=""
        organizerFilter=""
        filterVersion={0}
        userGroups={[]}
        onJoinSlot={handleJoinSlot}
      />
    </div>
  )
}

export default SharePage
