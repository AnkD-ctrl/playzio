#!/bin/bash

# Script de test pour vérifier le backup
echo "🧪 Test du système de backup Playzio"
echo "=================================="

# Vérifier que le script principal existe
if [ -f "backups/backup_script.sh" ]; then
    echo "✅ Script de backup trouvé"
else
    echo "❌ Script de backup manquant"
    exit 1
fi

# Vérifier que le script est exécutable
if [ -x "backups/backup_script.sh" ]; then
    echo "✅ Script de backup exécutable"
else
    echo "❌ Script de backup non exécutable"
    exit 1
fi

# Vérifier le crontab
echo ""
echo "📅 Vérification du crontab:"
crontab -l | grep -E "(backup|playzio)" || echo "❌ Aucune tâche de backup trouvée dans le crontab"

# Test de connexion à l'API
echo ""
echo "🌐 Test de connexion à l'API:"
if curl -s "https://playzio-production.up.railway.app/api/users" > /dev/null; then
    echo "✅ API accessible"
else
    echo "❌ API non accessible"
fi

# Test du script de backup
echo ""
echo "🔄 Test du script de backup:"
cd /Users/jack/Desktop/playzioBARA
./backups/backup_script.sh

echo ""
echo "🎉 Test terminé !"
