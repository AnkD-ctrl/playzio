#!/bin/bash

# Script de nettoyage des anciens backups
# Garde seulement les 30 derniers backups quotidiens, 12 hebdomadaires, et 12 mensuels

BACKUP_DIR="backups"
DAILY_KEEP=30
WEEKLY_KEEP=12
MONTHLY_KEEP=12

echo "🧹 Nettoyage des anciens backups..."

# Nettoyer les backups quotidiens (garder les 30 derniers)
echo "📅 Nettoyage des backups quotidiens (garde les $DAILY_KEEP derniers)..."
ls -t $BACKUP_DIR/complete_backup_*.json | tail -n +$((DAILY_KEEP + 1)) | xargs -r rm -f
ls -t $BACKUP_DIR/users_backup_*.json | tail -n +$((DAILY_KEEP + 1)) | xargs -r rm -f
ls -t $BACKUP_DIR/slots_backup_*.json | tail -n +$((DAILY_KEEP + 1)) | xargs -r rm -f
ls -t $BACKUP_DIR/groups_backup_*.json | tail -n +$((DAILY_KEEP + 1)) | xargs -r rm -f
ls -t $BACKUP_DIR/friendRequests_backup_*.json | tail -n +$((DAILY_KEEP + 1)) | xargs -r rm -f

# Nettoyer les logs (garder les 30 derniers)
echo "📝 Nettoyage des logs (garde les $DAILY_KEEP derniers)..."
ls -t $BACKUP_DIR/backup.log* 2>/dev/null | tail -n +$((DAILY_KEEP + 1)) | xargs -r rm -f
ls -t $BACKUP_DIR/backup_weekly.log* 2>/dev/null | tail -n +$((WEEKLY_KEEP + 1)) | xargs -r rm -f
ls -t $BACKUP_DIR/backup_monthly.log* 2>/dev/null | tail -n +$((MONTHLY_KEEP + 1)) | xargs -r rm -f

echo "✅ Nettoyage terminé !"
echo "📊 Fichiers restants:"
ls -la $BACKUP_DIR/ | grep -E "(backup|log)" | wc -l | xargs echo "Total:"
