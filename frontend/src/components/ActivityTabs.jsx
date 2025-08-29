import React from 'react'
import './ActivityTabs.css'

function ActivityTabs({ selectedType, onTypeChange }) {
  const types = [
    { id: 'list', name: 'Liste', icon: '📋' },
    { id: 'calendar', name: 'Calendrier', icon: '📅' },
    { id: 'agenda', name: 'Agenda', icon: '📝' }
  ]

  return (
    <div className="activity-tabs">
      {types.map(type => (
        <button
          key={type.id}
          className={`activity-tab ${selectedType === type.id ? 'active' : ''}`}
          onClick={() => onTypeChange(type.id)}
        >
          <span className="tab-icon">{type.icon}</span>
          <span className="tab-name">{type.name}</span>
        </button>
      ))}
    </div>
  )
}

export default ActivityTabs