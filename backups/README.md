# 🛡️ Système de Backup Playzio

## 📋 Vue d'ensemble

Ce système de backup automatique protège toutes les données de votre application Playzio contre la perte.

## 🗂️ Structure des fichiers

```
backups/
├── backup_script.sh          # Script principal de backup
├── test_backup.sh            # Script de test du système
├── cleanup_backups.sh        # Script de nettoyage des anciens backups
├── crontab_config.txt        # Configuration du crontab
├── README.md                 # Ce fichier
└── [fichiers de backup]      # Backups automatiques avec timestamps
```

## ⏰ Planification automatique

### **Backups quotidiens** (2h du matin)
- Sauvegarde complète de toutes les données
- Logs dans `backup.log`

### **Backups hebdomadaires** (Dimanche 3h du matin)
- Backup de sécurité supplémentaire
- Logs dans `backup_weekly.log`

### **Backups mensuels** (1er du mois 4h du matin)
- Archive longue durée
- Logs dans `backup_monthly.log`

### **Nettoyage automatique** (5h du matin)
- Garde les 30 derniers backups quotidiens
- Garde les 12 derniers backups hebdomadaires
- Garde les 12 derniers backups mensuels

## 🚀 Utilisation manuelle

### **Backup immédiat :**
```bash
./backups/backup_script.sh
```

### **Test du système :**
```bash
./backups/test_backup.sh
```

### **Nettoyage manuel :**
```bash
./backups/cleanup_backups.sh
```

## 📊 Données sauvegardées

- ✅ **Utilisateurs** : Tous les comptes et profils
- ✅ **Créneaux** : Disponibilités et participants
- ✅ **Groupes** : Groupes et membres
- ✅ **Demandes d'amitié** : Relations entre utilisateurs
- ✅ **Métadonnées** : Dates, sources, structure

## 🔧 Gestion du crontab

### **Voir les tâches planifiées :**
```bash
crontab -l
```

### **Modifier la planification :**
```bash
crontab -e
```

### **Réinstaller la configuration :**
```bash
crontab backups/crontab_config.txt
```

## 📈 Surveillance

### **Vérifier les logs :**
```bash
tail -f backups/backup.log
tail -f backups/backup_weekly.log
tail -f backups/backup_monthly.log
tail -f backups/cleanup.log
```

### **Voir les backups récents :**
```bash
ls -la backups/complete_backup_*.json | head -10
```

## 🚨 En cas de problème

### **Backup manqué :**
1. Vérifier les logs : `tail backups/backup.log`
2. Tester manuellement : `./backups/test_backup.sh`
3. Vérifier le crontab : `crontab -l`

### **Récupération de données :**
1. Identifier le backup : `ls -la backups/complete_backup_*.json`
2. Restaurer depuis le fichier JSON approprié
3. Vérifier l'intégrité des données

## 📞 Support

En cas de problème avec le système de backup, vérifiez :
- ✅ Connexion à l'API Railway
- ✅ Permissions d'écriture dans le dossier `backups/`
- ✅ Exécution du crontab
- ✅ Logs d'erreur dans les fichiers `.log`

---

**🛡️ Vos données sont maintenant protégées 24h/24 !**
