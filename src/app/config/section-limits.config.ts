/**
 * Configuration des limites pour chaque section du CV
 * Ces limites garantissent un affichage cohérent et évitent les placeholders vides
 */
export interface SectionLimits {
  min: number;
  max: number;
  default: number; // Nombre par défaut lors de la création
}

export const SECTION_LIMITS: Record<string, SectionLimits> = {
  experience: {
    min: 0,
    max: 20, // Maximum raisonnable pour un CV
    default: 1
  },
  education: {
    min: 0,
    max: 15, // Maximum raisonnable pour les formations
    default: 1
  },
  skills: {
    min: 0,
    max: 50, // Les compétences peuvent être nombreuses
    default: 3
  },
  languages: {
    min: 0,
    max: 20, // Maximum raisonnable pour les langues
    default: 2
  },
  interests: {
    min: 0,
    max: 30, // Les centres d'intérêt peuvent être nombreux
    default: 3
  },
  contactInfo: {
    min: 1, // Au moins un contact est requis
    max: 15, // Maximum raisonnable pour les contacts
    default: 3
  }
};

/**
 * Vérifie si une section peut avoir plus d'éléments
 */
export function canAddItem(sectionType: string, currentCount: number): boolean {
  const limits = SECTION_LIMITS[sectionType];
  if (!limits) return true; // Pas de limite si non définie
  return currentCount < limits.max;
}

/**
 * Vérifie si une section peut avoir moins d'éléments
 */
export function canRemoveItem(sectionType: string, currentCount: number): boolean {
  const limits = SECTION_LIMITS[sectionType];
  if (!limits) return true; // Pas de limite si non définie
  return currentCount > limits.min;
}

/**
 * Retourne le nombre maximum d'éléments pour une section
 */
export function getMaxItems(sectionType: string): number {
  return SECTION_LIMITS[sectionType]?.max ?? Infinity;
}

/**
 * Retourne le nombre minimum d'éléments pour une section
 */
export function getMinItems(sectionType: string): number {
  return SECTION_LIMITS[sectionType]?.min ?? 0;
}

/**
 * Retourne le nombre par défaut d'éléments pour une section
 */
export function getDefaultItems(sectionType: string): number {
  return SECTION_LIMITS[sectionType]?.default ?? 1;
}







