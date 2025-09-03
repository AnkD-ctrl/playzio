#!/bin/bash

# Script pour configurer le nettoyage automatique quotidien des anciennes disponibilités
# Ce script configure une tâche cron qui s'exécute tous les jours à 2h du matin

echo "🔧 Configuration du nettoyage automatique quotidien..."

# Obtenir le répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEANUP_SCRIPT="$SCRIPT_DIR/cleanup_old_slots.js"

# Vérifier que le script de nettoyage existe
if [ ! -f "$CLEANUP_SCRIPT" ]; then
    echo "❌ Erreur: Le script cleanup_old_slots.js n'existe pas dans $SCRIPT_DIR"
    exit 1
fi

# Créer la tâche cron (tous les jours à 2h du matin)
CRON_JOB="0 2 * * * cd $SCRIPT_DIR && node cleanup_old_slots.js >> cleanup.log 2>&1"

# Ajouter la tâche cron
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Tâche cron configurée avec succès!"
echo "📅 Le nettoyage s'exécutera tous les jours à 2h du matin"
echo "📝 Les logs seront sauvegardés dans: $SCRIPT_DIR/cleanup.log"
echo ""
echo "🔍 Pour vérifier les tâches cron configurées:"
echo "   crontab -l"
echo ""
echo "🗑️  Pour supprimer cette tâche cron:"
echo "   crontab -e"
echo "   (puis supprimer la ligne correspondante)"
echo ""
echo "🧪 Pour tester le nettoyage manuellement:"
echo "   cd $SCRIPT_DIR && node cleanup_old_slots.js"
