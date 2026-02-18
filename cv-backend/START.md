# Commandes pour démarrer le backend

## 1. Installer les dépendances (première fois uniquement)
```bash
cd cv-backend
npm install
```

## 2. Créer le fichier .env
Créez un fichier `.env` dans le dossier `cv-backend` avec :
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cavenger
DB_USER=postgres
DB_PASSWORD=1234

PORT=3000
NODE_ENV=development

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@cavenger.com

FRONTEND_URL=http://localhost:4200
```

## 3. Démarrer le backend

### Mode développement (avec rechargement automatique)
```bash
cd cv-backend
npm run dev
```

### Mode production
```bash
cd cv-backend
npm start
```

Le serveur démarre sur **http://localhost:3000**

## 4. Vérifier que le backend fonctionne
Ouvrez dans votre navigateur : http://localhost:3000/health

Vous devriez voir :
```json
{
  "status": "OK",
  "message": "CaVenger Backend API",
  "timestamp": "..."
}
```

## 5. Tester l'endpoint des templates
Ouvrez : http://localhost:3000/api/cv/templates

Vous devriez voir la liste des templates disponibles.










