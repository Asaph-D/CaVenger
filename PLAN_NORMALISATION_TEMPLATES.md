# 📐 PLAN DE NORMALISATION DES TEMPLATES

## Référence: Structure cv3.html et cv4.html

### Classes CSS Normalisées (utilisées par cv3):
```
.section           - Container pour chaque section majeure (Expérience, Formation, Compétences)
.section h3        - Titre de section
.item              - Container pour chaque entrée
.date              - Container pour la date
.content           - Container pour le contenu détaillé
.content h4        - Titre du poste/diplôme
.content span      - Sous-titre (entreprise, institution)
```

---

## Templates à Normaliser

### ✅ CV3.html - RÉFÉRENCE
**État**: Déjà construit selon la norme
**Action**: Aucune - c'est la référence

### ✅ CV4.html - RÉFÉRENCE PARTIELLE
**État**: Structure simple mais fonctionnelle
**Action**: A vérifier - compatible avec les données cv3/cv4

---

### ⚠️ CV1.html - À NORMALISER
**Structure actuelle**:
```html
.left-column (flex: 2)
.right-column (flex: 1)
.section
.section-title
.experience-item
```

**Changements requis**:
1. `.experience-item` → ajouter classe `.item` (keep `.experience-item`)
2. `.section-title` → ajouter classe `.section-title-1` (keep pour styles)
3. Restructurer pour que `.content` contienne h4 et description
4. Ajouter `.date` dans `.experience-item`

**Impact sur style**: Minimal - on ajoute des classes, on en supprime pas

---

### ⚠️ CV2.html - À NORMALISER
**Structure actuelle**:
```html
.left / .right (horizontal 2-colonnes)
.section (different meaning - title container)
.item
.date
.content
```

**Changements requis**:
1. La structure est presque bonne! // keep like it is
2. Ajouter `.experience-item` en classe secondaire sur `.item`
3. Vérifier que `.date` et `.content` existent bien
4. Assurer que la structure matches cv3: `.item > .date + .content`

**Impact sur style**: None - structure déjà compatible

---

### ⚠️ CV5.html - À NORMALISER
**Structure actuelle**:
```html
.left-column / .right-column
.block (left), .content-block (right)
.item with flex layout
.date (width: 120px fixed)
```

**Changements requis**:
1. Renommer `.block` → `.section` (left column)
2. Renommer `.content-block` → `.section` (right column)
3. Vérifier que `.item` > `.date` + `.content` fonctionne
4. Restructurer si nécessaire pour respecter la structure

**Impact sur style**: Modéré - CSS change, mais la forme reste

---

### ⚠️ CV6.html - À NORMALISER
**Structure actuelle**:
```html
.header / .content
.left / .right
.section
.section-title
.info (pour contact)
```

**Changements requis**:
1. Restructurer les sections pour utiliser `.item` framework
2. Ajouter `.date` et `.content` pour chaque expérience
3. Normaliser comment les données de cv3 remplissent ce template
4. Créer les patterns d'expérience avec `.item` wrapper

**Impact sur style**: Important - nécessite restructure HTML

---

### ⚠️ CV7.html - À NORMALISER
**État**: Inconnu, à inspecter

**Action**: Lire entièrement et analyser la structure

---

### ⚠️ CV8.html - À NORMALISER (ACTUELLEMENT OUVERT)
**Structure actuelle**:
```html
.cv / .header / .body
.header-content, .identity
.body > grid-template-columns (2 colonnes)
.right section
h3 = section title
```

**Changements requis**:
1. Ajouter classe `.section` aux sections d'expérience
2. Ajouter `.item` wrapper pour chaque expérience
3. Créer interne `.date` et `.content` structure
4. Normaliser les placeholders

**Impact sur style**: Modéré - restructure locale

---

### ⚠️ CV9.html - À NORMALISER
**État**: Inconnu, à inspecter

**Action**: Lire entièrement et analyser la structure

---

### ⚠️ CV10-CV15.html - À NORMALISER
**État**: À traiter en dernier

**Action**: Analyser et normaliser selon le même pattern

---

## ⚙️ Stratégie de Normalisation Progressive

### Phase 1: Templates Simples (CV2, CV4)
1. **CV2**: Déjà presque compatible
   - Vérifier que .item/.date/.content existent
   - Pas de changement majeur

2. **CV4**: Analyser
   - Vérifier la structure pour expérience/formation
   - Adapter si nécessaire

### Phase 2: Templates 2-colonnes (CV1, CV5, CV6)
1. **CV1**: Ajouter support pour les classes manquantes
2. **CV5**: Renommer .block → .section
3. **CV6**: Restructurer les patterns

### Phase 3: Templates Complexes (CV3, CV7, CV8, CV9)
1. **CV3**: Déjà OK (référence)
2. **CV7, CV8, CV9**: Analyser et normaliser

### Phase 4: Templates à déterminer (CV10-15)
1. Faire le même traitement que cv1-cv9

---

## 📋 Placeholders à Normaliser

### Données personnelles
- Nom complet: utiliser `.firstName` + `.lastName` → `Prénom Nom`
- Titre: `.title` → "Développeur Full Stack Senior"
- Résumé: `.summary` → "Description professionnelle..."

### Contact
- Email: `.email` → "jean.dupont@example.com"
- Téléphone: `.phone` → "+33 6 12 34 56 78"
- Adresse: `.address` → "Paris, France"
- LinkedIn: `.linkedin` → "https://..."
- Site: `.website` → "https://..."

### Expérience
- Titre: `.experience[].title`
- Entreprise: `.experience[].company`
- Date début: `.experience[].startDate` (format: "2020-01")
- Date fin: `.experience[].endDate` ou "Présent" si `.current === true`
- Description: `.experience[].description` (array de bullets)

### Formation
- Diplôme: `.education[].degree`
- Institution: `.education[].institution`
- Dates: `.education[].startDate` - `.education[].endDate`
- Description: `.education[].description`

### Compétences
- Nom: `.skills[].name`
- Niveau: `.skills[].level` (0-100)

### Langues
- Nom: `.languages[].name`
- Niveau: `.languages[].levelDescription`

### Intérêts
- Nom: `.interests[].name`

---

## ✅ Checklist de Validation

Pour chaque template normalisé:
- [ ] La structure HTML respecte le pattern `.section > .item > .date + .content`
- [ ] Les classes CSS critiques existent: `.section`, `.item`, `.date`, `.content`
- [ ] Les données de cv3.json/cv4.json se remplissent correctement
- [ ] Aucun style externe n'est ajouté (templateIntelligenceService désactivé)
- [ ] Le PDF généré ressemble à l'original (mise en page préservée)
- [ ] Les placeholder sont tous remplacés par les bonnes données

---

## 📊 Matrice d'Effort

| Template | Effort | Complexité | Priorité |
|----------|--------|-----------|----------|
| cv1      | Faible | Moyenne   | Haute    |
| cv2      | Très Faible | Basse | Haute |
| cv3      | Aucun  | -         | ✅ Ref |
| cv4      | Faible | Basse     | Haute |
| cv5      | Moyen  | Moyenne   | Haute |
| cv6      | Moyen  | Moyenne   | Haute |
| cv7      | ? | ? | Moyenne |
| cv8      | Moyen  | Moyenne   | Moyenne |
| cv9      | ? | ? | Moyenne |
| cv10-15  | Élevé  | Variée    | Basse |

---

## 🎯 Résultat Attendu

Après normalisation complète:
1. ✅ Tous les templates utilisent les mêmes classes CSS structurelles
2. ✅ Les données de cv3.json/cv4.json remplissent TOUS les templates
3. ✅ Pas de style automatique ajouté par templateIntelligenceService
4. ✅ La mise en page de chaque template est préservée authentique
5. ✅ Les debug-outputs sont propres et prévisibles

---

**Prochaine étape**: Commencer par CV2 (plus simple)
