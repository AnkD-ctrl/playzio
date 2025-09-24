import React, { useState, useEffect } from 'react'
import './MesDispos.css'
import { API_BASE_URL } from '../config'
import SlotList from './SlotList'
import Calendar from './Calendar'

function MesDispos({ currentUser, onBack }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedType, setSelectedType] = useState('list')
  const [selectedDate, setSelectedDate] = useState(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [lieuFilter, setLieuFilter] = useState('')
  const [organizerFilter, setOrganizerFilter] = useState('')
  const [filterVersion, setFilterVersion] = useState(0)

  useEffect(() => {
    if (currentUser && currentUser.prenom) {
      fetchMySlots()
    }
  }, [currentUser, searchFilter, lieuFilter, organizerFilter, filterVersion])

  const fetchMySlots = async () => {
    try {
      setLoading(true)
      console.log('🔍 Récupération des slots de:', currentUser.prenom)
      
      // LOGIQUE SIMPLE : Récupérer TOUS les slots et filtrer côté frontend
      const url = `${API_BASE_URL}/api/slots`
      const response = await fetch(url)
      
      if (response.ok) {
        const allSlots = await response.json()
        console.log('📥 Tous les slots reçus:', allSlots.length)
        
        // FILTRAGE SIMPLE : Seulement les slots créés par l'utilisateur
        const mySlots = allSlots.filter(slot => slot.createdBy === currentUser.prenom)
        console.log('📥 Mes slots filtrés:', mySlots.length)
        
        setSlots(mySlots)
      } else {
        console.log('❌ Erreur API:', response.status, response.statusText)
        setError('Erreur lors du chargement de vos disponibilités')
      }
    } catch (error) {
      console.log('❌ Erreur catch:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="mes-dispos-container">
        <div className="loading">Chargement de vos disponibilités...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mes-dispos-container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="mes-dispos-container">
      <div className="mes-dispos-header">
        <button className="back-btn" onClick={onBack}>
          ← Retour
        </button>
        <h2>Mes Disponibilités</h2>
      </div>

      <div className="activity-container">
        <div className="activity-content">
          {/* Vue liste */}
          {selectedType === 'list' && (
            <SlotList 
              key={`my-slots-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
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
              key={`my-slots-calendar-${selectedDate || 'all'}-${lieuFilter}-${organizerFilter}-${filterVersion}`}
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

export default MesDispos