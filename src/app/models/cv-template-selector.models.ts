/**
 * Modèles et constantes pour le sélecteur de templates de CV
 */

export interface CVTemplateSelector {
  id: string;
  name: string;
  description: string;
  layout: string;
}

/**
 * Liste des templates disponibles dans le sélecteur
 */
export const CV_TEMPLATE_SELECTOR_TEMPLATES: CVTemplateSelector[] = [
  // Catégorie 1: Designs classiques
  { id: 'cv-classic', name: 'Classique', description: 'Une colonne', layout: 'single-column' },
  { id: 'cv-modern', name: 'Moderne', description: 'Sidebar', layout: 'sidebar' },
  { id: 'cv-two-col', name: 'Deux Colonnes', description: 'Équilibré', layout: 'two-column' },
  { id: 'cv-timeline', name: 'Timeline', description: 'Chrono', layout: 'timeline' },
  // Catégorie 2: Designs épurés
  { id: 'cv-arch', name: 'Arche', description: 'Arc', layout: 'arch' },
  { id: 'cv-diagonal', name: 'Diagonal', description: 'Biais', layout: 'diagonal' },
  { id: 'cv-circle', name: 'Cercle', description: 'Rond', layout: 'circle' },
  { id: 'cv-geometric', name: 'Géométrique', description: 'Formes', layout: 'geometric' },
  { id: 'cv-asymmetric', name: 'Asymétrique', description: 'Décalé', layout: 'asymmetric' }
];

