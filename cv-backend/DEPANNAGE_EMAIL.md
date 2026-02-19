# 🔧 Dépannage - Configuration Email

## Problème : "Configuration email manquante"

Si vous voyez ce message :
```
⚠️ Configuration email manquante. Veuillez configurer EMAIL_USER et EMAIL_PASSWORD dans le fichier .env
```

## Solutions

### 1. Vérifier que le fichier .env existe

Le fichier `.env` doit être dans le dossier `cv-backend/` (même niveau que `package.json`).

```bash
cd cv-backend
dir .env
# ou sur Linux/Mac: ls -la .env
```

### 2. Vérifier le contenu du fichier .env

Ouvrez le fichier `.env` et assurez-vous qu'il contient au minimum :

```env
EMAIL_USER=kouokamasaph142@gmail.com
EMAIL_PASSWORD=bqurwnejqpbtzezp
```

**⚠️ IMPORTANT** :
- Pas d'espaces avant ou après le `=`
- Pas de guillemets autour des valeurs
- Le mot de passe doit être écrit SANS ESPACES (même si Gmail l'affiche avec des espaces)

### 3. Utiliser le script de vérification

```bash
cd cv-backend
npm run check-env
```

Ce script vous indiquera exactement quelles variables sont manquantes.

### 4. Vérifier le format du fichier .env

Le fichier `.env` doit respecter ce format :

```env
# Commentaires commencent par #
VARIABLE=valeur
AUTRE_VARIABLE=autre valeur
```

**❌ Formats incorrects** :
```env
EMAIL_USER = kouokamasaph142@gmail.com  # Espaces autour du =
EMAIL_USER="kouokamasaph142@gmail.com"  # Guillemets (optionnel mais peut causer des problèmes)
EMAIL_USER=kouokamasaph142@gmail.com    # Espaces en fin de ligne
```

**✅ Format correct** :
```env
EMAIL_USER=kouokamasaph142@gmail.com
EMAIL_PASSWORD=bqurwnejqpbtzezp
```

### 5. Redémarrer le serveur

**IMPORTANT** : Après avoir modifié le fichier `.env`, vous DEVEZ redémarrer le serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez-le
npm start
# ou
npm run dev
```

Le fichier `.env` est lu uniquement au démarrage du serveur. Les modifications ne sont pas prises en compte sans redémarrage.

### 6. Exemple de fichier .env complet

Créez ou modifiez le fichier `cv-backend/.env` avec ce contenu :

```env
# Configuration de la base de données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cavenger
DB_USER=postgres
DB_PASSWORD=1234

# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration Email Gmail (REQUIS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=kouokamasaph142@gmail.com
EMAIL_PASSWORD=bqurwnejqpbtzezp
EMAIL_FROM=noreply@cavenger.com

# URL du frontend
FRONTEND_URL=http://localhost:4200
```

### 7. Vérifier que les variables sont chargées

Après avoir redémarré le serveur, vous devriez voir dans la console :

```
✅ Configuration email détectée
   📧 Email: kouokamasaph142@gmail.com
   🔐 Mot de passe: ***zezp
```

Si vous voyez toujours le message d'avertissement, vérifiez :
1. Le fichier `.env` est bien dans `cv-backend/` (pas dans `cv-backend/src/`)
2. Les variables n'ont pas d'espaces autour du `=`
3. Le serveur a été redémarré après modification

### 8. Problèmes courants

#### Le fichier .env est dans le mauvais dossier
- ❌ `cv-backend/src/.env` (mauvais)
- ✅ `cv-backend/.env` (correct)

#### Encodage du fichier
Le fichier `.env` doit être en UTF-8. Si vous utilisez Windows Notepad, sauvegardez-le avec "Encodage UTF-8".

#### Variables avec des espaces
Si votre mot de passe d'application Gmail est `bqur wnej qpbt zezp`, écrivez-le dans le `.env` comme :
```env
EMAIL_PASSWORD=bqurwnejqpbtzezp
```
(Sans espaces - le service les supprime automatiquement, mais il vaut mieux les enlever manuellement)

## Besoin d'aide ?

1. Exécutez `npm run check-env` pour un diagnostic automatique
2. Vérifiez les logs du serveur au démarrage
3. Consultez `CONFIGURATION_EMAIL.md` pour plus de détails










