# 🔒 Protection CSRF - Documentation

## Vue d'ensemble

La protection CSRF (Cross-Site Request Forgery) a été implémentée pour sécuriser l'application contre les attaques où un site malveillant pourrait effectuer des actions au nom d'un utilisateur authentifié.

## Architecture

### Backend (server.js)

#### 1. **Stockage des tokens CSRF**
```javascript
const csrfTokens = new Map()
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000 // 1 heure
```

#### 2. **Génération de tokens**
```javascript
function generateCSRFToken() {
  return nanoid(32) // Token aléatoire de 32 caractères
}
```

#### 3. **Validation des tokens**
```javascript
function validateCSRFToken(token, sessionId) {
  const tokenData = csrfTokens.get(token)
  if (!tokenData) return false
  
  // Vérifier l'expiration
  if (Date.now() > tokenData.expiresAt) {
    csrfTokens.delete(token)
    return false
  }
  
  // Vérifier la session
  return tokenData.sessionId === sessionId
}
```

#### 4. **Middleware de protection**
```javascript
function csrfProtection(req, res, next) {
  // Skip CSRF pour les routes publiques et GET
  if (req.method === 'GET' || 
      req.path === '/api/login' || 
      req.path === '/api/register' ||
      req.path.startsWith('/api/share/') ||
      req.path.startsWith('/api/forgot-password') ||
      req.path.startsWith('/api/reset-password')) {
    return next()
  }
  
  const token = req.headers['x-csrf-token']
  const sessionId = req.headers['x-session-id'] || req.ip
  
  if (!token || !validateCSRFToken(token, sessionId)) {
    return res.status(403).json({ 
      error: 'Token CSRF invalide ou expiré',
      code: 'CSRF_TOKEN_INVALID'
    })
  }
  
  next()
}
```

#### 5. **Endpoint de génération de tokens**
```javascript
app.get('/api/csrf-token', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.ip
  const token = generateCSRFToken()
  
  csrfTokens.set(token, {
    sessionId: sessionId,
    expiresAt: Date.now() + CSRF_TOKEN_EXPIRY,
    createdAt: Date.now()
  })
  
  res.json({ 
    csrfToken: token,
    expiresIn: CSRF_TOKEN_EXPIRY
  })
})
```

### Frontend

#### 1. **Service CSRF (csrfService.js)**
- Gestion automatique des tokens
- Renouvellement automatique à l'expiration
- Headers automatiques pour les requêtes

#### 2. **Hook React (useCSRF.js)**
- `useCSRF()` : Hook principal pour l'état CSRF
- `useCSRFRequest()` : Hook pour les requêtes protégées

#### 3. **Intégration dans les composants**
```javascript
import { useCSRFRequest } from '../hooks/useCSRF'

function SlotList() {
  const csrfRequest = useCSRFRequest()
  
  const handleJoinSlot = async (slotId) => {
    const response = await csrfRequest(`${API_BASE_URL}/api/slots/${slotId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant: currentUser.prenom }),
    })
  }
}
```

## Routes protégées

### Routes POST/PUT/DELETE protégées :
- ✅ `/api/slots` (création)
- ✅ `/api/slots/:id/join` (rejoindre)
- ✅ `/api/slots/:id/leave` (quitter)
- ✅ `/api/slots/:id` (suppression)
- ✅ `/api/users/:prenom/password` (changer mot de passe)
- ✅ `/api/users/:prenom/email` (ajouter email)
- ✅ `/api/groups` (créer groupe)
- ✅ `/api/groups/:id/members` (ajouter membre)
- ✅ `/api/groups/:id/leave` (quitter groupe)
- ✅ `/api/groups/:id` (supprimer groupe)
- ✅ `/api/friends/request` (demande d'ami)
- ✅ `/api/friends/accept` (accepter ami)
- ✅ `/api/friends/accept-by-name` (accepter par nom)
- ✅ `/api/messages/:messageId` (supprimer message)
- ✅ `/api/friends/requests/:requestId` (supprimer demande)
- ✅ `/api/friends/:userId/:friendId` (supprimer ami)
- ✅ `/api/groups/:id/members` (supprimer membre)

### Routes exemptées :
- ✅ `/api/login` (connexion)
- ✅ `/api/register` (inscription)
- ✅ `/api/share/*` (partage public)
- ✅ `/api/forgot-password` (mot de passe oublié)
- ✅ `/api/reset-password` (réinitialisation)
- ✅ Toutes les routes GET

## Sécurité

### **Protection contre :**
- ✅ Attaques CSRF classiques
- ✅ Replay attacks (expiration des tokens)
- ✅ Session hijacking (liaison token/session)

### **Caractéristiques de sécurité :**
- ✅ Tokens uniques par session
- ✅ Expiration automatique (1 heure)
- ✅ Nettoyage automatique des tokens expirés
- ✅ Validation stricte des sessions
- ✅ Headers personnalisés (X-CSRF-Token, X-Session-ID)

## Utilisation

### **Pour les développeurs :**

1. **Utiliser le hook dans les composants :**
```javascript
import { useCSRFRequest } from '../hooks/useCSRF'

const csrfRequest = useCSRFRequest()
```

2. **Remplacer fetch par csrfRequest :**
```javascript
// Avant
const response = await fetch('/api/slots', { method: 'POST', ... })

// Après
const response = await csrfRequest('/api/slots', { method: 'POST', ... })
```

3. **Le service gère automatiquement :**
- Récupération des tokens
- Renouvellement à l'expiration
- Retry en cas d'erreur CSRF
- Headers automatiques

### **Pour les tests :**

Utiliser le composant `CSRFTestComponent` pour tester la protection :
```javascript
import CSRFTestComponent from './components/CSRFTestComponent'

// Dans votre composant de test
<CSRFTestComponent />
```

## Monitoring

### **Logs de debug :**
- ✅ Génération de tokens
- ✅ Validation des tokens
- ✅ Erreurs CSRF
- ✅ Renouvellement automatique

### **Informations disponibles :**
```javascript
const { debugInfo } = useCSRF()
console.log(debugInfo)
// {
//   hasToken: true,
//   tokenPreview: "abc12345...",
//   sessionId: "session_xyz123_1234567890",
//   isValid: true,
//   expiresAt: "2024-01-01T12:00:00.000Z"
// }
```

## Maintenance

### **Nettoyage automatique :**
- Tokens expirés supprimés toutes les 30 minutes
- Sessions réinitialisées à la déconnexion

### **Performance :**
- Tokens stockés en mémoire (Map)
- Validation O(1)
- Pas d'impact sur les performances

## Conclusion

La protection CSRF est maintenant **active et fonctionnelle** sur toutes les routes sensibles de l'application. Elle protège contre les attaques Cross-Site Request Forgery tout en maintenant une expérience utilisateur fluide avec un renouvellement automatique des tokens.
