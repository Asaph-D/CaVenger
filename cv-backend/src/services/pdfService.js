const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Service pour générer des PDF à partir de HTML
 */
class PDFService {
  constructor() {
    this.outputDir = path.join(__dirname, '../../output');
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Erreur lors de la création du dossier output:', error);
    }
  }

  /**
   * Génère un PDF à partir d'un HTML
   */
  async generatePDF(htmlContent, filename) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Pour Render
      });

      const page = await browser.newPage();
      
      // Définir le contenu HTML
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      // Générer le PDF
      const pdfPath = path.join(this.outputDir, filename);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm'
        }
      });

      await browser.close();
      
      return pdfPath;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  }

  /**
   * Génère un PDF et retourne le buffer
   */
  async generatePDFBuffer(htmlContent) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm'
        }
      });

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      throw new Error(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  }
}

module.exports = new PDFService();

