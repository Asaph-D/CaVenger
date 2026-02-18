const fs = require('fs').promises;
const path = require('path');

/**
 * Service pour charger et remplir les templates HTML avec les données CV
 */
class TemplateService {
  constructor() {
    this.templatesDir = path.join(__dirname, '../templates');
  }

  /**
   * Charge un template HTML par son ID (utilise directement les fichiers du répertoire)
   */
  async loadTemplate(templateId) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateId}.html`);
      const template = await fs.readFile(templatePath, 'utf-8');
      return template;
    } catch (error) {
      // Si le template spécifique n'existe pas, utiliser cv1.html par défaut
      if (error.code === 'ENOENT') {
        console.warn(`Template ${templateId} non trouvé, utilisation de cv1.html par défaut`);
        const defaultPath = path.join(this.templatesDir, 'cv1.html');
        return await fs.readFile(defaultPath, 'utf-8');
      }
      throw error;
    }
  }

  /**
   * Remplace les placeholders dans le template par les données réelles
   * Cette méthode remplace dynamiquement tous les placeholders trouvés dans le template
   * Fonctionne avec tous les formats de templates (cv1, cv2, cv3, etc.)
   */
  fillTemplate(template, cvData) {
    let filledTemplate = template;

    // Extraire les données structurées
    const data = this.extractCVData(cvData);

    // 1. Remplacer d'abord les placeholders textuels dans le header et les sections fixes
    // (doit être fait avant les sections dynamiques pour éviter les conflits)
    filledTemplate = this.replaceTextPlaceholders(filledTemplate, data);

    // 2. Remplacer les placeholders {{key}} si présents dans le template
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = data[key] || '';
      if (value) {
        filledTemplate = filledTemplate.replace(new RegExp(this.escapeRegex(placeholder), 'g'), this.escapeHtml(value));
      }
    });

    // 3. Remplacer les sections dynamiques (expérience, formation, etc.)
    // (doit être fait en dernier pour remplacer tout le contenu des sections)
    filledTemplate = this.replaceDynamicSections(filledTemplate, cvData);

    return filledTemplate;
  }

  /**
   * Extrait et structure les données CV pour le remplacement
   */
  extractCVData(cvData) {
    const firstName = cvData.personalInfo?.firstName || '';
    const lastName = cvData.personalInfo?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || '';

    return {
      'fullName': fullName,
      'firstName': firstName,
      'lastName': lastName,
      'title': cvData.personalInfo?.title || '',
      'summary': cvData.personalInfo?.summary || '',
      'email': this.getContactValue(cvData.contactInfo, 'email'),
      'phone': this.getContactValue(cvData.contactInfo, 'phone'),
      'address': this.getContactValue(cvData.contactInfo, 'address'),
      'website': this.getContactValue(cvData.contactInfo, 'website'),
      'linkedin': this.getContactValue(cvData.contactInfo, 'linkedin')
    };
  }

  /**
   * Récupère la valeur d'un type de contact spécifique
   */
  getContactValue(contactInfo, type) {
    if (!contactInfo || !Array.isArray(contactInfo)) return '';
    const contact = contactInfo.find(c => c.type === type && c.visible);
    return contact?.value || '';
  }

  /**
   * Remplace les placeholders textuels communs (générique pour tous les templates)
   */
  replaceTextPlaceholders(template, data) {
    let result = template;

    // Mapping exhaustif des placeholders textuels vers les données
    // Gère différentes variantes de casse et format
    const textMappings = [
      // Nom et prénom (variantes)
      { patterns: ['Nom Prénom', 'NOM PRÉNOM', 'Nom et Prénom', 'nom prénom'], value: data.fullName },
      { patterns: ['Prénom Nom', 'PRÉNOM NOM'], value: data.fullName },

      // Titre professionnel (variantes)
      { patterns: ['Titre Professionnel', 'TITRE PROFESSIONNEL', 'Titre professionnel', 'MÉTIER', 'Métier'], value: data.title },

      // Description/Profil (variantes)
      { patterns: ['Description professionnelle générale.', 'Description professionnelle générale', 'Description professionnelle'], value: data.summary },
      { patterns: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Lorem ipsum dolor sit amet', 'Lorem ipsum'], value: data.summary },

      // Email (variantes)
      { patterns: ['email@domain.com', 'Email : email@domain.com', 'email@domain.com'], value: data.email },

      // Téléphone (variantes)
      { patterns: ['+00 000 000 000', '00 00 00 00', 'Téléphone : 00 00 00 00'], value: data.phone },

      // Adresse (variantes)
      { patterns: ['Ville, Pays', 'Adresse postale', 'Ville Pays'], value: data.address },

      // Placeholders génériques
      { patterns: ['POSTE – ENTREPRISE', 'Poste Occupé', 'POSTE'], value: '' }, // Sera remplacé par les sections dynamiques
      { patterns: ['Nom de l\'entreprise', 'ENTREPRISE'], value: '' },
      { patterns: ['DIPLÔME', 'Diplôme ou Certification'], value: '' },
      { patterns: ['Établissement'], value: '' }
    ];

    // Remplacer tous les patterns
    textMappings.forEach(mapping => {
      if (mapping.value) {
        mapping.patterns.forEach(pattern => {
          // Recherche insensible à la casse et flexible
          const regex = new RegExp(this.escapeRegex(pattern), 'gi');
          result = result.replace(regex, this.escapeHtml(mapping.value));
        });
      }
    });

    // Remplacer les sections de profil/description (plusieurs formats possibles)
    if (data.summary) {
      // Format 1: <p>Description...</p> (générique)
      result = result.replace(
        /(<p[^>]*>)(.*?Lorem ipsum.*?|.*?Description professionnelle.*?|.*?Résumé.*?)(<\/p>)/is,
        `$1${this.escapeHtml(data.summary)}$3`
      );

      // Format 2: Section avec titre "Profil"
      result = result.replace(
        /(<div[^>]*class="[^"]*section[^"]*"[^>]*>\s*<[^>]*>Profil<\/[^>]*>\s*<p[^>]*>)(.*?)(<\/p>)/is,
        `$1${this.escapeHtml(data.summary)}$3`
      );

      // Format 3: Dans une div de profil
      result = result.replace(
        /(<div[^>]*class="[^"]*profil[^"]*"[^>]*>\s*<p[^>]*>)(.*?Lorem ipsum.*?)(<\/p>)/is,
        `$1${this.escapeHtml(data.summary)}$3`
      );

      // Format 4: Paragraphe après le header (cv2, cv3)
      result = result.replace(
        /(<div[^>]*class="[^"]*job[^"]*"[^>]*>.*?<\/div>\s*<p[^>]*>)(.*?Lorem ipsum.*?)(<\/p>)/is,
        `$1${this.escapeHtml(data.summary)}$3`
      );
    }

    return result;
  }

  /**
   * Remplace les sections dynamiques (expérience, formation, compétences, etc.)
   */
  replaceDynamicSections(template, cvData) {
    let result = template;

    // Section Contact
    result = this.replaceContactSection(result, cvData.contactInfo || []);

    // Section Expérience
    result = this.replaceExperienceSection(result, cvData.experience || []);

    // Section Formation
    result = this.replaceEducationSection(result, cvData.education || []);

    // Section Compétences
    result = this.replaceSkillsSection(result, cvData.skills || []);

    // Section Langues
    result = this.replaceLanguagesSection(result, cvData.languages || []);

    // Section Centres d'intérêt
    result = this.replaceInterestsSection(result, cvData.interests || []);

    return result;
  }

  /**
   * Remplace la section contact (générique pour tous les templates)
   */
  replaceContactSection(template, contactInfo) {
    let result = template;

    if (!contactInfo || !Array.isArray(contactInfo)) {
      return result;
    }

    // Remplacer les placeholders de contact dans le template
    contactInfo.forEach(contact => {
      if (contact.visible !== false && contact.value) {
        const escapedValue = this.escapeHtml(contact.value);

        // Remplacer selon le type de contact
        switch (contact.type) {
          case 'email':
            result = result.replace(/email@exemple\.com/gi, escapedValue);
            result = result.replace(/Email : email@exemple\.com/gi, `Email : ${escapedValue}`);
            result = result.replace(/email@example\.com/gi, escapedValue);
            break;
          case 'phone':
            result = result.replace(/\+00 000 000 000/gi, escapedValue);
            result = result.replace(/00 00 00 00/gi, escapedValue);
            result = result.replace(/Téléphone : 00 00 00 00/gi, `Téléphone : ${escapedValue}`);
            break;
          case 'address':
            result = result.replace(/Ville, Pays/gi, escapedValue);
            result = result.replace(/Adresse postale/gi, escapedValue);
            break;
        }
      }
    });

    // Générer le HTML de contact pour les sections structurées
    let contactHtml = '';
    contactInfo.forEach(contact => {
      if (contact.visible !== false && contact.value) {
        const icon = this.getContactIcon(contact.type);
        contactHtml += `<div class="contact-item"><i class="${icon}"></i> ${this.escapeHtml(contact.value)}</div>\n`;
      }
    });

    if (contactHtml) {
      // Chercher les sections de contact avec différents patterns
      const contactPatterns = [
        /(<div[^>]*class="[^"]*section[^"]*"[^>]*>\s*<div[^>]*class="[^"]*section-title[^"]*"[^>]*>Contact<\/div>\s*)(.*?)(\s*<\/div>\s*<\/div>)/is,
        /(<h3[^>]*>Profil<\/h3>\s*)(.*?)(\s*<h3)/is
      ];

      for (const pattern of contactPatterns) {
        if (pattern.test(result)) {
          result = result.replace(pattern, `$1${contactHtml.trim()}$3`);
          break;
        }
      }
    }

    return result;
  }

  /**
   * Détecte le format d'un template (cv1, cv2, etc.)
   */
  detectTemplateFormat(template) {
    if (template.includes('class="experience-item"')) {
      return 'format1'; // cv1 style
    }
    if (template.includes('class="item"') && template.includes('class="date"') && template.includes('class="content"')) {
      return 'format2'; // cv2 style
    }
    if (template.includes('POSTE – ENTREPRISE')) {
      return 'format2'; // cv2 style
    }
    return 'format1'; // Par défaut
  }

  /**
   * Génère le HTML d'une expérience selon le format du template
   */
  generateExperienceHTML(exp, format) {
    const dateRange = exp.current
      ? `${exp.startDate || ''} - Présent`
      : `${exp.startDate || ''} - ${exp.endDate || ''}`;

    let bulletsHtml = '';
    if (exp.description) {
      if (Array.isArray(exp.description)) {
        exp.description.forEach(desc => {
          if (desc) bulletsHtml += `<li>${this.escapeHtml(desc)}</li>\n`;
        });
      } else if (typeof exp.description === 'string') {
        bulletsHtml += `<li>${this.escapeHtml(exp.description)}</li>\n`;
      }
    }

    if (format === 'format2') {
      // Format cv2: item avec date et content
      return `
        <div class="item">
          <div class="date">${this.escapeHtml(dateRange)}</div>
          <div class="content">
            <h4>${this.escapeHtml(exp.title || '')} – ${this.escapeHtml(exp.company || '')}</h4>
            ${bulletsHtml ? `<ul>${bulletsHtml}</ul>` : '<p>Description de l\'expérience professionnelle.</p>'}
          </div>
        </div>
      `;
    } else {
      // Format cv1: experience-item
      return `
        <div class="experience-item">
          <div class="job-title">${this.escapeHtml(exp.title || '')}</div>
          <div class="location">${this.escapeHtml(exp.company || '')}</div>
          <div class="date">${this.escapeHtml(dateRange)}</div>
          ${bulletsHtml ? `<ul>${bulletsHtml}</ul>` : ''}
        </div>
      `;
    }
  }

  /**
   * Remplace la section expérience (générique pour tous les templates)
   */
  replaceExperienceSection(template, experiences) {
    let result = template;

    if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
      return result;
    }

    // Détecter le format du template
    const format = this.detectTemplateFormat(template);

    // Générer le HTML pour toutes les expériences
    let experienceHtml = '';
    experiences.forEach(exp => {
      if (exp.visible !== false) {
        experienceHtml += this.generateExperienceHTML(exp, format);
      }
    });

    if (!experienceHtml) {
      return result;
    }

    // Patterns de recherche pour différentes structures
    const sectionPatterns = [
      // Pattern 1: Section avec "Expérience Professionnelle" (cv1)
      /(<div[^>]*class="[^"]*section[^"]*"[^>]*>\s*<div[^>]*class="[^"]*section-title[^"]*"[^>]*>Expérience Professionnelle<\/div>\s*)(.*?)(\s*<\/div>\s*<div[^>]*class="[^"]*section)/is,
      // Pattern 2: Section avec "Expériences Professionnelles" (cv2)
      /(<div[^>]*class="[^"]*section[^>]*>\s*<h2[^>]*>Expériences Professionnelles<\/h2>\s*)(.*?)(\s*<\/div>\s*<div[^>]*class="[^"]*section)/is,
      // Pattern 3: Section avec "Expérience" (générique)
      /(<div[^>]*class="[^"]*section[^>]*>\s*<[^>]*>Expérience[^<]*<\/[^>]*>\s*)(.*?)(\s*<\/div>\s*<div[^>]*class="[^"]*section)/is,
      // Pattern 4: Section avec h3 "Expériences professionnelles"
      /(<h3[^>]*>Expériences professionnelles<\/h3>\s*)(.*?)(\s*<div[^>]*class="[^"]*section|<h3)/is
    ];

    let replaced = false;
    for (const pattern of sectionPatterns) {
      if (pattern.test(result)) {
        result = result.replace(pattern, `$1${experienceHtml.trim()}$3`);
        replaced = true;
        break;
      }
    }

    // Si aucune section trouvée, remplacer les items individuels
    if (!replaced) {
      // Remplacer les items d'expérience existants (tous les placeholders)
      if (format === 'format2') {
        // Remplacer tous les items d'expérience par le nouveau contenu
        const itemPattern = /<div class="item">\s*<div class="date">.*?<\/div>\s*<div class="content">.*?<\/div>\s*<\/div>/gs;
        let firstMatch = true;
        result = result.replace(itemPattern, () => {
          if (firstMatch) {
            firstMatch = false;
            return experienceHtml.trim();
          }
          return ''; // Supprimer les placeholders supplémentaires
        });
        // Nettoyer les lignes vides multiples
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
      } else {
        // Remplacer tous les experience-item par le nouveau contenu
        const itemPattern = /<div class="experience-item">.*?<\/div>/gs;
        let firstMatch = true;
        result = result.replace(itemPattern, () => {
          if (firstMatch) {
            firstMatch = false;
            return experienceHtml.trim();
          }
          return ''; // Supprimer les placeholders supplémentaires
        });
        // Nettoyer les lignes vides multiples
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
      }
    }

    return result;
  }

  /**
   * Génère le HTML d'une formation selon le format du template
   */
  generateEducationHTML(edu, format) {
    const dateRange = edu.current
      ? `${edu.startDate || ''} - En cours`
      : `${edu.startDate || ''} - ${edu.endDate || ''}`;

    if (format === 'format2') {
      // Format cv2: item avec date et content
      return `
        <div class="item">
          <div class="date">${this.escapeHtml(dateRange)}</div>
          <div class="content">
            <h4>${this.escapeHtml(edu.degree || '')}</h4>
            <p>${this.escapeHtml(edu.institution || '')}</p>
            ${edu.grade ? `<p style="color: #666; font-size: 12px;">${this.escapeHtml(edu.grade)}</p>` : ''}
          </div>
        </div>
      `;
    } else {
      // Format cv1: education-item
      return `
        <div class="education-item">
          <div class="date">${this.escapeHtml(dateRange)}</div>
          <div class="job-title">${this.escapeHtml(edu.degree || '')}</div>
          <div class="location">${this.escapeHtml(edu.institution || '')}</div>
          ${edu.grade ? `<div style="margin-top: 5px; color: #5a6c52;">${this.escapeHtml(edu.grade)}</div>` : ''}
        </div>
      `;
    }
  }

  /**
   * Remplace la section formation (générique pour tous les templates)
   */
  replaceEducationSection(template, education) {
    let result = template;

    if (!education || !Array.isArray(education) || education.length === 0) {
      return result;
    }

    // Détecter le format du template
    const format = this.detectTemplateFormat(template);

    // Générer le HTML pour toutes les formations
    let educationHtml = '';
    education.forEach(edu => {
      if (edu.visible !== false) {
        educationHtml += this.generateEducationHTML(edu, format);
      }
    });

    if (!educationHtml) {
      return result;
    }

    // Patterns de recherche pour différentes structures
    const sectionPatterns = [
      // Pattern 1: Section avec "Formation" (cv1)
      /(<div[^>]*class="[^"]*section[^"]*"[^>]*>\s*<div[^>]*class="[^"]*section-title[^"]*"[^>]*>Formation<\/div>\s*)(.*?)(\s*<\/div>\s*<\/div>\s*<\/div>)/is,
      // Pattern 2: Section avec "Formations" (cv2)
      /(<div[^>]*class="[^"]*section[^>]*>\s*<h2[^>]*>Formations<\/h2>\s*)(.*?)(\s*<\/div>\s*<div[^>]*class="[^"]*section)/is,
      // Pattern 3: Section avec h3 "Formations"
      /(<h3[^>]*>Formations<\/h3>\s*)(.*?)(\s*<div[^>]*class="[^"]*section|<h3)/is
    ];

    let replaced = false;
    for (const pattern of sectionPatterns) {
      if (pattern.test(result)) {
        result = result.replace(pattern, `$1${educationHtml.trim()}$3`);
        replaced = true;
        break;
      }
    }

    // Si aucune section trouvée, remplacer les items individuels
    if (!replaced) {
      if (format === 'format2') {
        // Remplacer tous les items de formation par le nouveau contenu
        const itemPattern = /<div class="item">\s*<div class="date">.*?<\/div>\s*<div class="content">.*?<\/div>\s*<\/div>/gs;
        let firstMatch = true;
        result = result.replace(itemPattern, () => {
          if (firstMatch) {
            firstMatch = false;
            return educationHtml.trim();
          }
          return ''; // Supprimer les placeholders supplémentaires
        });
        // Nettoyer les lignes vides multiples
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
      } else {
        // Remplacer tous les education-item par le nouveau contenu
        const itemPattern = /<div class="education-item">.*?<\/div>/gs;
        let firstMatch = true;
        result = result.replace(itemPattern, () => {
          if (firstMatch) {
            firstMatch = false;
            return educationHtml.trim();
          }
          return ''; // Supprimer les placeholders supplémentaires
        });
        // Nettoyer les lignes vides multiples
        result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
      }
    }

    return result;
  }

  /**
   * Remplace la section compétences (générique pour tous les templates)
   */
  replaceSkillsSection(template, skills) {
    let result = template;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return result;
    }

    // Générer le HTML pour toutes les compétences
    let skillsHtml = '';
    skills.forEach(skill => {
      if (skill.visible !== false) {
        skillsHtml += `<li>${this.escapeHtml(skill.name || '')}</li>\n`;
      }
    });

    if (!skillsHtml) {
      return result;
    }

    // Patterns de recherche pour différentes structures
    const sectionPatterns = [
      // Pattern 1: Section avec "Compétences" et <ul> (cv1)
      /(<div[^>]*class="[^"]*section[^"]*"[^>]*>\s*<div[^>]*class="[^"]*section-title[^"]*"[^>]*>Compétences<\/div>\s*<ul>)(.*?)(<\/ul>\s*<\/div>)/is,
      // Pattern 2: Section avec "Compétences" et <ul> (cv2)
      /(<h3[^>]*>Compétences<\/h3>\s*<ul>)(.*?)(<\/ul>)/is,
      // Pattern 3: Section avec h3 "Compétences"
      /(<h3[^>]*>Compétences<\/h3>\s*)(.*?)(\s*<h3|<div[^>]*class="[^"]*section)/is
    ];

    let replaced = false;
    for (const pattern of sectionPatterns) {
      if (pattern.test(result)) {
        result = result.replace(pattern, `$1${skillsHtml.trim()}$3`);
        replaced = true;
        break;
      }
    }

    // Si aucune section trouvée, remplacer les items individuels
    if (!replaced) {
      // Remplacer tous les placeholders de compétences par le nouveau contenu
      const skillPattern = /<li>Compétence \d+<\/li>/gi;
      let firstMatch = true;
      result = result.replace(skillPattern, () => {
        if (firstMatch) {
          firstMatch = false;
          return skillsHtml.trim();
        }
        return ''; // Supprimer les placeholders supplémentaires
      });
      // Nettoyer les lignes vides multiples
      result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    }

    return result;
  }

  /**
   * Remplace la section langues (si présente dans le template)
   */
  replaceLanguagesSection(template, languages) {
    let result = template;

    // Les langues ne sont pas dans le template cv1.html par défaut
    // Mais on peut les ajouter si nécessaire
    if (languages && Array.isArray(languages) && languages.length > 0) {
      let languagesHtml = '';
      languages.forEach(lang => {
        if (lang.visible !== false) {
          const level = lang.levelDescription || (lang.level ? `Niveau ${lang.level}%` : '');
          const levelText = level ? ` - ${this.escapeHtml(level)}` : '';
          languagesHtml += `<li>${this.escapeHtml(lang.name || '')}${levelText}</li>\n`;
        }
      });

      if (languagesHtml) {
        // Chercher une section langues existante ou l'ajouter après les compétences
        const languagesSectionRegex = /(<div class="section"[^>]*>\s*<div class="section-title">Langues<\/div>\s*<ul>)(.*?)(<\/ul>\s*<\/div>)/s;
        if (result.match(languagesSectionRegex)) {
          result = result.replace(
            languagesSectionRegex,
            `$1${languagesHtml.trim()}$3`
          );
        }
      }
    }

    return result;
  }

  /**
   * Remplace la section centres d'intérêt (générique pour tous les templates)
   */
  replaceInterestsSection(template, interests) {
    let result = template;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return result;
    }

    // Générer le HTML pour tous les centres d'intérêt
    let interestsHtml = '';
    interests.forEach(interest => {
      if (interest.visible !== false) {
        const icon = interest.icon ? `<i class="${interest.icon}"></i> ` : '';
        interestsHtml += `<li>${icon}${this.escapeHtml(interest.name || '')}</li>\n`;
      }
    });

    if (!interestsHtml) {
      return result;
    }

    // Patterns de recherche pour différentes structures
    const sectionPatterns = [
      // Pattern 1: Section avec "Centres d'Intérêt" (cv1)
      /(<div[^>]*class="[^"]*section[^"]*"[^>]*>\s*<div[^>]*class="[^"]*section-title[^"]*"[^>]*>Centres d'Intérêt<\/div>\s*<ul>)(.*?)(<\/ul>\s*<\/div>)/is,
      // Pattern 2: Section avec "Loisirs" (cv2)
      /(<h3[^>]*>Loisirs<\/h3>\s*<ul>)(.*?)(<\/ul>)/is,
      // Pattern 3: Section avec "Centres d'intérêt"
      /(<h3[^>]*>Centres d'intérêt<\/h3>\s*<ul>)(.*?)(<\/ul>)/is
    ];

    let replaced = false;
    for (const pattern of sectionPatterns) {
      if (pattern.test(result)) {
        result = result.replace(pattern, `$1${interestsHtml.trim()}$3`);
        replaced = true;
        break;
      }
    }

    // Si aucune section trouvée, remplacer les items individuels
    if (!replaced) {
      // Remplacer tous les placeholders de loisirs par le nouveau contenu
      const interestPattern = /<li>Loisir \d+<\/li>/gi;
      let firstMatch = true;
      result = result.replace(interestPattern, () => {
        if (firstMatch) {
          firstMatch = false;
          return interestsHtml.trim();
        }
        return ''; // Supprimer les placeholders supplémentaires
      });
      // Nettoyer les lignes vides multiples
      result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    }

    return result;
  }

  /**
   * Échappe les caractères spéciaux HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Échappe les caractères spéciaux pour les regex
   */
  escapeRegex(str) {
    // Échapper le $ et { séparément pour éviter les problèmes d'interprétation
    return str.replace(/[.*+?^${}()|[\]\\]/g, function (match) {
      if (match === '$') return '\\$';
      if (match === '{') return '\\{';
      if (match === '}') return '\\}';
      return '\\' + match;
    });
  }

  /**
   * Retourne l'icône FontAwesome correspondant au type de contact
   */
  getContactIcon(type) {
    const icons = {
      'email': 'fas fa-envelope',
      'phone': 'fas fa-phone',
      'address': 'fas fa-map-marker-alt',
      'website': 'fas fa-globe',
      'linkedin': 'fab fa-linkedin',
      'birthday': 'fas fa-birthday-cake',
      'marital': 'fas fa-heart',
      'nationality': 'fas fa-flag',
      'other': 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-info-circle';
  }

  /**
   * Génère le HTML final avec les données remplies
   */
  async generateHTML(templateId, cvData) {
    const template = await this.loadTemplate(templateId);
    const filledTemplate = this.fillTemplate(template, cvData);
    return filledTemplate;
  }
}

module.exports = new TemplateService();

