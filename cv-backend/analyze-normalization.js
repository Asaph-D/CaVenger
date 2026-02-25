#!/usr/bin/env node
/**
 * Script d'analyse des templates vs données de cv3/cv4
 * Propose une normalisation minimale et sûre
 */

const fs = require('fs');
const path = require('path');

const cv3Data = require('./debug-output/debug-data-cv3.json');
const cv4Data = require('./debug-output/debug-data-cv4.json');

console.log('🔍 ANALYSE DE NORMALISATION - TEMPLATES vs DONNÉES\n');

// Données de référence
const referenceData = cv3Data;
console.log('📊 Structure de référence (cv3): ');
console.log(`  - Nom: ${referenceData.personalInfo.firstName} ${referenceData.personalInfo.lastName}`);
console.log(`  - Titre: ${referenceData.personalInfo.title}`);
console.log(`  - Expériences: ${referenceData.experience.length}`);
console.log(`  - Formations: ${referenceData.education.length}`);
console.log(`  - Compétences: ${referenceData.skills.length}`);
console.log(`  - Langues: ${referenceData.languages.length}`);
console.log(`  - Intérêts: ${referenceData.interests.length}`);
console.log('');

// Structure des données
console.log('📋 PLACEHOLDERS À UTILISER:\n');

console.log('1. DONNÉES PERSONNELLES:');
console.log(`   {{fullName}} → ${referenceData.personalInfo.firstName} ${referenceData.personalInfo.lastName}`);
console.log(`   {{firstName}} → ${referenceData.personalInfo.firstName}`);
console.log(`   {{lastName}} → ${referenceData.personalInfo.lastName}`);
console.log(`   {{title}} → ${referenceData.personalInfo.title}`);
console.log(`   {{summary}} → ${referenceData.personalInfo.summary.substring(0, 50)}...`);
console.log('');

console.log('2. CONTACT:');
referenceData.contactInfo.forEach(contact => {
  if (contact.visible) {
    console.log(`   {{${contact.type}}} → ${contact.value}`);
  }
});
console.log('');

console.log('3. EXPÉRIENCES:');
console.log('   Structure: ');
console.log(`     - title → "${referenceData.experience[0].title}"`);
console.log(`     - company → "${referenceData.experience[0].company}"`);
console.log(`     - startDate → "${referenceData.experience[0].startDate}"`);
console.log(`     - endDate → ${referenceData.experience[0].endDate || 'null (current: true)'}`);
console.log(`     - current → ${referenceData.experience[0].current}`);
console.log(`     - description[] → [${referenceData.experience[0].description.length} items]`);
console.log('');

console.log('4. FORMATIONS:');
console.log('   Structure: ');
console.log(`     - degree → "${referenceData.education[0].degree}"`);
console.log(`     - institution → "${referenceData.education[0].institution}"`);
console.log(`     - startDate → "${referenceData.education[0].startDate}"`);
console.log(`     - endDate → "${referenceData.education[0].endDate}"`);
console.log(`     - description → "${referenceData.education[0].description}"`);
console.log('');

console.log('5. COMPÉTENCES:');
console.log('   Structure: ');
console.log(`     - name → "${referenceData.skills[0].name}"`);
console.log(`     - level → ${referenceData.skills[0].level}`);
console.log('');

console.log('6. LANGUES:');
console.log('   Structure: ');
console.log(`     - name → "${referenceData.languages[0].name}"`);
console.log(`     - levelDescription → "${referenceData.languages[0].levelDescription}"`);
console.log('');

console.log('7. INTÉRÊTS:');
console.log('   Structure: ');
console.log(`     - name → "${referenceData.interests[0].name}"`);
console.log('');

console.log('\n✅ TOUS LES TEMPLATES DOIVENT UTILISER CES PLACEHOLDERS');
console.log('   Cela permet que les données de cv3/cv4 remplissent tous les templates\n');
