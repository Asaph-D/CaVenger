const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const templateService = require('../services/templateService');
const templateScanner = require('../services/templateScanner');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');
const path = require('path');
const fs = require('fs').promises;

/**
 * POST /api/cv/generate
 * Génère un CV à partir des données et envoie par email
 */
router.post('/generate', async (req, res) => {
  try {
    const { userEmail, templateId, cvData } = req.body;

    // Validation
    if (!userEmail || !templateId || !cvData) {
      return res.status(400).json({
        success: false,
        error: 'userEmail, templateId et cvData sont requis'
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
    }

    console.log(`📝 Génération de CV pour ${userEmail} avec le template ${templateId}`);

    // Sauvegarder dans la base de données
    const insertResult = await pool.query(
      `INSERT INTO cv_submissions (user_email, template_id, cv_data, status)
       VALUES ($1, $2, $3, 'processing')
       RETURNING id`,
      [userEmail, templateId, JSON.stringify(cvData)]
    );

    const submissionId = insertResult.rows[0].id;

    try {
      // Générer le HTML
      const htmlContent = await templateService.generateHTML(templateId, cvData);

      // Générer le PDF
      const filename = `CV_${submissionId}_${Date.now()}.pdf`;
      const pdfPath = await pdfService.generatePDF(htmlContent, filename);

      // Envoyer par email
      await emailService.sendCVEmail(userEmail, pdfPath, cvData);

      // Mettre à jour le statut dans la base de données
      await pool.query(
        `UPDATE cv_submissions 
         SET status = 'completed', pdf_path = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [pdfPath, submissionId]
      );

      console.log(`✅ CV généré et envoyé avec succès pour ${userEmail}`);

      res.json({
        success: true,
        message: 'CV généré et envoyé avec succès',
        submissionId: submissionId
      });

    } catch (error) {
      // Mettre à jour le statut en erreur
      await pool.query(
        `UPDATE cv_submissions 
         SET status = 'error', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [submissionId]
      );

      console.error(`❌ Erreur lors de la génération du CV:`, error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Erreur dans /api/cv/generate:', error);

    // Message d'erreur plus clair pour les problèmes de configuration email
    let errorMessage = error.message || 'Erreur lors de la génération du CV';
    if (errorMessage.includes('email') || errorMessage.includes('EMAIL')) {
      errorMessage = 'Configuration email manquante. Veuillez configurer EMAIL_USER et EMAIL_PASSWORD dans le fichier .env';
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * GET /api/cv/status/:id
 * Récupère le statut d'une soumission
 */
router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, user_email, template_id, status, created_at, updated_at
       FROM cv_submissions
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Soumission non trouvée'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erreur dans /api/cv/status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cv/history/:email
 * Récupère l'historique des CV pour un utilisateur
 */
router.get('/history/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      `SELECT id, template_id, status, created_at, updated_at
       FROM cv_submissions
       WHERE user_email = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [email]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Erreur dans /api/cv/history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cv/templates
 * Liste tous les templates disponibles dans le répertoire
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await templateScanner.scanTemplates();
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('❌ Erreur dans /api/cv/templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/cv/templates/:id
 * Récupère les détails d'un template spécifique
 */
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const templateDetails = await templateScanner.getTemplateDetails(id);
    res.json({
      success: true,
      data: templateDetails
    });
  } catch (error) {
    console.error('❌ Erreur dans /api/cv/templates/:id:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

