import React from 'react'
import './ActivityFooter.css'

function ActivityFooter({ selectedActivity, onActivityChange, selectedType, onTypeChange }) {
  const activities = [
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'padel', name: 'Padel', icon: '🏓' },
    { id: 'soiree', name: 'Soirée', icon: '🎉' }
  ]

  const types = [
    { id: 'list', name: 'Liste', icon: '📋' },
    { id: 'calendar', name: 'Calendrier', icon: '📅' },
    { id: 'agenda', name: 'Agenda', icon: '📝' }
  ]

  return (
    <div className="floating-activity-footer">
      <div className="footer-content">
        <div className="activity-tabs">
          {activities.map(activity => (
            <button
              key={activity.id}
              className={`activity-tab ${selectedActivity === activity.name ? 'active' : ''}`}
              onClick={() => onActivityChange(activity.name)}
            >
              <span className="tab-icon">{activity.icon}</span>
              <span className="tab-name">{activity.name}</span>
            </button>
          ))}
        </div>

        <div className="type-tabs">
          {types.map(type => (
            <button
              key={type.id}
              className={`type-tab ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => onTypeChange(type.id)}
            >
              <span className="tab-icon">{type.icon}</span>
              <span className="tab-name">{type.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ActivityFooter