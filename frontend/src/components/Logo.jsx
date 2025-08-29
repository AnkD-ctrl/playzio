import React from 'react'

function Logo({ size = 'medium', className = '', showText = false }) {
  const sizeStyles = {
    small: { width: '24px', height: '24px' },
    medium: { width: '32px', height: '32px' },
    large: { width: '48px', height: '48px' }
  }

  const CalendarIcon = ({ size }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="url(#beigeVioletGradient)"
      stroke="url(#beigeVioletGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={sizeStyles[size]}
    >
      <defs>
        <linearGradient id="beigeVioletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af8c" />
          <stop offset="25%" stopColor="#c9a96e" />
          <stop offset="50%" stopColor="#b8860b" />
          <stop offset="75%" stopColor="#9370db" />
          <stop offset="100%" stopColor="#8a2be2" />
        </linearGradient>
      </defs>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <circle cx="8" cy="14" r="1"/>
      <circle cx="12" cy="14" r="1"/>
      <circle cx="16" cy="14" r="1"/>
      <circle cx="8" cy="18" r="1"/>
      <circle cx="12" cy="18" r="1"/>
      <circle cx="16" cy="18" r="1"/>
    </svg>
  )

  if (showText) {
    return (
      <div className={`acebook-logo full ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CalendarIcon size={size} />
        <span className="logo-word" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif', fontWeight: 400, background: 'linear-gradient(45deg, #d4af8c 0%, #c9a96e 25%, #b8860b 50%, #9370db 75%, #8a2be2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Playzio</span>
      </div>
    )
  }

  return (
    <div className={`acebook-logo ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <CalendarIcon size={size} />
    </div>
  )
}

export default Logo