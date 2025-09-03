import React, { useState, useEffect } from 'react'
import './ActivitySearchModal.css'
import { API_BASE_URL } from '../config'

function ActivitySearchModal({ isOpen, onClose, onSelectActivity }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      searchActivities()
    } else {
      setSearchResults([])
    }
  }, [searchTerm])

  const searchActivities = async () => {
    setIsSearching(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/activities/search?q=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      if (response.ok) {
        setSearchResults(data.activities || [])
      } else {
        setError('Erreur lors de la recherche')
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Erreur de connexion')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectActivity = (activity) => {
    onSelectActivity(activity)
    setSearchTerm('')
    setSearchResults([])
    onClose()
  }

  const handleClose = () => {
    setSearchTerm('')
    setSearchResults([])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content activity-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Rechercher une activité</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="search-content">
          <div className="search-input-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tapez le nom d'une activité..."
              className="search-input"
              autoFocus
            />
            {isSearching && <div className="search-spinner">⏳</div>}
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {searchTerm.trim().length > 0 && searchTerm.trim().length < 2 && (
            <div className="search-hint">
              Tapez au moins 2 caractères pour rechercher
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>Résultats :</h4>
              <div className="results-list">
                {searchResults.map((activity, index) => (
                  <button
                    key={index}
                    className="result-item"
                    onClick={() => handleSelectActivity(activity)}
                  >
                    {activity}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {searchTerm.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="no-results">
              Aucune activité trouvée pour "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivitySearchModal
