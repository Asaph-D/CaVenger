const fs = require('fs').promises;
const path = require('path');

/**
 * Service pour scanner et analyser les templates disponibles
 */
class TemplateScanner {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
  }

  /**
   * Scanne le répertoire des templates et retourne la liste des templates disponibles
   */
  async scanTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      const templates = [];

      for (const file of files) {
        if (file.endsWith('.html')) {
          const templateId = path.basename(file, '.html');
          const templatePath = path.join(this.templatesDir, file);
          
          // Lire le contenu pour extraire les métadonnées
          const content = await fs.readFile(templatePath, 'utf-8');
          const metadata = this.extractMetadata(content, templateId);
          
          templates.push({
            id: templateId,
            name: metadata.name || this.generateNameFromId(templateId),
            description: metadata.description || `Template ${templateId}`,
            layout: metadata.layout || 'two-column',
            placeholders: this.extractPlaceholders(content)
          });
        }
      }

      return templates.sort((a, b) => {
        // Trier par numéro si possible (cv1, cv2, etc.)
        const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
    } catch (error) {
      console.error('Erreur lors du scan des templates:', error);
      return [];
    }
  }

  /**
   * Extrait les métadonnées du template (nom, description, layout) depuis les commentaires HTML
   */
  extractMetadata(content, templateId) {
    const metadata = {
      name: null,
      description: null,
      layout: null
    };

    // Chercher les commentaires HTML avec métadonnées
    const metaCommentRegex = /<!--\s*@(\w+):\s*(.+?)\s*-->/g;
    let match;
    
    while ((match = metaCommentRegex.exec(content)) !== null) {
      const key = match[1].toLowerCase();
      const value = match[2].trim();
      
      if (key === 'name') metadata.name = value;
      if (key === 'description') metadata.description = value;
      if (key === 'layout') metadata.layout = value;
    }

    return metadata;
  }

  /**
   * Extrait tous les placeholders du template (mots-clés à remplacer)
   */
  extractPlaceholders(content) {
    const placeholders = new Set();

    // Chercher les patterns communs de placeholders
    // Pattern 1: {{placeholder}}
    const curlyPattern = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = curlyPattern.exec(content)) !== null) {
      placeholders.add(match[1].trim());
    }

    // Pattern 2: Texte simple à remplacer (Nom Prénom, Titre Professionnel, etc.)
    const commonPlaceholders = [
      'Nom Prénom',
      'Titre Professionnel',
      'Description professionnelle',
      'email@domain.com',
      '+00 000 000 000',
      'Ville, Pays',
      'Poste Occupé',
      'Nom de l\'entreprise',
      'Année - Année',
      'Diplôme ou Certification',
      'Établissement',
      'Compétence 1',
      'Compétence 2',
      'Compétence 3',
      'Loisir 1',
      'Loisir 2'
    ];

    commonPlaceholders.forEach(placeholder => {
      if (content.includes(placeholder)) {
        placeholders.add(placeholder);
      }
    });

    // Pattern 3: Chercher dans les classes et IDs pour des patterns spécifiques
    const classPattern = /class="[^"]*placeholder[^"]*"/gi;
    if (classPattern.test(content)) {
      placeholders.add('dynamic-content');
    }

    return Array.from(placeholders);
  }

  /**
   * Génère un nom à partir de l'ID du template
   */
  generateNameFromId(templateId) {
    // cv1 -> Template 1, cv-modern -> Modern
    const cleanId = templateId.replace(/^cv-?/i, '');
    return cleanId.charAt(0).toUpperCase() + cleanId.slice(1) || 'Template';
  }

  /**
   * Récupère les détails d'un template spécifique
   */
  async getTemplateDetails(templateId) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateId}.html`);
      const content = await fs.readFile(templatePath, 'utf-8');
      
      return {
        id: templateId,
        name: this.extractMetadata(content, templateId).name || this.generateNameFromId(templateId),
        description: this.extractMetadata(content, templateId).description || `Template ${templateId}`,
        layout: this.extractMetadata(content, templateId).layout || 'two-column',
        placeholders: this.extractPlaceholders(content),
        preview: this.generatePreview(content)
      };
    } catch (error) {
      throw new Error(`Template ${templateId} non trouvé`);
    }
  }

  /**
   * Génère un aperçu du template (premières lignes)
   */
  generatePreview(content) {
    // Extraire le titre ou le premier texte visible
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1];
    }
    
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) {
      return h1Match[1].replace(/<[^>]+>/g, '').trim();
    }
    
    return 'Template CV';
  }
}

module.exports = new TemplateScanner();

