/**
 * Script de vérification de la configuration .env
 * Utilisation: node check-env.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');

console.log('🔍 Vérification de la configuration .env\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Le fichier .env n\'existe pas dans', __dirname);
  console.log('\n📝 Créez un fichier .env avec le contenu suivant:');
  console.log(`
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cavenger
DB_USER=postgres
DB_PASSWORD=1234

PORT=3000
NODE_ENV=development

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=kouokamasaph142@gmail.com
EMAIL_PASSWORD=bqurwnejqpbtzezp
EMAIL_FROM=noreply@cavenger.com

FRONTEND_URL=http://localhost:4200
  `);
  process.exit(1);
}

console.log('✅ Fichier .env trouvé\n');

// Variables requises
const requiredVars = {
  'DB_HOST': 'Base de données',
  'DB_PORT': 'Base de données',
  'DB_NAME': 'Base de données',
  'DB_USER': 'Base de données',
  'DB_PASSWORD': 'Base de données',
  'PORT': 'Serveur',
  'EMAIL_HOST': 'Email',
  'EMAIL_PORT': 'Email',
  'EMAIL_USER': 'Email (REQUIS)',
  'EMAIL_PASSWORD': 'Email (REQUIS)',
  'EMAIL_FROM': 'Email',
  'FRONTEND_URL': 'CORS'
};

console.log('📋 Vérification des variables:\n');

let allOk = true;
const categories = {};

Object.keys(requiredVars).forEach(key => {
  const category = requiredVars[key];
  if (!categories[category]) {
    categories[category] = [];
  }
  
  const value = process.env[key];
  const isSet = !!value;
  const status = isSet ? '✅' : '❌';
  
  if (key === 'EMAIL_PASSWORD' && isSet) {
    // Afficher seulement les 4 derniers caractères pour sécurité
    const masked = '***' + value.slice(-4);
    console.log(`  ${status} ${key.padEnd(20)} = ${isSet ? masked : '(non défini)'}`);
  } else if (key === 'DB_PASSWORD' && isSet) {
    console.log(`  ${status} ${key.padEnd(20)} = ${isSet ? '***' : '(non défini)'}`);
  } else {
    console.log(`  ${status} ${key.padEnd(20)} = ${isSet ? value : '(non défini)'}`);
  }
  
  if (!isSet) {
    allOk = false;
  }
  
  categories[category].push({ key, isSet });
});

console.log('\n');

// Vérifications spéciales pour l'email
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ Configuration email incomplète!\n');
  console.log('Pour configurer l\'email:');
  console.log('1. Ouvrez le fichier .env dans cv-backend/');
  console.log('2. Ajoutez ou modifiez ces lignes:');
  console.log('   EMAIL_USER=kouokamasaph142@gmail.com');
  console.log('   EMAIL_PASSWORD=bqurwnejqpbtzezp');
  console.log('3. Redémarrez le serveur (npm start)\n');
  allOk = false;
} else {
  // Vérifier si le mot de passe contient des espaces
  if (process.env.EMAIL_PASSWORD.includes(' ')) {
    console.warn('⚠️  Le mot de passe EMAIL_PASSWORD contient des espaces');
    console.warn('   Il est recommandé de les enlever (le service les supprime automatiquement)');
    console.log('');
  }
  
  console.log('✅ Configuration email détectée');
  console.log(`   Email: ${process.env.EMAIL_USER}`);
  console.log(`   Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
  console.log(`   Port: ${process.env.EMAIL_PORT || '587'}`);
  console.log('');
}

if (allOk) {
  console.log('✅ Toutes les variables sont configurées correctement!\n');
} else {
  console.log('❌ Certaines variables sont manquantes. Consultez CONFIGURATION_EMAIL.md pour plus d\'informations.\n');
  process.exit(1);
}










