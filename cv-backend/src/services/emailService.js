const nodemailer = require('nodemailer');
const fs = require('fs').promises;
require('dotenv').config();

/**
 * Service pour envoyer des emails avec pièces jointes
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    // Vérifier si les credentials sont configurés
    const hasEmailUser = !!process.env.EMAIL_USER;
    const hasEmailPassword = !!process.env.EMAIL_PASSWORD;

    if (!hasEmailUser || !hasEmailPassword) {
      console.warn('⚠️ Configuration email manquante. Les emails ne pourront pas être envoyés.');
      console.warn('   Veuillez configurer EMAIL_USER et EMAIL_PASSWORD dans le fichier .env');
      if (!hasEmailUser) {
        console.warn('   ❌ EMAIL_USER est manquant');
      }
      if (!hasEmailPassword) {
        console.warn('   ❌ EMAIL_PASSWORD est manquant');
      }
      console.warn('   📝 Assurez-vous que le fichier .env est dans le dossier cv-backend/');
      console.warn('   📝 Redémarrez le serveur après avoir modifié le fichier .env');
      this.transporter = null;
      return;
    }

    console.log('✅ Configuration email détectée');
    console.log(`   📧 Email: ${process.env.EMAIL_USER}`);
    console.log(`   🔐 Mot de passe: ${process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'non défini'}`);

    // Configuration pour Gmail (peut être adaptée pour d'autres providers)
    // Note: Les mots de passe d'application Gmail peuvent avoir des espaces
    // On les supprime automatiquement car ils fonctionnent mieux sans espaces
    const emailPassword = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: emailPassword
      },
      // Configuration SMTP pour meilleure compatibilité avec Gmail
      // Timeouts augmentés pour éviter les erreurs de connexion (surtout avec pièces jointes)
      connectionTimeout: 120000, // 120 secondes (2 minutes) pour les gros fichiers
      greetingTimeout: 60000,     // 60 secondes
      socketTimeout: 120000,     // 120 secondes (2 minutes)
      // Support STARTTLS
      requireTLS: true,
      tls: {
        rejectUnauthorized: false
      },
      // Options supplémentaires pour Gmail
      debug: false, // Mettre à true pour voir les logs SMTP détaillés
      logger: false,
      // Désactiver le pooling pour éviter les problèmes de timeout
      pool: false
    });
  }

  /**
   * Vérifie si le service email est configuré
   */
  isConfigured() {
    return this.transporter !== null;
  }

  /**
   * Vérifie la connexion SMTP
   */
  async verifyConnection() {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ Erreur de vérification SMTP:', error.message);
      return false;
    }
  }

  /**
   * Envoie le CV en PDF par email
   */
  async sendCVEmail(userEmail, pdfPath, cvData) {
    if (!this.isConfigured()) {
      throw new Error('Service email non configuré. Veuillez configurer EMAIL_USER et EMAIL_PASSWORD dans le fichier .env');
    }

    try {
      // Vérification de connexion désactivée pour éviter les timeouts supplémentaires
      // L'envoi direct est plus rapide et fiable

      const firstName = cvData.personalInfo?.firstName || '';
      const lastName = cvData.personalInfo?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Votre CV généré - CaVenger',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5016;">Bonjour ${fullName},</h2>
            <p>Votre CV a été généré avec succès !</p>
            <p>Vous trouverez votre CV en pièce jointe au format PDF.</p>
            <p>Merci d'avoir utilisé CaVenger pour créer votre CV professionnel.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `CV_${fullName.replace(/\s+/g, '_')}.pdf`,
            path: pdfPath
          }
        ]
      };

      console.log(`📧 Envoi de l'email à ${userEmail}...`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);

      // Messages d'erreur plus explicites
      let errorMessage = error.message;
      if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout de connexion SMTP. Vérifiez votre connexion internet et que le port 587 n\'est pas bloqué par un firewall.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Connexion SMTP refusée. Vérifiez EMAIL_HOST et EMAIL_PORT dans le fichier .env.';
      } else if (error.responseCode === 535) {
        errorMessage = 'Authentification échouée. Vérifiez que EMAIL_USER et EMAIL_PASSWORD sont corrects dans le fichier .env.';
      }

      throw new Error(`Erreur lors de l'envoi de l'email: ${errorMessage}`);
    }
  }

  /**
   * Envoie le CV en PDF par email avec buffer
   */
  async sendCVEmailWithBuffer(userEmail, pdfBuffer, cvData) {
    if (!this.isConfigured()) {
      throw new Error('Service email non configuré. Veuillez configurer EMAIL_USER et EMAIL_PASSWORD dans le fichier .env');
    }

    try {
      const firstName = cvData.personalInfo?.firstName || '';
      const lastName = cvData.personalInfo?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Votre CV généré - CaVenger',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5016;">Bonjour ${fullName},</h2>
            <p>Votre CV a été généré avec succès !</p>
            <p>Vous trouverez votre CV en pièce jointe au format PDF.</p>
            <p>Merci d'avoir utilisé CaVenger pour créer votre CV professionnel.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">
              Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `CV_${fullName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBuffer
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email envoyé avec succès:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();

