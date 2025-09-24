import React, { useState, useEffect } from 'react'
import './DisposPubliques.css'
import { API_BASE_URL } from '../config'
import SlotList from './SlotList'
import Calendar from './Calendar'

function DisposPubliques({ currentUser, onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedType, setSelectedType] = useState('list')
  const [selectedDate, setSelectedDate] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [filterVersion, setFilterVersion] = useState(0)

  // Récupérer les slots publiques
  useEffect(() => {
    const fetchPublicSlots = async () => {
      if (!currentUser) return

      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/slots/public-slots`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.prenom,
            activity: null,
            date: selectedDate,
            search: searchFilter,
            lieu: lieuFilter,
            organizer: organizerFilter
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setSlots(data.slots || [])
          setError(null)
        } else {
          setError(data.error || 'Erreur lors du chargement des disponibilités publiques')
        }
      } catch (err) {
        setError('Erreur de connexion')
        console.error('Erreur:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPublicSlots()
  }, [currentUser, selectedDate, searchFilter, lieuFilter, organizerFilter, filterVersion])

  const handleJoinSlot = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/slots/${slotId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant: currentUser.prenom
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setFilterVersion(prev => prev + 1)
        console.log('Slot rejoint avec succès')
      } else {
        console.error('Erreur lors de la jointure du slot:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la jointure du slot:', error)
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setSelectedType('list')
  }

  const handleSearchFilterChange = (filter) => {
    setSearchFilter(filter)
  }

  const handleTypeChange = (type) => {
    setSelectedType(type)
  }

  if (loading) {
    return (
      <div className="dispos-publiques-container">
        <div className="loading">Chargement des disponibilités publiques...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dispos-publiques-container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="dispos-publiques-container">
      <div className="dispos-publiques-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <h2>Disponibilités Publiques</h2>
      </div>

      <div className="activity-container">
        <div className="activity-content">
          {/* Vue liste */}
          {selectedType === 'list' && (
            <SlotList 
              key={`public-slots-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
              activity="Tous"
              currentUser={currentUser}
              selectedDate={selectedDate}
              onClearDate={() => setSelectedDate(null)}
              searchFilter={searchFilter}
              onSearchFilterChange={handleSearchFilterChange}
              lieuFilter={lieuFilter}
              organizerFilter={organizerFilter}
              onAddSlot={() => setSelectedType('add')}
              onJoinSlot={handleJoinSlot}
              customSlots={slots}
            />
          )}
          
          {/* Vue calendrier */}
          {selectedType === 'calendar' && (
            <Calendar 
              key={`public-slots-calendar-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
              activity="Tous"
              currentUser={currentUser}
              onDateSelect={handleDateSelect}
              searchFilter={searchFilter}
              onSearchFilterChange={handleSearchFilterChange}
              lieuFilter={lieuFilter}
              organizerFilter={organizerFilter}
              onAddSlot={(date) => {
                setSelectedDate(date)
                setSelectedType('add')
              }}
              onJoinSlot={handleJoinSlot}
              customSlots={slots}
            />
          )}
        </div>
      </div>

      <div className="activity-switcher-footer">
        <div className="footer-content">
          <div className="view-toggle-container">
            <div className="footer-btn-wrapper">
              <button 
                className="view-toggle-btn"
                onClick={() => {
                  if (selectedType === 'calendar') {
                    setSelectedType('list')
                  } else {
                    setSelectedType('calendar')
                  }
                }}
                title={selectedType === 'calendar' ? 'Vue liste' : 'Vue calendrier'}
              >
                {selectedType === 'calendar' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 6h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 6h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
              <span className="btn-label">{selectedType === 'calendar' ? 'Liste' : 'Calendrier'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisposPubliques