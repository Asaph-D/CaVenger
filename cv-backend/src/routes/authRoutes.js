const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { pool } = require('../config/database');

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, firstName, lastName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe sont requis'
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Créer l'utilisateur
    const { user, token } = await authService.registerUser({
      email,
      password,
      fullName,
      firstName,
      lastName
    });

    console.log(`✅ Nouvel utilisateur inscrit: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      token,
      user
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    
    // Vérifier si c'est une erreur de duplication
    if (error.message.includes('existe déjà')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'inscription'
    });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe sont requis'
      });
    }

    // Connexion
    const { user, token } = await authService.loginUser(email, password);

    console.log(`✅ Utilisateur connecté: ${email}`);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    
    // Erreur d'authentification
    if (error.message.includes('incorrect')) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la connexion'
    });
  }
});

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur connecté (nécessite un token valide)
 */
router.get('/me', async (req, res) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    }

    // Récupérer l'utilisateur
    const user = await authService.getUserById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * PATCH /api/auth/subscription
 * Met à jour le niveau d'abonnement de l'utilisateur (nécessite un token valide)
 */
router.patch('/subscription', async (req, res) => {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token manquant'
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "
    const decoded = authService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    }

    const { subscriptionTier } = req.body;

    // Validation
    if (!subscriptionTier || !['free', 'premium'].includes(subscriptionTier)) {
      return res.status(400).json({
        success: false,
        error: 'subscriptionTier doit être "free" ou "premium"'
      });
    }

    // Mettre à jour l'utilisateur dans la base de données
    const result = await pool.query(
      'UPDATE users SET subscription_tier = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, full_name, first_name, last_name, subscription_tier',
      [subscriptionTier, decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    const user = result.rows[0];

    console.log(`✅ Abonnement mis à jour pour l'utilisateur ${user.email}: ${subscriptionTier}`);

    res.json({
      success: true,
      message: 'Abonnement mis à jour avec succès',
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.full_name,
        firstName: user.first_name,
        lastName: user.last_name,
        subscriptionTier: user.subscription_tier || 'free'
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

module.exports = router;

