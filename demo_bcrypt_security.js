// Démonstration de la sécurité avec bcrypt
const bcrypt = require('bcrypt')

async function demonstrateBcryptSecurity() {
  console.log('🛡️ Sécurité avec bcrypt + salt :')
  
  const password = 'password123'
  
  // Générer plusieurs hash pour le même mot de passe
  const hash1 = await bcrypt.hash(password, 12)
  const hash2 = await bcrypt.hash(password, 12)
  const hash3 = await bcrypt.hash(password, 12)
  
  console.log(`Mot de passe: "${password}"`)
  console.log(`Hash 1: ${hash1}`)
  console.log(`Hash 2: ${hash2}`)
  console.log(`Hash 3: ${hash3}`)
  console.log('')
  
  // Vérifier que tous les hash sont différents
  console.log('✅ Tous les hash sont différents !')
  console.log(`Hash 1 === Hash 2: ${hash1 === hash2}`)
  console.log(`Hash 2 === Hash 3: ${hash2 === hash3}`)
  console.log(`Hash 1 === Hash 3: ${hash1 === hash3}`)
  console.log('')
  
  // Mais tous permettent de vérifier le même mot de passe
  console.log('🔍 Vérification des mots de passe :')
  console.log(`Hash 1 vérifie "password123": ${await bcrypt.compare(password, hash1)}`)
  console.log(`Hash 2 vérifie "password123": ${await bcrypt.compare(password, hash2)}`)
  console.log(`Hash 3 vérifie "password123": ${await bcrypt.compare(password, hash3)}`)
  console.log(`Hash 1 vérifie "wrongpass": ${await bcrypt.compare('wrongpass', hash1)}`)
  
  console.log('')
  console.log('💡 Avantages de bcrypt :')
  console.log('- Chaque hash est unique (salt automatique)')
  console.log('- Impossible de faire des rainbow tables')
  console.log('- Résistant aux attaques par dictionnaire')
  console.log('- Temps de calcul configurable (coût)')
}

// Si bcrypt n'est pas installé, montrer la différence conceptuelle
console.log('🔍 Comparaison SHA256 vs bcrypt :')
console.log('')
console.log('❌ SHA256 sans salt (votre code actuel) :')
console.log('   "password123" → toujours "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"')
console.log('   "password123" → toujours "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"')
console.log('   "password123" → toujours "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"')
console.log('')
console.log('✅ bcrypt avec salt :')
console.log('   "password123" → "$2b$12$abc123...xyz789" (unique)')
console.log('   "password123" → "$2b$12$def456...uvw012" (unique)')
console.log('   "password123" → "$2b$12$ghi789...rst345" (unique)')
console.log('')
console.log('🚨 Conséquence :')
console.log('- Avec SHA256 : Si un hash est cassé, tous les utilisateurs avec le même mot de passe sont compromis')
console.log('- Avec bcrypt : Même si un hash est cassé, les autres restent sécurisés')
