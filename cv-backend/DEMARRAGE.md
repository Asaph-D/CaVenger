# 🚀 Guide de démarrage du Backend CaVenger

## Commandes pour lancer le backend

### 1. Installer les dépendances (première fois uniquement)
```bash
cd cv-backend
npm install
```

### 2. Créer le fichier .env
Créez un fichier `.env` dans le dossier `cv-backend` avec le contenu suivant :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cavenger
DB_USER=postgres
DB_PASSWORD=1234

PORT=3000
NODE_ENV=development

# ⚠️ CONFIGURATION EMAIL REQUISE pour l'envoi de CV
# Pour Gmail, vous devez :
# 1. Activer l'authentification à deux facteurs sur votre compte Google
# 2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords
# 3. Utiliser ce mot de passe dans EMAIL_PASSWORD (pas votre mot de passe Gmail normal)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@cavenger.com

FRONTEND_URL=http://localhost:4200
```

**⚠️ IMPORTANT** : Les variables `EMAIL_USER` et `EMAIL_PASSWORD` sont **OBLIGATOIRES** pour que l'envoi de CV par email fonctionne. Sans ces variables, vous obtiendrez une erreur lors de la génération de CV.

**💡 Exemple de configuration avec votre compte Gmail** :
```env
EMAIL_USER=kouokamasaph142@gmail.com
EMAIL_PASSWORD=bqurwnejqpbtzezp
```
*Note : Le mot de passe d'application doit être écrit SANS ESPACES dans le fichier .env*

Pour plus de détails, consultez `CONFIGURATION_EMAIL.md`

### 2.5. Vérifier la configuration (optionnel)

Vous pouvez vérifier que votre fichier `.env` est correctement configuré :

```bash
cd cv-backend
npm run check-env
```

Ce script vérifie que toutes les variables nécessaires sont définies.

### 3. Démarrer le backend

#### Mode développement (avec rechargement automatique)
```bash
cd cv-backend
npm run dev
```

#### Mode production
```bash
cd cv-backend
npm start
```

Le serveur démarre sur **http://localhost:3000**

### 4. Vérifier que le backend fonctionne

Ouvrez dans votre navigateur : **http://localhost:3000/health**

Vous devriez voir :
```json
{
  "status": "OK",
  "message": "CaVenger Backend API",
  "timestamp": "..."
}
```

### 5. Tester l'endpoint des templates

Ouvrez : **http://localhost:3000/api/cv/templates**

Vous devriez voir la liste des templates disponibles depuis le répertoire `cv-backend/src/templates/`

## ⚠️ Problèmes courants

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez les identifiants dans le fichier `.env`
- Testez la connexion : `psql -U postgres -d cavenger`

### Erreur CORS
- Vérifiez que `FRONTEND_URL` dans `.env` correspond à l'URL de votre frontend Angular (par défaut http://localhost:4200)

### Port déjà utilisé
- Changez le `PORT` dans le fichier `.env` si le port 3000 est déjà utilisé

### Erreur "Missing credentials for PLAIN" ou "Configuration email manquante"
- **Cause** : Les variables `EMAIL_USER` et/ou `EMAIL_PASSWORD` ne sont pas configurées dans le fichier `.env`
- **Solution** :
  1. Ouvrez le fichier `.env` dans `cv-backend/`
  2. Remplissez `EMAIL_USER` avec votre adresse email Gmail
  3. Pour `EMAIL_PASSWORD`, vous devez utiliser un **mot de passe d'application** (pas votre mot de passe Gmail normal) :
     - Allez sur https://myaccount.google.com/apppasswords
     - Générez un mot de passe d'application pour "Mail"
     - Copiez ce mot de passe dans `EMAIL_PASSWORD`
  4. Redémarrez le serveur backend après modification du `.env`

## 📝 Notes

- Les templates sont automatiquement scannés depuis `cv-backend/src/templates/`
- Les PDFs générés sont stockés dans `cv-backend/output/`
- Les soumissions sont sauvegardées dans PostgreSQL




