# Système de Nettoyage des Disponibilités - Playzio

## Vue d'ensemble

Le système de nettoyage automatique des disponibilités améliore l'expérience utilisateur en filtrant automatiquement les disponibilités passées et en optimisant la base de données.

## Fonctionnalités

### 🧹 **Filtrage Automatique**
- **Suppression des disponibilités passées** de l'affichage
- **Filtrage par date** : les disponibilités d'hier et avant ne s'affichent plus
- **Filtrage par heure** : les disponibilités d'aujourd'hui dont l'heure de fin est passée sont masquées
- **Amélioration de l'UX** : seules les disponibilités utilisables sont visibles

### 🗑️ **Nettoyage de la Base de Données**
- **Suppression automatique** des anciennes disponibilités
- **Libération d'espace** dans la base de données
- **Optimisation des performances** des requêtes
- **Suppression en cascade** des messages associés

### ⚡ **Automatisation**
- **Nettoyage quotidien** à 2h du matin via cron
- **Script manuel** pour nettoyage immédiat
- **API endpoint** pour nettoyage à la demande
- **Logs détaillés** des opérations

## Architecture Technique

### Backend (Node.js/Express)
- **Fonction `isSlotStillValid()`** : vérifie si une disponibilité est encore valide
- **Filtrage dans `/api/slots`** : applique automatiquement le filtrage
- **Route `/api/admin/cleanup-old-slots`** : nettoyage manuel via API
- **Script `cleanup_old_slots.js`** : nettoyage autonome

### Logique de Validation
```javascript
function isSlotStillValid(slot) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  // Date dans le passé = invalide
  if (slot.date < today) return false
  
  // Aujourd'hui + heure de fin passée = invalide
  if (slot.date === today && slot.heureFin) {
    const currentTime = now.toTimeString().split(' ')[0]
    const slotEndTime = slot.heureFin + ':00'
    if (slotEndTime < currentTime) return false
  }
  
  return true
}
```

## Installation et Configuration

### 1. **Nettoyage Manuel**
```bash
# Exécuter le script de nettoyage
cd backend && node cleanup_old_slots.js
```

### 2. **Configuration du Nettoyage Automatique**
```bash
# Configurer la tâche cron quotidienne
cd backend && ./setup_daily_cleanup.sh
```

### 3. **Nettoyage via API**
```bash
# Appel API pour nettoyage immédiat
curl -X POST http://localhost:8080/api/admin/cleanup-old-slots
```

## API Endpoints

### POST /api/admin/cleanup-old-slots
Nettoie manuellement les anciennes disponibilités.

**Réponse:**
```json
{
  "success": true,
  "totalSlots": 150,
  "validSlots": 45,
  "deletedSlots": 105,
  "message": "105 anciennes disponibilités supprimées"
}
```

### GET /api/slots
Récupère les disponibilités avec filtrage automatique des dates passées.

**Filtrage appliqué automatiquement:**
- ✅ Disponibilités futures
- ✅ Disponibilités d'aujourd'hui non terminées
- ❌ Disponibilités d'hier et avant
- ❌ Disponibilités d'aujourd'hui terminées

## Scripts Disponibles

### `cleanup_old_slots.js`
Script principal de nettoyage avec fonctionnalités:
- Identification des disponibilités obsolètes
- Suppression en cascade (messages + slots)
- Logs détaillés des opérations
- Gestion d'erreurs robuste

### `setup_daily_cleanup.sh`
Script de configuration du nettoyage automatique:
- Configuration de la tâche cron
- Vérification des prérequis
- Instructions d'utilisation
- Gestion des permissions

## Monitoring et Logs

### Logs de Nettoyage
```
🧹 Début du nettoyage des anciennes disponibilités...
📊 Total des disponibilités: 150
✅ Disponibilités valides: 45
🗑️  Disponibilités obsolètes: 105
🗑️  Supprimé: 2024-08-30 14:00-16:00 (tennis)
🎉 Nettoyage terminé: 105 disponibilités supprimées
📈 Espace libéré dans la base de données
```

### Métriques Importantes
- **Nombre de disponibilités supprimées** par jour
- **Espace libéré** dans la base de données
- **Temps d'exécution** du nettoyage
- **Erreurs** lors de la suppression

## Avantages

### 🚀 **Performance**
- **Requêtes plus rapides** (moins de données à traiter)
- **Base de données optimisée** (suppression des données obsolètes)
- **Mémoire libérée** (moins d'objets en mémoire)

### 👥 **Expérience Utilisateur**
- **Interface plus claire** (seules les disponibilités utilisables)
- **Navigation simplifiée** (pas de confusion avec les dates passées)
- **Temps de chargement réduit** (moins de données à afficher)

### 🔧 **Maintenance**
- **Nettoyage automatique** (pas d'intervention manuelle)
- **Logs détaillés** (traçabilité des opérations)
- **Gestion d'erreurs** (robustesse du système)

## Configuration Avancée

### Personnaliser la Tâche Cron
```bash
# Éditer la tâche cron
crontab -e

# Exemples de configuration:
# Tous les jours à 2h: 0 2 * * *
# Tous les 6h: 0 */6 * * *
# Seulement le weekend: 0 2 * * 0,6
```

### Variables d'Environnement
```bash
# Base de données (optionnel)
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Logs (optionnel)
export CLEANUP_LOG_LEVEL="info" # debug, info, warn, error
```

## Dépannage

### Problèmes Courants
1. **Permissions insuffisantes** : Vérifier les droits d'exécution des scripts
2. **Base de données inaccessible** : Vérifier la connexion PostgreSQL
3. **Tâche cron non exécutée** : Vérifier la configuration cron

### Commandes de Diagnostic
```bash
# Vérifier les tâches cron
crontab -l

# Tester le script manuellement
cd backend && node cleanup_old_slots.js

# Vérifier les logs
tail -f backend/cleanup.log

# Tester l'API
curl -X POST http://localhost:8080/api/admin/cleanup-old-slots
```

## Évolutions Futures

### Fonctionnalités Avancées
- **Nettoyage par lots** pour de grandes quantités de données
- **Archivage** des anciennes disponibilités au lieu de suppression
- **Métriques en temps réel** via dashboard
- **Notifications** en cas d'erreur de nettoyage

### Optimisations
- **Indexation** des colonnes de date pour des requêtes plus rapides
- **Partitioning** de la table slots par date
- **Cache** des disponibilités valides
- **Compression** des données archivées

---

*Système développé pour Playzio - Version 1.0*
