const API_BASE_URL = 'https://playzio-production.up.railway.app'

async function testConnection() {
  try {
    console.log('🔍 Test de connexion au backend...')
    console.log('🌐 URL:', API_BASE_URL)
    
    // Test 1: Vérifier si le serveur répond
    console.log('\n📡 Test 1: Ping du serveur...')
    const pingResponse = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      timeout: 10000
    })
    console.log('Status:', pingResponse.status)
    console.log('Headers:', Object.fromEntries(pingResponse.headers.entries()))
    
    // Test 2: Test de l'API de connexion avec timeout court
    console.log('\n🔐 Test 2: API de connexion...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 secondes timeout
    
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prenom: 'Jack',
          password: 'test'
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log('Status:', loginResponse.status)
      const data = await loginResponse.text()
      console.log('Response:', data)
      
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        console.log('❌ Timeout après 10 secondes')
      } else {
        console.log('❌ Erreur:', error.message)
      }
    }
    
    // Test 3: Test de l'API slots (qui fonctionnait avant)
    console.log('\n📊 Test 3: API slots...')
    const slotsResponse = await fetch(`${API_BASE_URL}/api/slots`, {
      method: 'GET',
      timeout: 10000
    })
    console.log('Status:', slotsResponse.status)
    const slotsData = await slotsResponse.json()
    console.log('Slots count:', slotsData.length)
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

testConnection()
