import React, { useState, useEffect } from 'react'
import './DisposPubliques.css'
import { API_BASE_URL } from '../config'
import SlotList from './SlotList'
import Calendar from './Calendar'
import AddSlot from './AddSlot'

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
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [addSlotPage, setAddSlotPage] = useState(false)
  const [allSlots, setAllSlots] = useState([])
  const [filtersApplied, setFiltersApplied] = useState(false)

  useEffect(() => {
    if (currentUser && currentUser.prenom) {
      fetchPublicSlots()
    }
  }, [currentUser, filterVersion])

  const fetchPublicSlots = async () => {
    try {
      setLoading(true)
      console.log('🔍 Récupération des slots publiques pour:', currentUser.prenom)
      
      // Utiliser l'endpoint backend spécialisé pour les slots publics
      const response = await fetch(`${API_BASE_URL}/api/slots/public-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.prenom,
          activity: null,
          date: null,
          search: null,
          lieu: null,
          organizer: null
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const publicSlots = data.slots || []
        console.log('📥 Slots publics reçus:', publicSlots.length)
        
        // Stocker tous les slots et afficher sans filtres appliqués
        setAllSlots(publicSlots)
        setSlots(publicSlots)
        setFiltersApplied(false)
        console.log('📥 Slots publics:', publicSlots.length)
      } else {
        console.log('❌ Erreur API:', response.status, response.statusText)
        setError('Erreur lors du chargement des disponibilités publiques')
      }
    } catch (error) {
      console.log('❌ Erreur catch:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filteredSlots = [...allSlots]
    
    // Appliquer les filtres côté frontend
    if (searchFilter) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.activity.toLowerCase().includes(searchFilter.toLowerCase())
      )
    }
    
    if (selectedDate) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.date === selectedDate
      )
    }
    
    if (lieuFilter) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.lieu && slot.lieu.toLowerCase().includes(lieuFilter.toLowerCase())
      )
    }
    
    if (organizerFilter) {
      filteredSlots = filteredSlots.filter(slot => 
        slot.createdBy && slot.createdBy.toLowerCase().includes(organizerFilter.toLowerCase())
      )
    }
    
    console.log('📥 Slots publics après filtrage:', filteredSlots.length)
    setSlots(filteredSlots)
    setFiltersApplied(true)
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

  const handleShareUserDispo = async () => {
    if (currentUser && currentUser.prenom) {
      try {
        // Générer un token de partage via l'API
        const response = await fetch(`${API_BASE_URL}/api/share/generate-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: currentUser.prenom })
        })
        
        if (response.ok) {
          const data = await response.json()
          const shareUrl = data.shareUrl
          
          if (navigator.share) {
            // Utiliser l'API Web Share si disponible
            navigator.share({
              title: `Disponibilités de ${currentUser.prenom}`,
              text: `Découvrez les disponibilités de ${currentUser.prenom} sur Playzio (lien valable 24h)`,
              url: shareUrl
            }).catch(console.error)
          } else {
            // Fallback: copier dans le presse-papiers
            navigator.clipboard.writeText(shareUrl).then(() => {
              alert('Lien copié dans le presse-papiers ! (Valable 24h)')
            }).catch(() => {
              // Fallback si clipboard API n'est pas disponible
              const textArea = document.createElement('textarea')
              textArea.value = shareUrl
              document.body.appendChild(textArea)
              textArea.select()
              document.execCommand('copy')
              document.body.removeChild(textArea)
              alert('Lien copié dans le presse-papiers ! (Valable 24h)')
            })
          }
        } else {
          const errorData = await response.json()
          alert(`Erreur lors de la génération du lien: ${errorData.error}`)
        }
      } catch (error) {
        console.error('Erreur lors de la génération du token:', error)
        alert('Erreur de connexion au serveur')
      }
    }
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

  // Si on est sur la page d'ajout, afficher AddSlot
  if (addSlotPage) {
    return (
      <div className="dispos-publiques-container">
        <AddSlot 
          activity="Tous"
          currentUser={currentUser}
          onSlotAdded={() => {
            setAddSlotPage(false)
            setFilterVersion(prev => prev + 1)
          }}
          preSelectedDate={selectedDate}
          onClearDate={() => setSelectedDate(null)}
        />
      </div>
    )
  }

  return (
    <div className="dispos-publiques-container">
      <div>
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
              onAddSlot={() => setAddSlotPage(true)}
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
                setAddSlotPage(true)
              }}
              onJoinSlot={handleJoinSlot}
              customSlots={slots}
              pageType="dispos-publiques"
            />
          )}
        </div>
      </div>

      <div className="activity-switcher-footer">
        <div className="footer-content">
          {/* Boutons de filtre, ajout et basculement vue liste/calendrier */}
          <div className="view-toggle-container">
            {/* Bouton filtre */}
            <div className="footer-btn-wrapper">
              <button 
                className="view-toggle-btn filter-btn"
                onClick={() => setShowFilterModal(true)}
                title="Filtres"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="btn-label">Filtre</span>
            </div>
            
            {/* Bouton rafraîchir */}
            <div className="footer-btn-wrapper">
              <button 
                className="view-toggle-btn refresh-btn"
                onClick={() => window.location.reload()}
                title="Rafraîchir la page"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="btn-label">Actualiser</span>
            </div>
            
            {/* Bouton partager */}
            {currentUser && (
              <div className="footer-btn-wrapper">
                <button 
                  className="view-toggle-btn share-btn"
                  onClick={() => handleShareUserDispo()}
                  title="Partager mes disponibilités"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span className="btn-label">Partager</span>
              </div>
            )}
            
            {/* Bouton + pour ajouter une dispo */}
            <div className="footer-btn-wrapper">
              <button 
                className="view-toggle-btn add-btn"
                onClick={() => setAddSlotPage(true)}
                title="Ajouter une disponibilité"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className="btn-label">Ajouter</span>
            </div>
            
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

      {/* Modal de filtres */}
      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Filtres</h3>
            <div className="filter-options">
              <div className="filter-group">
                <label>Activité</label>
                <input 
                  type="text" 
                  placeholder="Rechercher une activité..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={selectedDate || ''}
                  onChange={(e) => setSelectedDate(e.target.value || null)}
                />
              </div>
              <div className="filter-group">
                <label>Lieu</label>
                <input 
                  type="text" 
                  placeholder="Rechercher un lieu..."
                  value={lieuFilter}
                  onChange={(e) => setLieuFilter(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Organisateur</label>
                <input 
                  type="text" 
                  placeholder="Rechercher un organisateur..."
                  value={organizerFilter}
                  onChange={(e) => setOrganizerFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn btn-clear"
                onClick={() => {
                  setSearchFilter('')
                  setSelectedDate(null)
                  setLieuFilter('')
                  setOrganizerFilter('')
                  setSlots(allSlots)
                  setFiltersApplied(false)
                }}
              >
                Effacer
              </button>
              <button 
                className="modal-btn btn-apply"
                onClick={() => {
                  applyFilters()
                  setShowFilterModal(false)
                }}
              >
                Appliquer
              </button>
              <button 
                className="modal-btn btn-close"
                onClick={() => setShowFilterModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default DisposPubliques