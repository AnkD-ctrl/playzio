#!/bin/bash

# Script de backup automatique pour Playzio
# Usage: ./backup_script.sh

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
API_BASE="https://playzio-production.up.railway.app"

echo "🔄 Création du backup du $(date)"

# Créer le dossier de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

# Backup des utilisateurs
echo "📊 Sauvegarde des utilisateurs..."
curl -s "$API_BASE/api/users" > "$BACKUP_DIR/users_backup_$TIMESTAMP.json"

# Backup des slots
echo "🎾 Sauvegarde des créneaux..."
curl -s "$API_BASE/api/slots" > "$BACKUP_DIR/slots_backup_$TIMESTAMP.json"

# Backup des groupes
echo "👥 Sauvegarde des groupes..."
curl -s "$API_BASE/api/groups?user=U" > "$BACKUP_DIR/groups_backup_$TIMESTAMP.json"

# Backup des demandes d'amitié
echo "🤝 Sauvegarde des demandes d'amitié..."
curl -s "$API_BASE/api/friendRequests" > "$BACKUP_DIR/friendRequests_backup_$TIMESTAMP.json"

# Créer un backup complet
echo "📦 Création du backup complet..."
cat > "$BACKUP_DIR/complete_backup_$TIMESTAMP.json" << EOF
{
  "backupDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "backupSource": "playzio-production.up.railway.app",
  "users": $(curl -s "$API_BASE/api/users"),
  "slots": $(curl -s "$API_BASE/api/slots"),
  "groups": $(curl -s "$API_BASE/api/groups?user=U"),
  "friendRequests": $(curl -s "$API_BASE/api/friendRequests")
}
EOF

echo "✅ Backup terminé: $BACKUP_DIR/complete_backup_$TIMESTAMP.json"
echo "📁 Fichiers créés:"
ls -la "$BACKUP_DIR"/*_$TIMESTAMP.json

echo "🎉 Backup réussi !"
