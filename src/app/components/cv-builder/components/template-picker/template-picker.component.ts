import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { CvApiService, CVTemplate } from '../../../../services/cv-api.service';
import { SubscriptionService } from '../../../../services/subscription.service';

@Component({
  selector: 'app-template-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <i class="fas fa-file-alt mr-2 text-blue-600"></i>
        Choisir un modèle
      </h3>
      
      <div *ngIf="isLoading()" class="text-center py-8">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
        <p class="text-sm text-gray-500">Chargement des modèles...</p>
      </div>

      <div *ngIf="error()" class="text-center py-8 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
        <i class="fas fa-exclamation-circle text-2xl text-red-500 mb-2"></i>
        <p class="text-sm text-red-700 dark:text-red-400 font-medium mb-2">Erreur de connexion</p>
        <p class="text-xs text-red-600 dark:text-red-500">{{ error() }}</p>
        <button (click)="loadTemplates()" class="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
          Réessayer
        </button>
      </div>

      <div *ngIf="!isLoading() && !error() && templates().length === 0" class="text-center py-8">
        <i class="fas fa-exclamation-triangle text-2xl text-amber-400 mb-2"></i>
        <p class="text-sm text-gray-500">Aucun modèle disponible</p>
        <p class="text-xs text-gray-400 mt-2">Vérifiez que le backend est démarré sur http://localhost:3000</p>
      </div>

      <div *ngIf="!isLoading() && templates().length > 0" class="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
        <button
          *ngFor="let template of templates()"
          (click)="selectTemplate(template)"
          [class]="getTemplateCardClasses(template)"
          class="group relative p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-lg"
        >
          <div class="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded mb-2 flex items-center justify-center overflow-hidden relative">
            <img 
              [src]="getTemplateImagePath(template.id)" 
              [alt]="template.name"
              class="w-full h-full object-cover"
              (error)="onImageError($event)"
            />
            <div *ngIf="isTemplateFree(template.id)" class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
              GRATUIT
            </div>
            <div *ngIf="!isTemplateFree(template.id) && !subscriptionService.isPremium()" class="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div class="text-center text-white">
                <i class="fas fa-lock text-2xl mb-2"></i>
                <p class="text-xs font-semibold">PREMIUM</p>
              </div>
            </div>
          </div>
          
          <div class="text-left">
            <h4 class="font-medium text-sm text-gray-900 dark:text-white mb-1 truncate">
              {{ template.name }}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {{ template.description }}
            </p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {{ template.layout | uppercase }}
              </span>
              <i *ngIf="selectedTemplate()?.id === template.id" 
                 class="fas fa-check-circle text-green-500"></i>
            </div>
          </div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class TemplatePickerComponent implements OnInit {
  private cvApiService = inject(CvApiService);
  protected subscriptionService = inject(SubscriptionService);
  
  @Output() templateSelected = new EventEmitter<CVTemplate>();

  templates = signal<CVTemplate[]>([]);
  selectedTemplate = signal<CVTemplate | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.cvApiService.getTemplates().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          this.templates.set(response.data);
          console.log('✅ Templates chargés depuis le backend:', response.data.length);
        } else {
          // Fallback: utiliser les templates statiques
          console.warn('⚠️ Backend ne retourne pas de templates, utilisation des templates statiques');
          this.templates.set(this.subscriptionService.getStaticTemplates());
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du chargement des templates depuis le backend, utilisation des templates statiques:', error);
        // Fallback: utiliser les templates statiques même en cas d'erreur
        this.templates.set(this.subscriptionService.getStaticTemplates());
        this.error.set(null); // Ne pas afficher d'erreur, on utilise le fallback
        this.isLoading.set(false);
      }
    });
  }

  selectTemplate(template: CVTemplate): void {
    // Vérifier si le template est accessible
    if (!this.isTemplateFree(template.id) && !this.subscriptionService.isPremium()) {
      // Ne pas permettre la sélection des templates premium en version gratuite
      return;
    }
    
    this.selectedTemplate.set(template);
    this.templateSelected.emit(template);
  }

  getTemplateCardClasses(template: CVTemplate): string {
    const isSelected = this.selectedTemplate()?.id === template.id;
    const isLocked = !this.isTemplateFree(template.id) && !this.subscriptionService.isPremium();
    return `
      ${isSelected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
      }
      ${isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
    `;
  }

  getTemplateImagePath(templateId: string): string {
    // Normaliser l'ID pour correspondre aux noms de fichiers (cv1.png, cv2.png, etc.)
    const normalizedId = templateId.toLowerCase();
    const path = `assets/templates/${normalizedId}.png`;
    console.log('🖼️ Chargement image:', path, 'pour template:', templateId);
    return path;
  }

  isTemplateFree(templateId: string): boolean {
    return this.subscriptionService.isTemplateFree(templateId);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('❌ Erreur de chargement d\'image:', img.src);
    // Si l'image ne charge pas, afficher un placeholder
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'text-center p-2 w-full h-full flex items-center justify-center';
      placeholder.innerHTML = `
        <div>
          <i class="fas fa-file-alt text-3xl text-gray-400 dark:text-gray-500 mb-2"></i>
          <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">${(img.alt || 'Template')}</p>
          <p class="text-xs text-red-500 mt-1">Image non trouvée</p>
        </div>
      `;
      parent.appendChild(placeholder);
    }
  }
}

