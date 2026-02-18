# CaVenger Backend

Backend API pour la génération de CV avec templates HTML et envoi par email.

## 🚀 Installation

```bash
cd cv-backend
npm install
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier `cv-backend` avec les variables suivantes :

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cavenger
DB_USER=postgres
DB_PASSWORD=1234

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (pour l'envoi de CV)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@cavenger.com

# JWT Configuration (pour l'authentification)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:4200
```

### Configuration Email (Gmail)

Pour utiliser Gmail, vous devez :
1. Activer l'authentification à deux facteurs
2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utiliser ce mot de passe dans `EMAIL_PASSWORD`

## 🗄️ Base de données

La base de données PostgreSQL `cavenger` doit être créée. Les tables seront créées automatiquement au démarrage.

### Connexion
- **Host**: localhost (ou votre host PostgreSQL)
- **Port**: 5432
- **Database**: cavenger
- **User**: postgres
- **Password**: 1234

## 🏃 Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📡 API Endpoints

### Authentification

#### POST /api/auth/register
Inscription d'un nouvel utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "fullName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "subscriptionTier": "free"
  }
}
```

#### POST /api/auth/login
Connexion d'un utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "fullName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "subscriptionTier": "free"
  }
}
```

#### GET /api/auth/me
Récupère les informations de l'utilisateur connecté (nécessite un token JWT valide).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "fullName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "subscriptionTier": "free"
  }
}
```

### CV

#### POST /api/cv/generate
Génère un CV et l'envoie par email.

**Body:**
```json
{
  "userEmail": "user@example.com",
  "templateId": "cv1",
  "cvData": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "title": "Développeur Full Stack",
      "summary": "Description..."
    },
    "contactInfo": [...],
    "experience": [...],
    "education": [...],
    "skills": [...],
    "languages": [...],
    "interests": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "CV généré et envoyé avec succès",
  "submissionId": 1
}
```

### GET /api/cv/status/:id
Récupère le statut d'une soumission de CV.

### GET /api/cv/history/:email
Récupère l'historique des CV pour un utilisateur.

### GET /health
Vérifie l'état du serveur.

## 📁 Structure

```
cv-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuration PostgreSQL
│   ├── routes/
│   │   ├── cvRoutes.js          # Routes API CV
│   │   └── authRoutes.js        # Routes API Authentification
│   ├── services/
│   │   ├── authService.js       # Service d'authentification (JWT, bcrypt)
│   │   ├── templateService.js  # Service de génération HTML
│   │   ├── pdfService.js        # Service de génération PDF
│   │   └── emailService.js      # Service d'envoi email
│   ├── templates/               # Templates HTML
│   └── index.js                 # Point d'entrée
├── output/                      # PDFs générés (créé automatiquement)
├── package.json
└── README.md
```

## 🐳 Déploiement sur Render

1. Créez un nouveau service Web sur Render
2. Connectez votre repository Git
3. Configurez les variables d'environnement dans Render
4. Pour PostgreSQL, créez une base de données PostgreSQL sur Render et utilisez les variables d'environnement fournies
5. Le build command : `npm install`
6. Le start command : `npm start`

### Variables d'environnement Render

- `DB_HOST` : Host de votre base PostgreSQL Render
- `DB_PORT` : 5432
- `DB_NAME` : Nom de votre base
- `DB_USER` : Utilisateur PostgreSQL
- `DB_PASSWORD` : Mot de passe PostgreSQL
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` : Configuration email
- `PORT` : Render définit automatiquement cette variable
- `NODE_ENV` : production

## 📝 Notes

- Les templates HTML doivent être dans `src/templates/`
- Les PDFs générés sont stockés dans `output/`
- Les soumissions sont sauvegardées dans PostgreSQL
- Puppeteer nécessite des dépendances système sur Linux (installées automatiquement sur Render)

