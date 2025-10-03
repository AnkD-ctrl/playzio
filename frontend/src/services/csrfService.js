// Service de gestion des tokens CSRF
import { API_BASE_URL } from '../config'

class CSRFService {
  constructor() {
    this.token = null
    this.sessionId = this.generateSessionId()
    this.tokenExpiry = null
  }

  // Générer un ID de session unique
  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  // Récupérer un nouveau token CSRF depuis le serveur
  async fetchCSRFToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/csrf-token`, {
        method: 'GET',
        headers: {
          'X-Session-ID': this.sessionId,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.token = data.csrfToken
        this.tokenExpiry = Date.now() + data.expiresIn
        
        console.log('✅ Token CSRF récupéré:', this.token.substring(0, 8) + '...')
        return this.token
      } else {
        console.error('❌ Erreur lors de la récupération du token CSRF:', response.status)
        return null
      }
    } catch (error) {
      console.error('❌ Erreur réseau lors de la récupération du token CSRF:', error)
      return null
    }
  }

  // Vérifier si le token est valide et non expiré
  isTokenValid() {
    if (!this.token || !this.tokenExpiry) {
      return false
    }
    
    // Vérifier l'expiration (avec une marge de 5 minutes)
    const now = Date.now()
    const margin = 5 * 60 * 1000 // 5 minutes
    return now < (this.tokenExpiry - margin)
  }

  // Obtenir le token actuel (le récupérer si nécessaire)
  async getToken() {
    if (!this.isTokenValid()) {
      console.log('🔄 Token CSRF expiré ou manquant, récupération d\'un nouveau token...')
      await this.fetchCSRFToken()
    }
    
    return this.token
  }

  // Obtenir les headers CSRF pour les requêtes
  async getCSRFHeaders() {
    const token = await this.getToken()
    if (!token) {
      throw new Error('Impossible d\'obtenir un token CSRF valide')
    }

    return {
      'X-CSRF-Token': token,
      'X-Session-ID': this.sessionId
    }
  }

  // Réinitialiser le service (pour la déconnexion)
  reset() {
    this.token = null
    this.sessionId = this.generateSessionId()
    this.tokenExpiry = null
    console.log('🔄 Service CSRF réinitialisé')
  }

  // Obtenir les informations de debug
  getDebugInfo() {
    return {
      hasToken: !!this.token,
      tokenPreview: this.token ? this.token.substring(0, 8) + '...' : null,
      sessionId: this.sessionId,
      isValid: this.isTokenValid(),
      expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null
    }
  }
}

// Instance singleton
const csrfService = new CSRFService()

export default csrfService
