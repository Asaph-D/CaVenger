/**
 * Script de test rapide pour la connexion SMTP
 * Utilisation: node test-smtp.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Test de connexion SMTP Gmail...\n');

// Vérifier les variables d'environnement
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ EMAIL_USER ou EMAIL_PASSWORD manquant dans le fichier .env');
  process.exit(1);
}

const emailPassword = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPassword
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Activer les logs détaillés
  logger: true
});

console.log(`📧 Configuration:`);
console.log(`   Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
console.log(`   Port: ${process.env.EMAIL_PORT || '587'}`);
console.log(`   User: ${process.env.EMAIL_USER}`);
console.log(`   Password: ***${emailPassword.slice(-4)}\n`);

console.log('🔄 Test de connexion...\n');

transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ ERREUR DE CONNEXION:');
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Solutions possibles:');
      console.error('   1. Vérifiez votre connexion internet');
      console.error('   2. Vérifiez que le port 587 n\'est pas bloqué par un firewall');
      console.error('   3. Essayez depuis un autre réseau');
    } else if (error.responseCode === 535) {
      console.error('\n💡 Solutions possibles:');
      console.error('   1. Vérifiez que EMAIL_USER et EMAIL_PASSWORD sont corrects');
      console.error('   2. Vérifiez que vous utilisez un mot de passe d\'application Gmail');
      console.error('   3. Générez un nouveau mot de passe d\'application: https://myaccount.google.com/apppasswords');
    }
    
    process.exit(1);
  } else {
    console.log('✅ CONNEXION RÉUSSIE!');
    console.log('   Le serveur SMTP est prêt à envoyer des emails.\n');
    
    // Test d'envoi optionnel
    console.log('📤 Test d\'envoi d\'email...');
    const testEmail = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // S'envoyer à soi-même
      subject: 'Test CaVenger - Connexion SMTP',
      text: 'Ceci est un email de test. Si vous recevez ce message, la configuration SMTP fonctionne correctement!',
      html: '<p>Ceci est un email de test. Si vous recevez ce message, la configuration SMTP fonctionne correctement!</p>'
    };
    
    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.error('❌ Erreur lors de l\'envoi:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Email de test envoyé avec succès!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Vérifiez votre boîte de réception: ${process.env.EMAIL_USER}\n`);
        process.exit(0);
      }
    });
  }
});












