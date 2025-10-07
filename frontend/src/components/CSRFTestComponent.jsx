import React, { useState } from 'react'
import { useCSRF, useCSRFRequest } from '../hooks/useCSRF'

const CSRFTestComponent = () => {
  const { isReady, error, debugInfo, refreshToken } = useCSRF()
  const csrfRequest = useCSRFRequest()
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testCSRFProtection = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      // Test 1: Requête sans token CSRF (devrait échouer)
      console.log('🧪 Test 1: Requête sans token CSRF...')
      const responseWithoutToken = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      
      if (responseWithoutToken.status === 403) {
        setTestResult(prev => prev + '✅ Test 1 réussi: Requête sans token CSRF bloquée\n')
      } else {
        setTestResult(prev => prev + '❌ Test 1 échoué: Requête sans token CSRF autorisée\n')
      }
      
      // Test 2: Requête avec token CSRF (devrait réussir)
      console.log('🧪 Test 2: Requête avec token CSRF...')
      const responseWithToken = await csrfRequest('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      
      if (responseWithToken.status !== 403) {
        setTestResult(prev => prev + '✅ Test 2 réussi: Requête avec token CSRF autorisée\n')
      } else {
        setTestResult(prev => prev + '❌ Test 2 échoué: Requête avec token CSRF bloquée\n')
      }
      
    } catch (error) {
      setTestResult(prev => prev + `❌ Erreur lors du test: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔒 Test de Protection CSRF</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>État du service CSRF:</strong>
        <div style={{ marginLeft: '10px', fontSize: '14px' }}>
          <div>Prêt: {isReady ? '✅' : '❌'}</div>
          <div>Erreur: {error || 'Aucune'}</div>
          <div>Token: {debugInfo.tokenPreview || 'Aucun'}</div>
          <div>Session ID: {debugInfo.sessionId}</div>
          <div>Valide: {debugInfo.isValid ? '✅' : '❌'}</div>
          <div>Expire à: {debugInfo.expiresAt || 'N/A'}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={refreshToken}
          disabled={loading}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Rafraîchir Token
        </button>
        
        <button 
          onClick={testCSRFProtection}
          disabled={loading || !isReady}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || !isReady) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Test en cours...' : 'Tester Protection CSRF'}
        </button>
      </div>
      
      {testResult && (
        <div style={{
          backgroundColor: '#fff',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          whiteSpace: 'pre-line',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <strong>Résultats des tests:</strong>
          <br />
          {testResult}
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Instructions:</strong>
        <ul>
          <li>Le service CSRF doit être prêt avant de pouvoir tester</li>
          <li>Test 1: Vérifie que les requêtes sans token sont bloquées</li>
          <li>Test 2: Vérifie que les requêtes avec token sont autorisées</li>
          <li>Les tokens expirent après 1 heure</li>
        </ul>
      </div>
    </div>
  )
}

export default CSRFTestComponent
