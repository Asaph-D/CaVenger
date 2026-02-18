import { Injectable, signal } from '@angular/core';
import { CVTemplate } from './cv-api.service';

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionFeatures {
  canCustomizeStyles: boolean;
  canUseAllTemplates: boolean;
  canExportPDF: boolean;
  canUseAdvancedEditor: boolean;
  canInteractWithPreview: boolean;
  canChangeLayout: boolean;
  canAddCustomSections: boolean;
  canUseAllIcons: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  // Par défaut, tous les utilisateurs sont en version gratuite
  private subscriptionTier = signal<SubscriptionTier>('free');
  
  // Templates gratuits (correspondent aux images cv1.png à cv13.png)
  private readonly freeTemplates = ['cv1', 'cv2', 'cv3', 'cv4', 'cv5', 'cv6', 'cv7', 'cv8', 'cv9', 'cv10', 'cv11', 'cv12', 'cv13'];

  /**
   * Récupère le niveau d'abonnement actuel
   */
  getSubscriptionTier(): SubscriptionTier {
    return this.subscriptionTier();
  }

  /**
   * Définit le niveau d'abonnement
   */
  setSubscriptionTier(tier: SubscriptionTier): void {
    this.subscriptionTier.set(tier);
    // Sauvegarder dans localStorage
    localStorage.setItem('subscriptionTier', tier);
  }

  /**
   * Initialise le service depuis localStorage
   */
  initialize(): void {
    const savedTier = localStorage.getItem('subscriptionTier') as SubscriptionTier;
    if (savedTier && (savedTier === 'free' || savedTier === 'premium')) {
      this.subscriptionTier.set(savedTier);
    }
  }

  /**
   * Vérifie si l'utilisateur a un abonnement premium
   */
  isPremium(): boolean {
    return this.subscriptionTier() === 'premium';
  }

  /**
   * Vérifie si un template est gratuit
   */
  isTemplateFree(templateId: string): boolean {
    return this.freeTemplates.includes(templateId.toLowerCase());
  }

  /**
   * Récupère les fonctionnalités disponibles selon l'abonnement
   */
  getAvailableFeatures(): SubscriptionFeatures {
    const isPremium = this.isPremium();
    
    return {
      canCustomizeStyles: isPremium,
      canUseAllTemplates: isPremium,
      canExportPDF: isPremium,
      canUseAdvancedEditor: isPremium,
      canInteractWithPreview: isPremium,
      canChangeLayout: isPremium,
      canAddCustomSections: isPremium,
      canUseAllIcons: isPremium
    };
  }

  /**
   * Vérifie si une fonctionnalité spécifique est disponible
   */
  hasFeature(feature: keyof SubscriptionFeatures): boolean {
    const features = this.getAvailableFeatures();
    return features[feature];
  }

  /**
   * Simule un paiement (pour le développement, sera remplacé par l'API)
   */
  async processPayment(paymentData: any): Promise<{ success: boolean; message: string }> {
    // TODO: Intégrer avec l'API de paiement
    // Pour l'instant, simulation d'un paiement réussi
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setSubscriptionTier('premium');
        resolve({
          success: true,
          message: 'Paiement réussi ! Votre abonnement premium est maintenant actif.'
        });
      }, 2000);
    });
  }

  /**
   * Récupère le chemin de l'image d'un template
   */
  getTemplateImagePath(templateId: string): string {
    // Normaliser l'ID du template pour correspondre aux fichiers (cv1.png, cv2.png, etc.)
    const normalizedId = templateId.toLowerCase();
    // En Angular, les assets sont servis depuis la racine sans le slash initial
    return `assets/templates/${normalizedId}.png`;
  }

  /**
   * Récupère la liste statique des templates disponibles (fallback si le backend n'est pas disponible)
   */
  getStaticTemplates(): CVTemplate[] {
    return [
      { id: 'cv1', name: 'Template Moderne', description: 'Design moderne et professionnel avec mise en page équilibrée', layout: 'two-column' },
      { id: 'cv2', name: 'Template Classique', description: 'Style classique et élégant pour tous les secteurs', layout: 'two-column' },
      { id: 'cv3', name: 'Template Minimaliste', description: 'Design épuré mettant l\'accent sur le contenu', layout: 'one-column' },
      { id: 'cv4', name: 'Template Créatif', description: 'Mise en page créative pour les métiers artistiques', layout: 'two-column' },
      { id: 'cv5', name: 'Template Professionnel', description: 'Format professionnel adapté au secteur corporate', layout: 'two-column' },
      { id: 'cv6', name: 'Template Élégant', description: 'Design raffiné avec une typographie soignée', layout: 'two-column' },
      { id: 'cv7', name: 'Template Moderne 2', description: 'Variante moderne avec accent sur les compétences', layout: 'two-column' },
      { id: 'cv8', name: 'Template Compact', description: 'Format compact optimisé pour une page', layout: 'one-column' },
      { id: 'cv9', name: 'Template Coloré', description: 'Design avec touches de couleur pour se démarquer', layout: 'two-column' },
      { id: 'cv10', name: 'Template Tech', description: 'Spécialement conçu pour les métiers de la tech', layout: 'two-column' },
      { id: 'cv11', name: 'Template Executive', description: 'Format haut de gamme pour postes de direction', layout: 'two-column' },
      { id: 'cv12', name: 'Template Starter', description: 'Parfait pour les jeunes diplômés et débutants', layout: 'one-column' },
      { id: 'cv13', name: 'Template Premium', description: 'Design premium avec mise en page sophistiquée', layout: 'two-column' }
    ];
  }
}

