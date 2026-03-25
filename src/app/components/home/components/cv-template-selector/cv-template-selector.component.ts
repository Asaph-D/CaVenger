import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { CvApiService, CVTemplate } from '../../../../services/cv-api.service';
import { SubscriptionService } from '../../../../services/subscription.service';

@Component({
  selector: 'app-cv-template-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50">
      <!-- Bouton discret style Windows 11 -->
      <button
        (click)="toggleMenu()"
        [class]="getButtonClasses()"
        aria-label="Sélectionner un modèle de CV"
      >
        <svg *ngIf="!isOpen" class="w-4 h-4 dark:text-gray-400 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
        <svg *ngIf="isOpen" class="w-4 h-4 dark:text-gray-400 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Menu déroulant -->
      <div *ngIf="isOpen" class="absolute top-14 right-0 w-[380px] h-screen dark:bg-slate-900 bg-white dark:backdrop-blur-xl backdrop-blur-lg rounded-xl shadow-2xl dark:border-slate-700 border-gray-200 overflow-scroll scrollbar-discrete animate-fade-in">
        <div class="p-3 dark:border-slate-700 border-gray-200 dark:bg-slate-800/50 bg-gray-50/50">
          <h3 class="text-sm font-semibold dark:text-gray-200 text-gray-800 flex items-center gap-2">
            <svg class="w-4 h-4 dark:text-blue-400 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
            Choisir un modèle
          </h3>
          <p class="text-[10px] dark:text-gray-400 text-gray-500 mt-0.5">Sélectionnez le design qui vous convient</p>
        </div>

        <!-- Catégorie 1 -->
        <div class="px-3 pt-3 pb-1.5">
          <h4 class="text-[10px] font-semibold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Classiques</h4>
        </div>

        <div class="px-3 pb-2 grid grid-cols-3 gap-2">
          <button
            *ngFor="let template of templates().slice(0, 6)"
            (click)="selectTemplate(template)"
            [class]="getTemplateCardClasses(template)"
            class="relative"
          >
            <div class="aspect-[5/5] rounded overflow-hidden dark:bg-slate-800 bg-gray-100 dark:border-slate-700 border-gray-200 relative">
              <img 
                [src]="getTemplateImagePath(template.id)" 
                [alt]="template.name"
                class="w-full h-full object-cover"
                (error)="onImageError($event, template)"
              />
              <div *ngIf="isTemplateFree(template.id)" class="absolute top-1 left-1 bg-green-500 text-white text-[8px] px-1 py-0.5 rounded font-semibold">
                GRATUIT
              </div>
              <div *ngIf="!isTemplateFree(template.id) && !subscriptionService.isPremium()" class="absolute inset-0 bg-black/60 flex items-center justify-center">
                <i class="fas fa-lock text-white text-xs"></i>
              </div>
            </div>

            <div class="text-left mt-1">
              <h4 class="font-medium text-[9px] dark:text-gray-300 text-gray-700 group-hover:text-white group-hover:dark:text-white transition-colors leading-tight">
                {{ template.name }}
              </h4>
            </div>
            <div *ngIf="selectedTemplate?.id === template.id" class="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center z-10">
              <svg class="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </button>
        </div>

        <!-- Catégorie 2 -->
        <div class="px-3 pt-1.5 pb-1.5 dark:border-t dark:border-slate-700 border-t border-gray-200">
          <h4 class="text-[10px] font-semibold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Épurés</h4>
        </div>

        <div class="px-3 pb-3 grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto scrollbar-discrete">
          <button
            *ngFor="let template of templates().slice(6)"
            (click)="selectTemplate(template)"
            [class]="getTemplateCardClasses(template)"
            class="relative"
          >
            <div class="aspect-[5/5] rounded overflow-hidden dark:bg-slate-800 bg-gray-100 dark:border-slate-700 border-gray-200 relative">
              <img 
                [src]="getTemplateImagePath(template.id)" 
                [alt]="template.name"
                class="w-full h-full object-cover"
                (error)="onImageError($event, template)"
              />
              <div *ngIf="isTemplateFree(template.id)" class="absolute top-1 left-1 bg-green-500 text-white text-[8px] px-1 py-0.5 rounded font-semibold">
                GRATUIT
              </div>
              <div *ngIf="!isTemplateFree(template.id) && !subscriptionService.isPremium()" class="absolute inset-0 bg-black/60 flex items-center justify-center">
                <i class="fas fa-lock text-white text-xs"></i>
              </div>
            </div>

            <div class="text-left mt-1">
              <h4 class="font-medium text-[9px] dark:text-gray-300 text-gray-700 group-hover:text-white group-hover:dark:text-white transition-colors leading-tight">
                {{ template.name }}
              </h4>
            </div>
            <div *ngIf="selectedTemplate?.id === template.id" class="absolute top-1 right-1 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center z-10">
              <svg class="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    button {
      transition: all 0.2s ease;
    }
    .group:hover {
      transform: translateY(-2px);
    }
  `]
})
export class CvTemplateSelectorComponent implements OnInit {
  @Output() templateSelected = new EventEmitter<string>();

  private cvApiService = inject(CvApiService);
  protected subscriptionService = inject(SubscriptionService);

  isOpen = false;
  selectedTemplate: CVTemplate | null = null;
  templates = signal<CVTemplate[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadTemplates();
  }

  /**
   * Charge les templates depuis le backend
   */
  loadTemplates(): void {
    this.isLoading.set(true);
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
        this.isLoading.set(false);
      }
    });
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  selectTemplate(template: CVTemplate): void {
    // Vérifier si le template est accessible
    if (!this.isTemplateFree(template.id) && !this.subscriptionService.isPremium()) {
      // Ne pas permettre la sélection des templates premium en version gratuite
      return;
    }
    
    this.selectedTemplate = template;
    this.templateSelected.emit(template.id);
    setTimeout(() => {
      this.isOpen = false;
    }, 300);
  }

  getTemplateImagePath(templateId: string): string {
    const normalizedId = templateId.toLowerCase();
    return `assets/templates/${normalizedId}.png`;
  }

  isTemplateFree(templateId: string): boolean {
    return this.subscriptionService.isTemplateFree(templateId);
  }

  onImageError(event: Event, template: CVTemplate): void {
    const img = event.target as HTMLImageElement;
    console.error('❌ Erreur de chargement d\'image:', img.src);
    // Si l'image ne charge pas, afficher un placeholder
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'w-full h-full flex items-center justify-center';
      placeholder.innerHTML = `
        <div class="text-center">
          <i class="fas fa-file-alt text-gray-400 dark:text-gray-500 text-xs"></i>
          <p class="text-[8px] text-gray-500 dark:text-gray-400 mt-1">${template.name}</p>
        </div>
      `;
      parent.appendChild(placeholder);
    }
  }

  /**
   * Définit le template sélectionné sans déclencher l'événement (pour synchronisation externe)
   */
  setSelectedTemplate(template: { id: string; name: string; description: string; layout: string }): void {
    // Trouver le template correspondant dans la liste
    const foundTemplate = this.templates().find(t => t.id === template.id);
    if (foundTemplate) {
      this.selectedTemplate = foundTemplate;
    } else {
      // Si non trouvé, créer un objet temporaire
      this.selectedTemplate = {
        id: template.id,
        name: template.name,
        description: template.description,
        layout: template.layout
      } as CVTemplate;
    }
  }

  getButtonClasses(): string {
    return `p-2.5 rounded-lg dark:backdrop-blur-xl backdrop-blur-lg transition-all duration-300 ease-out ${
      this.isOpen
        ? 'dark:bg-slate-800 bg-gray-100 shadow-2xl scale-105 dark:border-slate-700 border-gray-200'
        : 'dark:bg-slate-900/80 bg-white/80 hover:dark:bg-slate-800 hover:bg-gray-100 shadow-lg hover:shadow-xl hover:scale-105 dark:border-slate-700/50 border-gray-200/50'
    }`;
  }

  getTemplateCardClasses(template: CVTemplate): string {
    return `group relative p-1.5 rounded-lg border transition-all duration-200 hover:shadow-lg ${
      this.selectedTemplate?.id === template.id
        ? 'border-blue-500 dark:bg-slate-800/80 bg-gray-100/80'
        : 'dark:border-slate-700 border-gray-200 dark:bg-slate-800/30 bg-gray-100/30 hover:dark:border-slate-600 hover:border-gray-300 hover:dark:bg-slate-800/50 hover:bg-gray-100/50'
    }`;
  }

  renderTemplate(layout: string): string {
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? 'bg-slate-900' : 'bg-white';
    const bgColorLight = isDark ? 'bg-slate-800' : 'bg-gray-50';
    const bgColorLighter = isDark ? 'bg-slate-700' : 'bg-gray-200';
    const borderColor = isDark ? 'border-slate-700' : 'border-gray-200';
    const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
    const placeholderColor = isDark ? 'bg-slate-700' : 'bg-gray-200';
    const placeholderColorLight = isDark ? 'bg-slate-600' : 'bg-gray-300';
    const placeholderColorLighter = isDark ? 'bg-slate-500' : 'bg-gray-400';

    switch(layout) {
      case 'single-column':
        return `
          <div class="w-full h-full ${bgColor} p-1 space-y-1">
            <div class="flex items-start gap-1 pb-1 ${borderColor}">
              <div class="w-4 h-4 rounded-full ${bgColorLighter} flex-shrink-0 border ${borderColor}"></div>
              <div class="space-y-0.5 flex-1">
                <div class="h-0.5 ${placeholderColorLight} rounded w-3/4"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-1/2"></div>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
              <div class="pl-0.5 space-y-0.5">
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
              <div class="pl-0.5 space-y-0.5">
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
              <div class="pl-0.5 space-y-0.5">
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
              <div class="pl-0.5 space-y-0.5">
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
              <div class="pl-0.5 space-y-0.5">
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
            </div>
            <div class="space-y-0.5">
              <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
              <div class="pl-0.5 space-y-0.5">
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
            </div>
          </div>
        `;

      case 'sidebar':
        return `
          <div class="w-full h-full ${bgColor} flex">
            <div class="w-1/3 ${bgColorLight} p-1 space-y-1 border-r ${borderColor}">
              <div class="w-4 h-4 rounded-full ${bgColorLighter} mx-auto border ${borderColor}"></div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
            </div>
            <div class="flex-1 p-1 space-y-1">
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
            </div>
          </div>
        `;

      case 'two-column':
        return `
          <div class="w-full h-full ${bgColor} p-1 space-y-0.5">
            <div class="flex items-center gap-1 pb-0.5 ${borderColor}">
              <div class="w-3.5 h-3.5 rounded-full ${bgColorLighter} border ${borderColor}"></div>
              <div class="space-y-0.5 flex-1">
                <div class="h-0.5 ${placeholderColorLight} rounded w-2/3"></div>
              </div>
            </div>
            <div class="flex gap-1">
              <div class="flex-1 space-y-0.5 pr-1 border-r ${borderColor}">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
              <div class="flex-1 space-y-0.5 pl-1">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-5/6"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-3/4"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-5/6"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-3/4"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-5/6"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-3/4"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-5/6"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-3/4"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-5/6"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-3/4"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-5/6"></div>
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-3/4"></div>
              </div>
            </div>
          </div>
        `;

      case 'timeline':
        return `
          <div class="w-full h-full ${bgColor} p-1">
            <div class="flex items-center gap-1 pb-1 mb-0.5 ${borderColor}">
              <div class="w-3.5 h-3.5 rounded-full ${bgColorLighter} border ${borderColor}"></div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLight} rounded w-10"></div>
              </div>
            </div>
            <div class="relative pl-1.5 space-y-1">
              <div class="absolute left-0 top-0 bottom-0 w-px ${placeholderColor}"></div>
              <div class="relative">
                <div class="absolute -left-1.5 top-0 w-1 h-1 rounded-full bg-blue-500"></div>
                <div class="space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                </div>
              </div>
              <div class="relative">
                <div class="absolute -left-1.5 top-0 w-1 h-1 rounded-full bg-blue-400"></div>
                <div class="space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
                </div>
              </div>
              <div class="relative">
                <div class="absolute -left-1.5 top-0 w-1 h-1 rounded-full bg-blue-500"></div>
                <div class="space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                </div>
              </div>
              <div class="relative">
                <div class="absolute -left-1.5 top-0 w-1 h-1 rounded-full bg-blue-400"></div>
                <div class="space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
                </div>
              </div>
              <div class="relative">
                <div class="absolute -left-1.5 top-0 w-1 h-1 rounded-full bg-blue-500"></div>
                <div class="space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                </div>
              </div>
              <div class="relative">
                <div class="absolute -left-1.5 top-0 w-1 h-1 rounded-full bg-blue-400"></div>
                <div class="space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
                </div>
              </div>
              <div class="relative">
                <div class="absolute -left-1.5 top-0 w-1 h-1 rounded-full bg-blue-500"></div>
                <div class="space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'arch':
        return `
          <div class="w-full h-full ${bgColor} overflow-hidden relative">
            <div class="relative ${bgColorLight} h-6 border-b-2 border-blue-500" style="border-radius: 0 0 50% 50%;">
              <div class="absolute top-0.5 left-1/2 transform -translate-x-1/2">
                <div class="w-4 h-4 rounded-full ${bgColorLighter} border ${borderColor}"></div>
              </div>
            </div>
            <div class="p-1 pt-0.5 space-y-1">
              <div class="space-y-0.5 pl-1 border-l border-blue-500">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
              <div class="space-y-0.5 pl-1 border-l border-blue-400">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5 pl-1 border-l border-blue-500">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
              <div class="space-y-0.5 pl-1 border-l border-blue-400">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="space-y-0.5 pl-1 border-l border-blue-500">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
              <div class="space-y-0.5 pl-1 border-l border-blue-400">
                <div class="h-0.5 ${placeholderColorLighter} rounded w-1/3"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
            </div>
          </div>
        `;

      case 'diagonal':
        return `
          <div class="w-full h-full ${bgColor} overflow-hidden relative">
            <div class="relative h-5 ${bgColorLight}" style="clip-path: polygon(0 0, 100% 0, 100% 60%, 0 100%);">
              <div class="flex items-start justify-between p-1">
                <div class="h-0.5 ${placeholderColorLight} rounded w-10"></div>
                <div class="w-3.5 h-3.5 rounded-full ${bgColorLighter} border ${borderColor}"></div>
              </div>
            </div>
            <div class="p-1 space-y-1">
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2" style="border-bottom: 1px solid #3b82f6;"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                <div class="h-0.5 ${placeholderColorLighter} rounded w-4/5"></div>
              </div>
              <div class="relative h-1">
                <div class="absolute inset-0 bg-blue-500/30" style="clip-path: polygon(0 60%, 100% 40%, 100% 60%, 0 80%);"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="relative h-1">
                <div class="absolute inset-0 bg-blue-500/30" style="clip-path: polygon(0 60%, 100% 40%, 100% 60%, 0 80%);"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="relative h-1">
                <div class="absolute inset-0 bg-blue-500/30" style="clip-path: polygon(0 60%, 100% 40%, 100% 60%, 0 80%);"></div>
              </div>
              <div class="space-y-0.5">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
            </div>
          </div>
        `;

      case 'circle':
        return `
          <div class="w-full h-full ${bgColor} p-1 relative">
            <div class="flex items-center justify-between pb-1 mb-1 ${borderColor}">
              <div class="h-0.5 ${placeholderColorLight} rounded-full w-10"></div>
              <div class="relative">
                <div class="w-4 h-4 rounded-full ${bgColorLight} flex items-center justify-center border border-blue-500">
                  <div class="w-3 h-3 rounded-full ${bgColorLighter}"></div>
                </div>
              </div>
            </div>
            <div class="space-y-1">
              <div class="flex gap-1 items-start">
                <div class="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></div>
                <div class="flex-1 space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded-full w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded-full w-full"></div>
                </div>
              </div>
              <div class="flex gap-1 items-start">
                <div class="w-1 h-1 rounded-full bg-blue-400 mt-0.5"></div>
                <div class="flex-1 space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded-full w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded-full w-4/5"></div>
                </div>
              </div>
              <div class="flex gap-1 items-start">
                <div class="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></div>
                <div class="flex-1 space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded-full w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded-full w-full"></div>
                </div>
              </div>
              <div class="flex gap-1 items-start">
                <div class="w-1 h-1 rounded-full bg-blue-400 mt-0.5"></div>
                <div class="flex-1 space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded-full w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded-full w-4/5"></div>
                </div>
              </div>
              <div class="flex gap-1 items-start">
                <div class="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></div>
                <div class="flex-1 space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded-full w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded-full w-full"></div>
                </div>
              </div>
              <div class="flex gap-1 items-start">
                <div class="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></div>
                <div class="flex-1 space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded-full w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded-full w-full"></div>
                </div>
              </div>
              <div class="flex gap-1 items-start">
                <div class="w-1 h-1 rounded-full bg-blue-500 mt-0.5"></div>
                <div class="flex-1 space-y-0.5">
                  <div class="h-0.5 ${placeholderColorLighter} rounded-full w-2/3"></div>
                  <div class="h-0.5 ${placeholderColor} rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'geometric':
        return `
          <div class="w-full h-full ${bgColor} relative overflow-hidden">
            <div class="absolute top-0 right-0 w-4 h-4 bg-blue-500/20" style="transform: rotate(45deg);"></div>
            <div class="p-1 space-y-1 relative z-10">
              <div class="flex items-start gap-1 pb-1 ${borderColor}">
                <div class="w-4 h-4 ${bgColorLight} flex items-center justify-center border border-blue-500" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);">
                  <div class="w-2 h-2 rounded-full ${bgColorLighter}"></div>
                </div>
                <div class="h-0.5 ${placeholderColorLight} rounded w-10"></div>
              </div>
              <div class="space-y-1">
                <div class="flex items-start gap-1">
                  <div class="w-1 h-1 bg-blue-500 mt-0.5"></div>
                  <div class="flex-1 space-y-0.5">
                    <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                    <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                  </div>
                </div>
                <div class="flex items-start gap-1">
                  <div class="w-1 h-1 bg-blue-400 mt-0.5" style="transform: rotate(45deg);"></div>
                  <div class="flex-1 space-y-0.5">
                    <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                    <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
                  </div>
                </div>
                <div class="flex items-start gap-1">
                  <div class="w-1 h-1 bg-blue-500 mt-0.5"></div>
                  <div class="flex-1 space-y-0.5">
                    <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                    <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                  </div>
                </div>
                <div class="flex items-start gap-1">
                  <div class="w-1 h-1 bg-blue-400 mt-0.5" style="transform: rotate(45deg);"></div>
                  <div class="flex-1 space-y-0.5">
                    <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                    <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
                  </div>
                </div>
                <div class="flex items-start gap-1">
                  <div class="w-1 h-1 bg-blue-500 mt-0.5"></div>
                  <div class="flex-1 space-y-0.5">
                    <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                    <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
                  </div>
                </div>
                <div class="flex items-start gap-1">
                  <div class="w-1 h-1 bg-blue-400 mt-0.5" style="transform: rotate(45deg);"></div>
                  <div class="flex-1 space-y-0.5">
                    <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                    <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
                  </div>
                </div>
                <div class="flex items-start gap-1">
                  <div class="w-1 h-1 bg-blue-400 mt-0.5" style="transform: rotate(45deg);"></div>
                  <div class="flex-1 space-y-0.5">
                    <div class="h-0.5 ${placeholderColorLighter} rounded w-1/2"></div>
                    <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'asymmetric':
        return `
          <div class="w-full h-full ${bgColor} overflow-hidden">
            <div class="flex h-5">
              <div class="w-2/3 ${bgColorLight} p-1 flex items-center">
                <div class="h-0.5 ${placeholderColorLight} rounded w-10"></div>
              </div>
              <div class="w-1/3 ${bgColorLighter} flex items-center justify-center">
                <div class="w-3.5 h-3.5 rounded-full ${bgColorLighter} border ${borderColor}"></div>
              </div>
            </div>
            <div class="p-1 space-y-1">
              <div class="ml-0 space-y-0.5 pl-1 border-l border-blue-500">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
              </div>
              <div class="ml-3 space-y-0.5 pl-1 border-l border-blue-400">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
              </div>
              <div class="ml-1.5 space-y-0.5 pl-1 border-l border-blue-300">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="ml-0 space-y-0.5 pl-1 border-l border-blue-500">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
              </div>
              <div class="ml-3 space-y-0.5 pl-1 border-l border-blue-400">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
              </div>
              <div class="ml-1.5 space-y-0.5 pl-1 border-l border-blue-300">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
              <div class="ml-0 space-y-0.5 pl-1 border-l border-blue-500">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-4/5"></div>
              </div>
              <div class="ml-3 space-y-0.5 pl-1 border-l border-blue-400">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-full"></div>
              </div>
              <div class="ml-1.5 space-y-0.5 pl-1 border-l border-blue-300">
                <div class="h-0.5 ${placeholderColorLight} rounded w-1/2"></div>
                <div class="h-0.5 ${placeholderColor} rounded w-3/4"></div>
              </div>
            </div>
          </div>
        `;

      default:
        return '';
    }
  }
}
