const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash un mot de passe
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare un mot de passe avec un hash
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Génère un token JWT
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      subscriptionTier: user.subscription_tier
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Vérifie un token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Inscription d'un nouvel utilisateur
 */
async function registerUser(userData) {
  const { email, password, fullName, firstName, lastName } = userData;

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('Un utilisateur avec cet email existe déjà');
  }

  // Hasher le mot de passe
  const hashedPassword = await hashPassword(password);

  // Créer l'utilisateur
  const result = await pool.query(
    `INSERT INTO users (email, password, full_name, first_name, last_name)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, full_name, first_name, last_name, subscription_tier, created_at`,
    [email, hashedPassword, fullName || null, firstName || null, lastName || null]
  );

  const user = result.rows[0];

  // Générer le token
  const token = generateToken(user);

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      fullName: user.full_name,
      firstName: user.first_name,
      lastName: user.last_name,
      subscriptionTier: user.subscription_tier || 'free'
    },
    token
  };
}

/**
 * Connexion d'un utilisateur
 */
async function loginUser(email, password) {
  // Trouver l'utilisateur
  const result = await pool.query(
    'SELECT id, email, password, full_name, first_name, last_name, subscription_tier FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('Email ou mot de passe incorrect');
  }

  const user = result.rows[0];

  // Vérifier le mot de passe
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Générer le token
  const token = generateToken(user);

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      fullName: user.full_name,
      firstName: user.first_name,
      lastName: user.last_name,
      subscriptionTier: user.subscription_tier || 'free'
    },
    token
  };
}

/**
 * Récupère un utilisateur par son ID
 */
async function getUserById(userId) {
  const result = await pool.query(
    'SELECT id, email, full_name, first_name, last_name, subscription_tier FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    id: user.id.toString(),
    email: user.email,
    fullName: user.full_name,
    firstName: user.first_name,
    lastName: user.last_name,
    subscriptionTier: user.subscription_tier || 'free'
  };
}

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
  hashPassword,
  comparePassword,
  generateToken
};



