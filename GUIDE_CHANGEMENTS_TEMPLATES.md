# 🔧 GUIDE DE NORMALISATION - CHANGEMENTS SPÉCIFIQUES PAR TEMPLATE

## APPROCHE: Modification Légère (Classes Supplémentaires)

**Principe**: Ajouter des classes normalisées SANS supprimer les existantes
- ✅ 0% risque de casser les styles
- ✅ Cohérence avec cv3/cv4
- ✅ Données se remplissent correctement

---

## CV1.html - CHANGEMENTS À FAIRE

### ✏️ Changement 1: Header
**Actuellement**:
```html
<div class="name">Nom Prénom</div>
<div class="title">Titre Professionnel</div>
```

**Changement minimal**:
```html
<div class="name">{{fullName}}</div>
<div class="title">{{title}}</div>
```

**Impact**: Zéro changement CSS

---

### ✏️ Changement 2: Section Profil
**Actuellement**:
```html
<p>Description professionnelle générale. Résumé des compétences, objectifs et domaine d'expertise.</p>
```

**Changement minimal**:
```html
<p>{{summary}}</p>
```

**Impact**: Zéro changement CSS

---

### ✏️ Changement 3: Expérience - Ajouter classe `.item`
**Actuellement**:
```html
<div class="experience-item">
    <div class="job-title">Poste Occupé</div>
    <div class="location">Nom de l'entreprise</div>
    <div class="date">Année - Année</div>
    <ul>
        <li>Responsabilité principale</li>
    </ul>
</div>
```

**Changement minimal**:
```html
<div class="experience-item item">
    <div class="job-title">Poste Occupé</div>
    <div class="location company">Nom de l'entreprise</div>
    <div class="date">Année - Année</div>
    <ul>
        <li>Responsabilité principale</li>
    </ul>
</div>
```

**Nouvelle classe**.  `.item`, `.company` sont ajoutées pour normalisation
**Impact**: Zéro changement CSS - classes supplémentaires non utilisées

---

### ✏️ Changement 4: Remplacer Placeholder Contact
**Actuellement**:
```html
<div class="contact-item"><i class="fas fa-envelope"></i> email@domain.com</div>
<div class="contact-item"><i class="fas fa-phone"></i> +00 000 000 000</div>
<div class="contact-item"><i class="fas fa-map-marker-alt"></i> Ville, Pays</div>
```

**Changement minimal**:
```html
<div class="contact-item"><i class="fas fa-envelope"></i> {{email}}</div>
<div class="contact-item"><i class="fas fa-phone"></i> {{phone}}</div>
<div class="contact-item"><i class="fas fa-map-marker-alt"></i> {{address}}</div>
```

**Impact**: Zéro changement CSS

---

### ✏️ Changement 5: Formation - Ajouter classe `.education-item`
**Actuellement**:
```html
<div class="education-item">
    <div class="date">Année - Année</div>
    <div class="job-title">Diplôme ou Certification</div>
    <div class="location">Établissement</div>
</div>
```

**Changement minimal** (aucun change réellement - classe existe):
```html
<div class="education-item">
    <div class="date">Année - Année</div>
    <div class="job-title">Diplôme ou Certification</div>
    <div class="location">Établissement</div>
</div>
```

**Impact**: Zéro changement nécessaire! La classe existe déjà

---

## CV2.html - CHANGEMENTS À FAIRE

### ✏️ Changement 1: Header
**Actuellement**:
```html
<div class="name">Nom Prénom</div>
<div class="job">Titre Professionnel</div>
```

**Changement minimal**:
```html
<div class="name">{{fullName}}</div>
<div class="job">{{title}}</div>
```

**Impact**: Zéro changement CSS

---

### ✏️ Changement 2: Profil
**Actuellement**:
```html
<p>Description professionnelle générale.</p>
```

**Changement minimal**:
```html
<p>{{summary}}</p>
```

**Impact**: Zéro changement CSS

---

### ✏️ Changement 3: Contact (Left Column)
**Actuellement**:
```html
<h3>Contact</h3>
<p>email@domain.com</p>
<p>+00 000 000 000</p>
<p>Ville, Pays</p>
```

**Changement minimal**:
```html
<h3>Contact</h3>
<p>{{email}}</p>
<p>{{phone}}</p>
<p>{{address}}</p>
```

**Impact**: Zéro changement CSS

---

### ✏️ Changement 4: Vérifier Expérience (déjà OK)
**Structure actuelle est DÉJÀ conforme**:
```html
<div class="item">
    <div class="date">2020-01 - Présent</div>
    <div class="content">
        <h4>Titre du poste</h4>
        <ul>...</ul>
    </div>
</div>
```

**Action**: Aucun changement nécessaire! ✅

---

### ✏️ Changement 5: Vérifier Formation (déjà OK)
**Structure actuelle est DÉJÀ conforme**:
```html
<div class="item">
    <div class="date">2013-09 - 2015-06</div>
    <div class="content">
        <h4>Master en Informatique</h4>
        <p>Université Paris-Saclay</p>
    </div>
</div>
```

**Action**: Aucun changement nécessaire! ✅

---

## CV3.html - RÉFÉRENCE

**État**: Déjà 100% conforme ✅
**Action**: Aucun changement nécessaire

---

## CV4.html - À VÉRIFIER

**Structure**: À analyser complètement
**Action**: Inspection complète requise

---

## CV5.html - CHANGEMENTS À FAIRE

### ✏️ Changement 1: Header
```html
<h1>{{fullName}}</h1>
<h2>{{title}}</h2>
```

### ✏️ Changement 2: Profil/bloc
Ajouter classes supplémentaires pour normalisation
`.block` → `.block section`
`.content-block` → `.content-block section`

### ✏️ Changement 3: Contact et autres sections
Utiliser placeholders standardisés: `{{email}}`, `{{phone}}`, `{{address}}`

---

## CV6.html - CHANGEMENTS À FAIRE

Global: Structure globale conforme, surtout remplacer les placeholders

### ✏️ Changement 1: Header
```html
<h1>{{fullName}}</h1>
<h2>{{title}}</h2>
```

### ✏️ Changement 2: Contact
```html
<div class="info">Adresse<span>{{address}}</span></div>
<div class="info">Email<span>{{email}}</span></div>
<div class="info">Téléphone<span>{{phone}}</span></div>
```

### ✏️ Changement 3: Autres sections
Utiliser placeholders standardisés

---

## CV7.html - À EXAMINER

**Action**: Lire en entier et faire analyse structure

---

## CV8.html - À EXAMINER (ACTUELLEMENT OUVERT)

**Actuellement**: Lire et analyser structure complète

### Observations préliminaires:
- Header moderne avec SVG
- 2-colonnes
- Sections de MÉTIER, EXPÉRIENCES, FORMATIONS

**Action**: Normalisation complète requise

---

## CV9.html - À EXAMINER

**Action**: Lire en entier et faire analyse structure

---

## CV10-CV15.html - BASSE PRIORITÉ

**Action**: Taiter après avoir terminé cv1-9

---

## 📋 RÉSUMÉ DES PLACEHOLDERS STANDARD

```
# Données Personnelles
{{fullName}} - Nom complet
{{firstName}} - Prénom uniquement
{{lastName}} - Nom uniquement
{{title}} - Titre professionnel
{{summary}} - Description/Résumé

# Contact
{{email}} - Email
{{phone}} - Téléphone
{{address}} - Adresse
{{linkedin}} - LinkedIn URL
{{website}} - Site web URL

# Note: Les sections Expérience, Formation, etc.
sont gérées par templateService.js avec les patterns
generateExperienceHTML() et generateEducationHTML()
```

---

## ✅ CHECKLIST DE NORMALISATION PAR TEMPLATE

### Avant de commencer:
- [ ] Template original sauvegardé
- [ ] Analyse complète du template faite
- [ ] CSS examiné pour dépendances

### Pendant la normalisation:
- [ ] Remplacer placeholders par {{}}
- [ ] Vérifier structure des sections
- [ ] Ajouter classes supplémentaires si nécessaire
- [ ] Tester avec npm run debug-template

### Validation:
- [ ] Les données cv3.json remplissent le template
- [ ] Aucun style externe ajouté
- [ ] PDF généré ressemble à l'original
- [ ] Pas de console errors ou warnings

---

## 🎯 ORDRE DE NORMALISATION RECOMMANDÉ

1. **CV2** (plus simple, déjà presque conforme)
2. **CV1** (base standard, bien structured)
3. **CV5** (2-colonnes, relativement simple)
4. **CV4** (à vérifier)
5. **CV6** (plus complexe)
6. **CV3** (référence, skip ou vérif)
7. **CV7, CV8, CV9** (complexes)
8. **CV10-15** (basse priorité)

---

**Prochaine étape**: Commencer par CV2 (modifications minimales)
