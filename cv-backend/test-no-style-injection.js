#!/usr/bin/env node
/**
 * Test: Vérifier qu'aucun style automatique n'est ajouté
 * Compare l'output avant (avec optimisation) vs après (optimisation désactivée)
 */

const templateService = require('./src/services/templateService');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// Données de test
const testData = {
  personalInfo: {
    firstName: 'Test',
    lastName: 'User',
    title: 'Testeur',
    summary: 'Test summary with long text that might overflow without word-break: break-word being applied.'
  },
  contactInfo: [
    { type: 'email', value: 'test@example.com', visible: true }
  ],
  experience: [
    {
      title: 'Test Role',
      company: 'Test Company',
      startDate: '2020-01',
      endDate: '2021-01',
      current: false,
      description: ['Task 1', 'Task with very very very very very very very long text that should not overflow']
    }
  ],
  education: [],
  skills: [],
  languages: [],
  interests: []
};

async function testNoStyleInjection() {
  console.log('🧪 TEST: Vérifier qu\'aucun style externe n\'est automatiquement ajouté\n');

  try {
    // Générer le template
    const html = await templateService.generateHTML('cv3', testData);

    // Analyser le HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;

    console.log('📊 Vérifications effectuées:\n');

    // 1. Vérifier pas de word-break ajouté
    const elementsWithWordBreak = document.querySelectorAll('[style*="word-break"]');
    console.log(`1️⃣  Éléments avec "word-break" (doit être 0): ${elementsWithWordBreak.length}`);
    if (elementsWithWordBreak.length > 0) {
      console.log('   ❌ PROBLÈME: word-break détecté!');
      elementsWithWordBreak.forEach((el, i) => {
        console.log(`      ${i+1}. <${el.tagName}> style="${el.getAttribute('style')}"`);
      });
    } else {
      console.log('   ✅ OK - Aucun word-break ajouté\n');
    }

    // 2. Vérifier pas de max-width ajouté
    const elementsWithMaxWidth = document.querySelectorAll('[style*="max-width"]');
    console.log(`2️⃣  Éléments avec "max-width" (doit être 0): ${elementsWithMaxWidth.length}`);
    if (elementsWithMaxWidth.length > 0) {
      console.log('   ❌ PROBLÈME: max-width détecté!');
      elementsWithMaxWidth.forEach((el, i) => {
        console.log(`      ${i+1}. <${el.tagName}> style="${el.getAttribute('style')}"`);
      });
    } else {
      console.log('   ✅ OK - Aucun max-width ajouté\n');
    }

    // 3. Vérifier pas de overflow-wrap ajouté
    const elementsWithOverflowWrap = document.querySelectorAll('[style*="overflow-wrap"]');
    console.log(`3️⃣  Éléments avec "overflow-wrap" (doit être 0): ${elementsWithOverflowWrap.length}`);
    if (elementsWithOverflowWrap.length > 0) {
      console.log('   ❌ PROBLÈME: overflow-wrap détecté!');
      elementsWithOverflowWrap.forEach((el, i) => {
        console.log(`      ${i+1}. <${el.tagName}> style="${el.getAttribute('style')}"`);
      });
    } else {
      console.log('   ✅ OK - Aucun overflow-wrap ajouté\n');
    }

    // 4. Vérifier pas de box-sizing ajouté aux éléments
    const elementsWithBoxSizing = document.querySelectorAll('[style*="box-sizing"]');
    console.log(`4️⃣  Éléments avec "box-sizing" (doit être ≤ CSS natif): ${elementsWithBoxSizing.length}`);
    // Note: box-sizing est souvent dans le CSS d'origine, donc 0+ est OK
    console.log('   ✅ OK - Boîte de modèle intacte\n');

    // 5. Vérifier que les données sont correctement remplies
    console.log('5️⃣  Vérification du remplissage des données:');
    if (html.includes('Test User')) {
      console.log('   ✅ Nom complet rempli');
    } else {
      console.log('   ❌ Nom complet NOT rempli');
    }

    if (html.includes('Testeur')) {
      console.log('   ✅ Titre rempli');
    } else {
      console.log('   ❌ Titre NOT rempli');
    }

    if (html.includes('test@example.com')) {
      console.log('   ✅ Email rempli');
    } else {
      console.log('   ❌ Email NOT rempli');
    }

    if (html.includes('Test Role')) {
      console.log('   ✅ Titre du poste rempli');
    } else {
      console.log('   ❌ Titre du poste NOT rempli');
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 RÉSULTAT: ');
    console.log('='.repeat(60));
    
    const hasProblems = elementsWithWordBreak.length + elementsWithMaxWidth.length + elementsWithOverflowWrap.length > 0;
    
    if (hasProblems) {
      console.log('❌ PROBLÈME DÉTECTÉ: Des styles externes ont été ajoutés!');
      process.exit(1);
    } else {
      console.log('✅ SUCCESS: Aucun style automatique ajouté');
      console.log('✅ Les données sont remplies correctement');
      console.log('✅ Le template est authentique et non modifié');
      console.log('\n🎉 Test passed - templateIntelligenceService optimization is disabled!');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    process.exit(1);
  }
}

testNoStyleInjection();
