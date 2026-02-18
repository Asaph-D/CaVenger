# 📧 Configuration Email pour CaVenger

## Configuration Gmail

Pour utiliser Gmail avec CaVenger, vous devez créer un fichier `.env` dans le dossier `cv-backend/` avec la configuration suivante :

### Exemple de configuration (adapté de votre config Spring Boot)

```env
# Configuration de la base de données PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cavenger
DB_USER=postgres
DB_PASSWORD=1234

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration Email Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=kouokamasaph142@gmail.com
EMAIL_PASSWORD=bqurwnejqpbtzezp
EMAIL_FROM=noreply@cavenger.com

# URL du frontend (pour CORS)
FRONTEND_URL=http://localhost:4200
```

### ⚠️ Important : Mot de passe d'application Gmail

**Note importante** : Le mot de passe d'application Gmail `bqur wnej qpbt zezp` doit être écrit **SANS ESPACES** dans le fichier `.env`.

- ❌ **Mauvais** : `EMAIL_PASSWORD=bqur wnej qpbt zezp`
- ✅ **Bon** : `EMAIL_PASSWORD=bqurwnejqpbtzezp`

Le service email supprime automatiquement les espaces du mot de passe, mais il est recommandé de les enlever manuellement dans le fichier `.env`.

### Comment obtenir un mot de passe d'application Gmail

1. Allez sur https://myaccount.google.com/security
2. Activez la **validation en 2 étapes** si ce n'est pas déjà fait
3. Allez sur https://myaccount.google.com/apppasswords
4. Sélectionnez "Mail" comme application
5. Sélectionnez "Autre (nom personnalisé)" comme appareil
6. Entrez "CaVenger Backend" comme nom
7. Cliquez sur "Générer"
8. Copiez le mot de passe à 16 caractères (sans les espaces) dans `EMAIL_PASSWORD`

### Vérification de la configuration

Après avoir créé le fichier `.env`, redémarrez le serveur backend :

```bash
cd cv-backend
npm start
```

Si la configuration est correcte, vous ne verrez **PAS** le message d'avertissement :
```
⚠️ Configuration email manquante...
```

Si vous voyez ce message, vérifiez que :
- Le fichier `.env` est bien dans le dossier `cv-backend/`
- Les variables `EMAIL_USER` et `EMAIL_PASSWORD` sont bien définies
- Il n'y a pas d'espaces avant/après les valeurs
- Le mot de passe d'application est valide

### Test de l'envoi d'email

Une fois configuré, testez l'envoi d'email en générant un CV depuis le frontend. Si tout fonctionne, vous recevrez un email avec le CV en pièce jointe.







