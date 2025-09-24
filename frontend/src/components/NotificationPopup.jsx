import React from 'react'
import './NotificationPopup.css'

const NotificationPopup = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  organizerName, 
  slotDetails,
  participantName 
}) => {
  if (!isOpen) return null

  const { date, heureDebut, heureFin, type, customActivity, lieu } = slotDetails
  const activityName = customActivity || (Array.isArray(type) ? type.join(', ') : type)

  return (
    <div className="notification-popup-overlay">
      <div className="notification-popup">
        <div className="notification-popup-header">
          <h3>📧 Notifier l'organisateur ?</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="notification-popup-content">
          <p>
            Souhaitez-vous notifier <strong>{organizerName}</strong> par email 
            de votre inscription à cette disponibilité ?
          </p>
          
          <div className="slot-details">
            <div className="slot-detail">
              <span className="label">📅 Date :</span>
              <span className="value">{date}</span>
            </div>
            <div className="slot-detail">
              <span className="label">🕐 Heure :</span>
              <span className="value">{heureDebut} - {heureFin}</span>
            </div>
            <div className="slot-detail">
              <span className="label">🎯 Activité :</span>
              <span className="value">{activityName}</span>
            </div>
            {lieu && (
              <div className="slot-detail">
                <span className="label">📍 Lieu :</span>
                <span className="value">{lieu}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="notification-popup-actions">
          <button className="btn-cancel" onClick={onClose}>
            Non, merci
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Oui, notifier
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationPopup
