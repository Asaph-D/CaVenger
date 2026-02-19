const templateService = require('./src/services/templateService');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Génère des données de test complètes pour le CV
 */
function generateTestData() {
  return {
    personalInfo: {
      firstName: 'Jean',
      lastName: 'Dupont',
      title: 'Développeur Full Stack Senior',
      summary: 'Développeur expérimenté avec plus de 8 ans d\'expérience dans le développement web. Spécialisé en JavaScript, TypeScript, Angular et Node.js. Passionné par les technologies modernes et les architectures scalables.',
      profileType: 'initials',
      initials: 'JD'
    },
    contactInfo: [
      {
        id: '1',
        type: 'email',
        label: 'Email',
        value: 'jean.dupont@example.com',
        icon: 'fas fa-envelope',
        visible: true
      },
      {
        id: '2',
        type: 'phone',
        label: 'Téléphone',
        value: '+33 6 12 34 56 78',
        icon: 'fas fa-phone',
        visible: true
      },
      {
        id: '3',
        type: 'address',
        label: 'Adresse',
        value: 'Paris, France',
        icon: 'fas fa-map-marker-alt',
        visible: true
      },
      {
        id: '4',
        type: 'linkedin',
        label: 'LinkedIn',
        value: 'https://linkedin.com/in/jean-dupont',
        icon: 'fab fa-linkedin',
        visible: true
      },
      {
        id: '5',
        type: 'website',
        label: 'Site Web',
        value: 'https://jeandupont.dev',
        icon: 'fas fa-globe',
        visible: true
      }
    ],
    experience: [
      {
        id: '1',
        title: 'Développeur Full Stack Senior',
        company: 'TechCorp Solutions',
        location: 'Paris, France',
        startDate: '2020-01',
        endDate: null,
        current: true,
        descriptionText: '• Développement d\'applications web complexes avec Angular et Node.js\n• Architecture et mise en place de microservices\n• Encadrement d\'une équipe de 5 développeurs\n• Optimisation des performances (réduction de 40% du temps de chargement)',
        description: [
          'Développement d\'applications web complexes avec Angular et Node.js',
          'Architecture et mise en place de microservices',
          'Encadrement d\'une équipe de 5 développeurs',
          'Optimisation des performances (réduction de 40% du temps de chargement)'
        ]
      },
      {
        id: '2',
        title: 'Développeur Frontend',
        company: 'WebAgency',
        location: 'Lyon, France',
        startDate: '2017-06',
        endDate: '2019-12',
        current: false,
        descriptionText: '• Développement d\'interfaces utilisateur avec React et Vue.js\n• Collaboration avec les designers pour créer des expériences utilisateur optimales\n• Refactoring de code legacy vers des technologies modernes',
        description: [
          'Développement d\'interfaces utilisateur avec React et Vue.js',
          'Collaboration avec les designers pour créer des expériences utilisateur optimales',
          'Refactoring de code legacy vers des technologies modernes'
        ]
      },
      {
        id: '3',
        title: 'Développeur Junior',
        company: 'StartupTech',
        location: 'Toulouse, France',
        startDate: '2015-09',
        endDate: '2017-05',
        current: false,
        descriptionText: '• Développement de fonctionnalités avec JavaScript et PHP\n• Maintenance et correction de bugs\n• Participation aux réunions d\'équipe et aux sprints Agile',
        description: [
          'Développement de fonctionnalités avec JavaScript et PHP',
          'Maintenance et correction de bugs',
          'Participation aux réunions d\'équipe et aux sprints Agile'
        ]
      }
    ],
    education: [
      {
        id: '1',
        degree: 'Master en Informatique',
        institution: 'Université Paris-Saclay',
        location: 'Paris, France',
        startDate: '2013-09',
        endDate: '2015-06',
        current: false,
        description: 'Spécialisation en développement web et architectures distribuées'
      },
      {
        id: '2',
        degree: 'Licence en Informatique',
        institution: 'Université Paris-Saclay',
        location: 'Paris, France',
        startDate: '2010-09',
        endDate: '2013-06',
        current: false,
        description: 'Fondamentaux de l\'informatique et programmation orientée objet'
      }
    ],
    skills: [
      { id: '1', name: 'JavaScript', level: 95 },
      { id: '2', name: 'TypeScript', level: 90 },
      { id: '3', name: 'Angular', level: 88 },
      { id: '4', name: 'React', level: 85 },
      { id: '5', name: 'Node.js', level: 92 },
      { id: '6', name: 'Express', level: 88 },
      { id: '7', name: 'PostgreSQL', level: 80 },
      { id: '8', name: 'MongoDB', level: 75 },
      { id: '9', name: 'Docker', level: 82 },
      { id: '10', name: 'AWS', level: 78 }
    ],
    languages: [
      { id: '1', name: 'Français', levelDescription: 'Natif' },
      { id: '2', name: 'Anglais', levelDescription: 'Avancé (C1)' },
      { id: '3', name: 'Espagnol', levelDescription: 'Intermédiaire (B2)' }
    ],
    interests: [
      { id: '1', name: 'Développement Open Source' },
      { id: '2', name: 'Photographie' },
      { id: '3', name: 'Voyages' },
      { id: '4', name: 'Lecture technique' }
    ]
  };
}

/**
 * Ouvre un fichier dans le navigateur par défaut
 */
async function openInBrowser(filePath) {
  const platform = process.platform;
  let command;

  if (platform === 'win32') {
    command = `start "" "${filePath}"`;
  } else if (platform === 'darwin') {
    command = `open "${filePath}"`;
  } else {
    command = `xdg-open "${filePath}"`;
  }

  try {
    await execAsync(command);
    console.log(`✅ Fichier ouvert dans le navigateur: ${filePath}`);
  } catch (error) {
    console.warn(`⚠️  Impossible d'ouvrir automatiquement le fichier. Ouvrez-le manuellement: ${filePath}`);
  }
}

/**
 * Script principal de debug
 */
async function debugTemplate() {
  try {
    // Récupérer le template ID depuis les arguments de ligne de commande
    const templateId = process.argv[2] || 'cv1';
    const outputDir = path.join(__dirname, 'debug-output');
    
    console.log(`\n🔍 Debug du template: ${templateId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Créer le dossier de sortie s'il n'existe pas
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
      // Le dossier existe déjà, c'est OK
    }

    // Générer les données de test
    console.log('📝 Génération des données de test...');
    const testData = generateTestData();
    console.log('✅ Données de test générées\n');

    // Générer le HTML
    console.log(`🎨 Génération du HTML pour le template ${templateId}...`);
    const htmlContent = await templateService.generateHTML(templateId, testData);
    console.log('✅ HTML généré avec succès\n');

    // Sauvegarder le HTML
    const outputPath = path.join(outputDir, `debug-${templateId}-${Date.now()}.html`);
    await fs.writeFile(outputPath, htmlContent, 'utf-8');
    console.log(`💾 HTML sauvegardé: ${outputPath}\n`);

    // Sauvegarder aussi les données JSON pour référence
    const dataPath = path.join(outputDir, `debug-data-${templateId}.json`);
    await fs.writeFile(dataPath, JSON.stringify(testData, null, 2), 'utf-8');
    console.log(`💾 Données JSON sauvegardées: ${dataPath}\n`);

    // Ouvrir dans le navigateur
    console.log('🌐 Ouverture dans le navigateur...');
    await openInBrowser(outputPath);

    console.log('\n✨ Debug terminé avec succès!');
    console.log(`\n📁 Fichiers générés:`);
    console.log(`   - HTML: ${outputPath}`);
    console.log(`   - JSON: ${dataPath}\n`);

  } catch (error) {
    console.error('\n❌ Erreur lors du debug:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Fonction pour lister tous les templates disponibles
async function listTemplates() {
  try {
    const templatesDir = path.join(__dirname, 'src/templates');
    const files = await fs.readdir(templatesDir);
    const templates = files
      .filter(file => file.endsWith('.html') && file.startsWith('cv'))
      .map(file => file.replace('.html', ''))
      .sort((a, b) => {
        const numA = parseInt(a.replace('cv', ''));
        const numB = parseInt(b.replace('cv', ''));
        return numA - numB;
      });

    console.log('\n📋 Templates disponibles:');
    templates.forEach(template => {
      console.log(`   - ${template}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Erreur lors de la liste des templates:', error);
  }
}

// Point d'entrée
if (process.argv[2] === '--list' || process.argv[2] === '-l') {
  listTemplates();
} else {
  debugTemplate();
}




