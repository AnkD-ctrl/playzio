const API_BASE_URL = process.env.API_BASE_URL || 'https://playzio-production.up.railway.app'

async function testUserProfile() {
  try {
    console.log('🧪 Test du profil utilisateur via API...')
    console.log('🌐 URL API:', API_BASE_URL)
    
    // Test de l'API users
    const response = await fetch(`${API_BASE_URL}/api/users`)
    
    if (!response.ok) {
      console.log('❌ Erreur API:', response.status, response.statusText)
      return
    }
    
    const users = await response.json()
    console.log('👥 Utilisateurs trouvés:', users.length)
    
    // Chercher Jack
    const jack = users.find(user => user.prenom === 'Jack')
    if (jack) {
      console.log('👤 Profil de Jack:', {
        prenom: jack.prenom,
        email: jack.email || '❌ PAS D\'EMAIL',
        role: jack.role
      })
      
      if (!jack.email) {
        console.log('⚠️  Jack n\'a pas d\'email configuré !')
        console.log('💡 Il faut ajouter un email au profil de Jack')
      }
    } else {
      console.log('❌ Utilisateur Jack non trouvé')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error.message)
  }
}

testUserProfile()
