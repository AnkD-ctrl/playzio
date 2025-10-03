import { useState, useEffect, useCallback } from 'react'
import csrfService from '../services/csrfService'

// Hook pour gérer les tokens CSRF
export const useCSRF = () => {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  // Initialiser le token CSRF au montage du composant
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        setError(null)
        await csrfService.fetchCSRFToken()
        setIsReady(true)
      } catch (err) {
        console.error('Erreur lors de l\'initialisation CSRF:', err)
        setError(err.message)
        setIsReady(false)
      }
    }

    initializeCSRF()
  }, [])

  // Fonction pour obtenir les headers CSRF
  const getCSRFHeaders = useCallback(async () => {
    try {
      return await csrfService.getCSRFHeaders()
    } catch (err) {
      console.error('Erreur lors de la récupération des headers CSRF:', err)
      setError(err.message)
      throw err
    }
  }, [])

  // Fonction pour rafraîchir le token
  const refreshToken = useCallback(async () => {
    try {
      setError(null)
      await csrfService.fetchCSRFToken()
      setIsReady(true)
    } catch (err) {
      console.error('Erreur lors du rafraîchissement du token CSRF:', err)
      setError(err.message)
      setIsReady(false)
    }
  }, [])

  // Fonction pour réinitialiser le service
  const resetCSRF = useCallback(() => {
    csrfService.reset()
    setIsReady(false)
    setError(null)
  }, [])

  return {
    isReady,
    error,
    getCSRFHeaders,
    refreshToken,
    resetCSRF,
    debugInfo: csrfService.getDebugInfo()
  }
}

// Hook pour les requêtes API avec protection CSRF
export const useCSRFRequest = () => {
  const { getCSRFHeaders, isReady } = useCSRF()

  const csrfRequest = useCallback(async (url, options = {}) => {
    if (!isReady) {
      throw new Error('Service CSRF non initialisé')
    }

    try {
      const csrfHeaders = await getCSRFHeaders()
      
      const requestOptions = {
        ...options,
        headers: {
          ...options.headers,
          ...csrfHeaders
        }
      }

      const response = await fetch(url, requestOptions)
      
      // Si le token CSRF est invalide, essayer de le rafraîchir
      if (response.status === 403 && response.headers.get('content-type')?.includes('application/json')) {
        const errorData = await response.json()
        if (errorData.code === 'CSRF_TOKEN_INVALID') {
          console.log('🔄 Token CSRF invalide, tentative de rafraîchissement...')
          await csrfService.fetchCSRFToken()
          
          // Retry avec le nouveau token
          const newCsrfHeaders = await getCSRFHeaders()
          const retryOptions = {
            ...options,
            headers: {
              ...options.headers,
              ...newCsrfHeaders
            }
          }
          
          return fetch(url, retryOptions)
        }
      }
      
      return response
    } catch (err) {
      console.error('Erreur lors de la requête CSRF:', err)
      throw err
    }
  }, [getCSRFHeaders, isReady])

  return csrfRequest
}

export default useCSRF
