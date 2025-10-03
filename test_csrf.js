#!/usr/bin/env node

// Script de test pour la protection CSRF
const API_BASE_URL = 'http://localhost:8080'

async function testCSRFProtection() {
  console.log('🔒 Test de Protection CSRF')
  console.log('========================')
  
  try {
    // Test 1: Récupérer un token CSRF
    console.log('\n1️⃣ Récupération d\'un token CSRF...')
    const tokenResponse = await fetch(`${API_BASE_URL}/api/csrf-token`, {
      method: 'GET',
      headers: {
        'X-Session-ID': 'test_session_123',
        'Content-Type': 'application/json'
      }
    })
    
    if (!tokenResponse.ok) {
      throw new Error(`Erreur lors de la récupération du token: ${tokenResponse.status}`)
    }
    
    const tokenData = await tokenResponse.json()
    console.log('✅ Token CSRF récupéré:', tokenData.csrfToken.substring(0, 8) + '...')
    
    // Test 2: Requête sans token CSRF (devrait échouer)
    console.log('\n2️⃣ Test requête sans token CSRF...')
    const responseWithoutToken = await fetch(`${API_BASE_URL}/api/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test_session_123'
      },
      body: JSON.stringify({ test: true })
    })
    
    if (responseWithoutToken.status === 403) {
      console.log('✅ Protection CSRF active: Requête sans token bloquée')
    } else {
      console.log('❌ Protection CSRF défaillante: Requête sans token autorisée')
    }
    
    // Test 3: Requête avec token CSRF (devrait réussir)
    console.log('\n3️⃣ Test requête avec token CSRF...')
    const responseWithToken = await fetch(`${API_BASE_URL}/api/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test_session_123',
        'X-CSRF-Token': tokenData.csrfToken
      },
      body: JSON.stringify({ test: true })
    })
    
    if (responseWithToken.status !== 403) {
      console.log('✅ Protection CSRF fonctionnelle: Requête avec token autorisée')
    } else {
      console.log('❌ Protection CSRF défaillante: Requête avec token bloquée')
    }
    
    // Test 4: Requête avec token expiré (devrait échouer)
    console.log('\n4️⃣ Test requête avec token invalide...')
    const responseWithInvalidToken = await fetch(`${API_BASE_URL}/api/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test_session_123',
        'X-CSRF-Token': 'invalid_token_12345'
      },
      body: JSON.stringify({ test: true })
    })
    
    if (responseWithInvalidToken.status === 403) {
      console.log('✅ Protection CSRF active: Token invalide rejeté')
    } else {
      console.log('❌ Protection CSRF défaillante: Token invalide accepté')
    }
    
    // Test 5: Requête avec mauvaise session (devrait échouer)
    console.log('\n5️⃣ Test requête avec mauvaise session...')
    const responseWithWrongSession = await fetch(`${API_BASE_URL}/api/slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'wrong_session_456',
        'X-CSRF-Token': tokenData.csrfToken
      },
      body: JSON.stringify({ test: true })
    })
    
    if (responseWithWrongSession.status === 403) {
      console.log('✅ Protection CSRF active: Mauvaise session rejetée')
    } else {
      console.log('❌ Protection CSRF défaillante: Mauvaise session acceptée')
    }
    
    console.log('\n🎉 Tests de protection CSRF terminés!')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
  }
}

// Exécuter les tests
testCSRFProtection()
