const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./config/database');
const cvRoutes = require('./routes/cvRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CaVenger Backend API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/cv', cvRoutes);
app.use('/api/auth', authRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Erreur serveur interne'
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Initialiser la base de données
    await initDatabase();

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📧 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:4200'}`);

      // Vérifier la configuration email au démarrage
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('');
        console.warn('⚠️  ATTENTION: Configuration email non détectée');
        console.warn('   Le fichier .env doit contenir EMAIL_USER et EMAIL_PASSWORD');
        console.warn('   Consultez CONFIGURATION_EMAIL.md pour plus d\'informations');
        console.log('');
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

