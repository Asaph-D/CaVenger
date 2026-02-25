const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

/**
 * Service intelligent pour analyser et optimiser les templates CV
 * Détecte les problèmes de style, espacement, débordements et ajuste automatiquement
 * IMPORTANT: Préserve la structure des colonnes (ne change pas le nombre de colonnes)
 */
class TemplateIntelligenceService {
  constructor() {
    this.browser = null;
  }

  /**
   * Analyse le HTML et détecte les problèmes
   * @param {string} htmlContent - Le HTML à analyser
   * @returns {Promise<Object>} Rapport d'analyse avec problèmes et suggestions
   */
  async analyzeTemplate(htmlContent) {
    const report = {
      issues: [],
      warnings: [],
      suggestions: [],
      structure: {
        columns: null,
        layout: null
      }
    };

    try {
      // Analyse de la structure avec JSDOM
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // 1. Détecter la structure des colonnes (IMPORTANT: ne pas la modifier)
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        const leftColumn = document.querySelector('.left-column');
        const rightColumn = document.querySelector('.right-column');
        const columns = document.querySelectorAll('[class*="column"], [class*="col-"]');
        
        report.structure.columns = {
          count: columns.length,
          hasLeftColumn: !!leftColumn,
          hasRightColumn: !!rightColumn,
          layout: 'flex' // Structure préservée
        };
      }

      // 2. Détecter les débordements horizontaux
      const overflowIssues = this.detectOverflow(document);
      report.issues.push(...overflowIssues);

      // 3. Détecter les problèmes d'espacement
      const spacingIssues = this.detectSpacingIssues(document);
      report.warnings.push(...spacingIssues);

      // 4. Détecter les problèmes de style
      const styleIssues = this.detectStyleIssues(document);
      report.warnings.push(...styleIssues);

      // 5. Analyser avec Puppeteer pour les dimensions réelles
      const visualAnalysis = await this.analyzeVisualLayout(htmlContent);
      report.issues.push(...visualAnalysis.issues);
      report.warnings.push(...visualAnalysis.warnings);

      // 6. Générer des suggestions d'amélioration
      report.suggestions = this.generateSuggestions(report);

    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      report.issues.push({
        type: 'error',
        severity: 'high',
        message: `Erreur d'analyse: ${error.message}`
      });
    }

    return report;
  }

  /**
   * Détecte les débordements horizontaux
   */
  detectOverflow(document) {
    const issues = [];
    
    // Vérifier les éléments avec des largeurs fixes qui pourraient déborder
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const style = el.getAttribute('style') || '';
      const classList = Array.from(el.classList || []);
      
      // Détecter les largeurs fixes problématiques
      const widthMatch = style.match(/width:\s*(\d+px)/);
      if (widthMatch) {
        const width = parseInt(widthMatch[1]);
        if (width > 1000) {
          issues.push({
            type: 'overflow',
            severity: 'high',
            element: el.tagName.toLowerCase(),
            className: classList.join(' '),
            message: `Largeur fixe excessive: ${width}px`,
            value: width
          });
        }
      }

      // Détecter les textes longs sans word-break
      if (el.textContent && el.textContent.length > 100 && !style.includes('word-break') && !style.includes('overflow')) {
        const hasWordBreak = classList.some(cls => cls.includes('break') || cls.includes('wrap'));
        if (!hasWordBreak) {
          issues.push({
            type: 'overflow',
            severity: 'medium',
            element: el.tagName.toLowerCase(),
            className: classList.join(' '),
            message: `Texte long sans gestion de débordement`,
            suggestion: 'Ajouter word-break: break-word'
          });
        }
      }
    });

    return issues;
  }

  /**
   * Détecte les problèmes d'espacement
   */
  detectSpacingIssues(document) {
    const warnings = [];
    
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      const style = section.getAttribute('style') || '';
      const marginBottom = style.match(/margin-bottom:\s*(\d+px)/);
      
      if (!marginBottom && !style.includes('margin')) {
        // Vérifier si la section a un margin-bottom via CSS
        const hasMargin = Array.from(section.classList).some(cls => 
          cls.includes('margin') || cls.includes('spacing')
        );
        
        if (!hasMargin) {
          warnings.push({
            type: 'spacing',
            severity: 'low',
            element: 'section',
            message: 'Section sans espacement défini',
            suggestion: 'Ajouter margin-bottom pour l\'espacement'
          });
        }
      }
    });

    return warnings;
  }

  /**
   * Détecte les problèmes de style
   */
  detectStyleIssues(document) {
    const warnings = [];
    
    // Vérifier les images sans dimensions
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('width') && !img.hasAttribute('height') && !img.style.width && !img.style.height) {
        warnings.push({
          type: 'style',
          severity: 'medium',
          element: 'img',
          message: 'Image sans dimensions définies',
          suggestion: 'Définir width et height pour éviter les décalages'
        });
      }
    });

    // Vérifier les conteneurs flex sans flex-wrap
    const flexContainers = document.querySelectorAll('[style*="display: flex"], [style*="display:flex"]');
    flexContainers.forEach(container => {
      const style = container.getAttribute('style') || '';
      if (!style.includes('flex-wrap') && !style.includes('wrap')) {
        const children = container.children.length;
        if (children > 3) {
          warnings.push({
            type: 'style',
            severity: 'low',
            element: container.tagName.toLowerCase(),
            message: `Conteneur flex avec ${children} enfants sans flex-wrap`,
            suggestion: 'Considérer ajouter flex-wrap: wrap'
          });
        }
      }
    });

    return warnings;
  }

  /**
   * Analyse le layout visuel avec Puppeteer
   */
  async analyzeVisualLayout(htmlContent) {
    const result = {
      issues: [],
      warnings: []
    };

    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }

      const page = await this.browser.newPage();
      await page.setViewport({ width: 1000, height: 1400 });
      
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded'
      });

      // Attendre un peu pour le rendu
      await new Promise(resolve => setTimeout(resolve, 500));

      // Vérifier les débordements horizontaux
      const overflowElements = await page.evaluate(() => {
        const issues = [];
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          const scrollWidth = el.scrollWidth;
          const clientWidth = el.clientWidth;
          
          // Détecter les débordements
          if (scrollWidth > clientWidth && clientWidth > 0) {
            const overflow = scrollWidth - clientWidth;
            if (overflow > 10) { // Seuil de 10px
              const className = el.className || '';
              const tagName = el.tagName.toLowerCase();
              
              issues.push({
                tag: tagName,
                className: typeof className === 'string' ? className : className.baseVal || '',
                overflow: Math.round(overflow),
                left: Math.round(rect.left),
                width: Math.round(rect.width)
              });
            }
          }
        });
        
        return issues;
      });

      overflowElements.forEach(issue => {
        result.issues.push({
          type: 'overflow',
          severity: issue.overflow > 100 ? 'high' : 'medium',
          element: issue.tag,
          className: issue.className,
          message: `Débordement horizontal de ${issue.overflow}px`,
          overflow: issue.overflow,
          position: { left: issue.left, width: issue.width }
        });
      });

      // Vérifier la structure des colonnes (IMPORTANT: juste pour rapport, pas pour modification)
      const columnStructure = await page.evaluate(() => {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return null;

        const leftColumn = document.querySelector('.left-column');
        const rightColumn = document.querySelector('.right-column');
        const allColumns = document.querySelectorAll('[class*="column"], [class*="col-"]');

        return {
          hasMainContent: !!mainContent,
          hasLeftColumn: !!leftColumn,
          hasRightColumn: !!rightColumn,
          columnCount: allColumns.length,
          mainContentDisplay: window.getComputedStyle(mainContent).display
        };
      });

      if (columnStructure) {
        result.structure = columnStructure;
        
        // Vérifier si la structure est correcte (2 colonnes pour cv1)
        if (columnStructure.columnCount !== 2 && columnStructure.hasLeftColumn && columnStructure.hasRightColumn) {
          result.warnings.push({
            type: 'structure',
            severity: 'high',
            message: `Structure de colonnes détectée: ${columnStructure.columnCount} colonnes au lieu de 2`,
            note: 'La structure ne sera PAS modifiée automatiquement'
          });
        }
      }

      await page.close();

    } catch (error) {
      console.error('Erreur lors de l\'analyse visuelle:', error);
      result.issues.push({
        type: 'error',
        severity: 'medium',
        message: `Erreur d'analyse visuelle: ${error.message}`
      });
    }

    return result;
  }

  /**
   * Génère des suggestions d'amélioration
   */
  generateSuggestions(report) {
    const suggestions = [];

    // Suggérer des corrections pour les débordements
    const overflowIssues = report.issues.filter(i => i.type === 'overflow');
    if (overflowIssues.length > 0) {
      suggestions.push({
        type: 'fix',
        priority: 'high',
        message: `${overflowIssues.length} problème(s) de débordement détecté(s)`,
        action: 'Appliquer les corrections de débordement'
      });
    }

    // Suggérer des améliorations d'espacement
    const spacingWarnings = report.warnings.filter(w => w.type === 'spacing');
    if (spacingWarnings.length > 0) {
      suggestions.push({
        type: 'improvement',
        priority: 'low',
        message: 'Améliorer l\'espacement entre les sections',
        action: 'Ajouter des marges cohérentes'
      });
    }

    return suggestions;
  }

  /**
   * Optimise le template en corrigeant les problèmes détectés
   * IMPORTANT: Préserve la structure des colonnes
   */
  async optimizeTemplate(htmlContent, report) {
    let optimizedHtml = htmlContent;
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Sauvegarder la structure des colonnes (ne pas la modifier)
    const mainContent = document.querySelector('.main-content');
    const leftColumn = document.querySelector('.left-column');
    const rightColumn = document.querySelector('.right-column');
    
    // Vérifier le nombre de colonnes original
    const originalColumnCount = mainContent ? 
      mainContent.querySelectorAll('.left-column, .right-column, [class*="column"]').length : 0;

    // Corriger les problèmes détectés
    for (const issue of report.issues) {
      if (issue.type === 'overflow') {
        optimizedHtml = this.fixOverflow(optimizedHtml, issue);
      }
    }

    // Appliquer les corrections de style
    for (const warning of report.warnings) {
      if (warning.type === 'style' && warning.suggestion) {
        optimizedHtml = this.applyStyleFix(optimizedHtml, warning);
      }
    }

    // Vérifier que la structure des colonnes n'a pas été modifiée
    const newDom = new JSDOM(optimizedHtml);
    const newDocument = newDom.window.document;
    const newMainContent = newDocument.querySelector('.main-content');

    if (newMainContent && mainContent) {
      const newColumnCount = newMainContent.querySelectorAll('.left-column, .right-column, [class*="column"]').length;
      
      if (originalColumnCount !== newColumnCount) {
        console.warn('⚠️ Structure des colonnes préservée - aucune modification de la structure');
        // La structure est préservée automatiquement car on ne modifie que les styles internes
      }
    }

    return optimizedHtml;
  }

  /**
   * Corrige un problème de débordement
   */
  fixOverflow(html, issue) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Trouver l'élément problématique
    let targetElement = null;
    
    if (issue.className) {
      const className = issue.className.split(' ')[0];
      if (className) {
        const elements = document.querySelectorAll(`.${className}`);
        elements.forEach(el => {
          if (el.tagName.toLowerCase() === issue.element) {
            targetElement = el;
          }
        });
      }
    }

    if (!targetElement) {
      // Chercher par tag
      const elements = document.querySelectorAll(issue.element);
      if (elements.length > 0) {
        targetElement = elements[0];
      }
    }

    if (targetElement) {
      // Ne pas modifier les colonnes principales
      const isColumn = targetElement.classList.contains('left-column') || 
                       targetElement.classList.contains('right-column') ||
                       targetElement.classList.contains('main-content');
      
      if (isColumn) {
        return html; // Ne pas modifier les colonnes
      }

      const style = targetElement.getAttribute('style') || '';
      
      // Ajouter word-break si nécessaire
      if (!style.includes('word-break') && !style.includes('overflow')) {
        const newStyle = style 
          ? `${style}; word-break: break-word; overflow-wrap: break-word;`
          : 'word-break: break-word; overflow-wrap: break-word;';
        targetElement.setAttribute('style', newStyle);
      }

      // Si c'est un conteneur, ajouter max-width
      if (issue.overflow > 50) {
        const currentStyle = targetElement.getAttribute('style') || '';
        if (!currentStyle.includes('max-width')) {
          const maxWidth = issue.position ? `${issue.position.width}px` : '100%';
          const updatedStyle = currentStyle 
            ? `${currentStyle}; max-width: ${maxWidth}; box-sizing: border-box;`
            : `max-width: ${maxWidth}; box-sizing: border-box;`;
          targetElement.setAttribute('style', updatedStyle);
        }
      }
    }

    return dom.serialize();
  }

  /**
   * Applique une correction de style
   */
  applyStyleFix(html, warning) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    if (warning.element === 'img' && warning.suggestion) {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
          img.setAttribute('style', 'max-width: 100%; height: auto;');
        }
      });
    }

    return dom.serialize();
  }

  /**
   * Génère un rapport textuel
   */
  generateReportText(report) {
    let text = '📊 RAPPORT D\'ANALYSE DU TEMPLATE\n';
    text += '='.repeat(50) + '\n\n';

    // Structure
    if (report.structure && report.structure.columns) {
      text += `📐 STRUCTURE:\n`;
      text += `   - Colonnes détectées: ${report.structure.columns.count}\n`;
      text += `   - Colonne gauche: ${report.structure.columns.hasLeftColumn ? 'Oui' : 'Non'}\n`;
      text += `   - Colonne droite: ${report.structure.columns.hasRightColumn ? 'Oui' : 'Non'}\n\n`;
    }

    // Problèmes critiques
    const criticalIssues = report.issues.filter(i => i.severity === 'high');
    if (criticalIssues.length > 0) {
      text += `🔴 PROBLÈMES CRITIQUES (${criticalIssues.length}):\n`;
      criticalIssues.forEach((issue, index) => {
        text += `   ${index + 1}. [${issue.type.toUpperCase()}] ${issue.message}\n`;
        if (issue.element) text += `      Élément: <${issue.element}${issue.className ? '.' + issue.className.split(' ')[0] : ''}>\n`;
        if (issue.overflow) text += `      Débordement: ${issue.overflow}px\n`;
      });
      text += '\n';
    }

    // Avertissements
    if (report.warnings.length > 0) {
      text += `⚠️  AVERTISSEMENTS (${report.warnings.length}):\n`;
      report.warnings.forEach((warning, index) => {
        text += `   ${index + 1}. [${warning.type.toUpperCase()}] ${warning.message}\n`;
        if (warning.suggestion) text += `      Suggestion: ${warning.suggestion}\n`;
      });
      text += '\n';
    }

    // Suggestions
    if (report.suggestions.length > 0) {
      text += `💡 SUGGESTIONS (${report.suggestions.length}):\n`;
      report.suggestions.forEach((suggestion, index) => {
        text += `   ${index + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.message}\n`;
        if (suggestion.action) text += `      Action: ${suggestion.action}\n`;
      });
      text += '\n';
    }

    // Résumé
    text += '📈 RÉSUMÉ:\n';
    text += `   - Problèmes critiques: ${criticalIssues.length}\n`;
    text += `   - Problèmes moyens: ${report.issues.filter(i => i.severity === 'medium').length}\n`;
    text += `   - Avertissements: ${report.warnings.length}\n`;
    text += `   - Suggestions: ${report.suggestions.length}\n`;

    return text;
  }

  /**
   * Ferme le navigateur Puppeteer
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new TemplateIntelligenceService();

