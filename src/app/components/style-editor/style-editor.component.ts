import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CVTheme } from '../../models/cv.interface';
import { CVStateService } from '../../services/cv-state.service';
import { ExternalTemplate, ExternalTemplateService, WatermarkStyle } from '../../services/external-template.service';
import { ThemeService } from '../../services/theme.service';
import { TemplatePickerComponent } from '../cv-builder/components/template-picker/template-picker.component';
import { CvApiService, CVTemplate } from '../../services/cv-api.service';

@Component({
  selector: 'app-style-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplatePickerComponent],
  template: `
    <div class="h-full p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h3 class="text-xl font-bold mb-6">Personnalisation du CV</h3>

      <!-- Thèmes Prédéfinis -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4">Thèmes Prédéfinis</h4>
        <div class="space-y-3">
          <div *ngFor="let theme of availableThemes()"
               class="theme-card cursor-pointer p-4 rounded-lg border-2 transition-all hover:shadow-md
                      bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
               [class.border-purple-500]="isCurrentTheme(theme)"
               [class.bg-purple-50]="isCurrentTheme(theme) && !themeService.isDarkMode()"
               [ngClass]="{'dark:bg-purple-900/30': isCurrentTheme(theme) && themeService.isDarkMode()}"
               (click)="applyTheme(theme)">
            <div class="flex items-start space-x-3">
              <div class="flex space-x-1">
                <div class="w-4 h-4 rounded-full" [style.background-color]="theme.primaryColor"></div>
                <div class="w-4 h-4 rounded-full" [style.background-color]="theme.secondaryColor"></div>
                <div class="w-4 h-4 rounded-full" [style.background-color]="theme.accentColor"></div>
              </div>
              <div class="flex-1">
                <h5 class="font-medium">{{ theme.name }}</h5>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ getThemeDescription(theme) }}</p>
              </div>
              <i *ngIf="isCurrentTheme(theme)" class="fas fa-check text-purple-600 dark:text-purple-400"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Couleurs Personnalisées -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4">Couleurs Personnalisées</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur Principale
            </label>
            <div class="flex items-center space-x-3">
              <input
                type="color"
                [(ngModel)]="customTheme.primaryColor"
                (change)="updateCustomTheme()"
                class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer">
              <input
                type="text"
                [(ngModel)]="customTheme.primaryColor"
                (change)="updateCustomTheme()"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="#ec4899">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur Secondaire
            </label>
            <div class="flex items-center space-x-3">
              <input
                type="color"
                [(ngModel)]="customTheme.secondaryColor"
                (change)="updateCustomTheme()"
                class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer">
              <input
                type="text"
                [(ngModel)]="customTheme.secondaryColor"
                (change)="updateCustomTheme()"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="#db2777">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Couleur d'Accent
            </label>
            <div class="flex items-center space-x-3">
              <input
                type="color"
                [(ngModel)]="customTheme.accentColor"
                (change)="updateCustomTheme()"
                class="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer">
              <input
                type="text"
                [(ngModel)]="customTheme.accentColor"
                (change)="updateCustomTheme()"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="#f472b6">
            </div>
          </div>
        </div>

        <button
          (click)="applyCustomTheme()"
          class="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
          Appliquer les couleurs personnalisées
        </button>
      </div>

      <!-- Typologie -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4">Typographie</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Police des Titres
            </label>
            <select
              [(ngModel)]="customTheme.fontFamily.heading"
              (change)="updateCustomTheme()"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="Playfair Display">Playfair Display</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
              <option value="Lato">Lato</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Police du Corps
            </label>
            <select
              [(ngModel)]="customTheme.fontFamily.body"
              (change)="updateCustomTheme()"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="Roboto">Roboto</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
              <option value="Lato">Lato</option>
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Templates du Backend -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4 flex items-center">
          <i class="fas fa-server mr-2 text-blue-500"></i>
          Modèles de CV (Backend)
        </h4>
        <app-template-picker (templateSelected)="onBackendTemplateSelected($event)"></app-template-picker>
      </div>

      <!-- Structures de CV Externes -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4 flex items-center">
          <i class="fas fa-file-code mr-2 text-indigo-500"></i>
          Structures de CV
        </h4>
        <div class="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto scrollbar-discrete">
          <div *ngFor="let template of externalTemplates" 
               (click)="selectExternalTemplate(template.id)" 
               class="border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md"
               [ngClass]="{
                 'border-indigo-500': selectedTemplateId === template.id,
                 'bg-indigo-50': selectedTemplateId === template.id && !themeService.isDarkMode(),
                 'dark:bg-indigo-900/30': selectedTemplateId === template.id && themeService.isDarkMode(),
                 'border-gray-300': selectedTemplateId !== template.id,
                 'dark:border-gray-600': selectedTemplateId !== template.id && themeService.isDarkMode()
               }">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h5 class="font-medium text-gray-900 dark:text-white mb-1">{{ template.name }}</h5>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ template.description }}</p>
              </div>
              <div *ngIf="selectedTemplateId === template.id" class="text-indigo-600 dark:text-indigo-400">
                <i class="fas fa-check-circle"></i>
              </div>
            </div>
            <!-- Aperçu visuel -->
            <div class="mt-2 h-16 rounded overflow-hidden flex items-center justify-center"
                 [style.background]="getTemplatePreviewBackground(template)">
              <div class="text-white text-xs font-semibold">{{ template.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Styles de Filigrane -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4 flex items-center">
          <i class="fas fa-water mr-2 text-purple-500"></i>
          Filigranes et Patterns
        </h4>
        <div class="grid grid-cols-2 gap-3">
          <div *ngFor="let watermark of watermarkStyles" 
               (click)="selectWatermark(watermark.id)" 
               class="border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md"
               [ngClass]="{
                 'border-purple-500': selectedWatermarkId === watermark.id,
                 'bg-purple-50': selectedWatermarkId === watermark.id && !themeService.isDarkMode(),
                 'dark:bg-purple-900/30': selectedWatermarkId === watermark.id && themeService.isDarkMode(),
                 'border-gray-300': selectedWatermarkId !== watermark.id,
                 'dark:border-gray-600': selectedWatermarkId !== watermark.id && themeService.isDarkMode()
               }">
            <div 
              class="aspect-video rounded mb-2 flex items-center justify-center relative overflow-hidden"
              [style.background]="watermark.backgroundStyle !== 'none' ? watermark.backgroundStyle : 'white'"
              [class.bg-white]="watermark.backgroundStyle === 'none'"
              [class.dark:bg-gray-700]="watermark.backgroundStyle === 'none' && themeService.isDarkMode()">
              <div *ngIf="watermark.backgroundStyle === 'none'" class="text-gray-400 text-xs">Aucun</div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h6 class="text-xs font-medium text-gray-900 dark:text-white">{{ watermark.name }}</h6>
              </div>
              <div *ngIf="selectedWatermarkId === watermark.id" class="text-purple-600 dark:text-purple-400 text-xs">
                <i class="fas fa-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mise en Page -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4">Mise en Page</h4>
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              type="radio"
              id="two-column"
              name="layout"
              value="two-column"
              [(ngModel)]="customTheme.layout"
              (change)="updateCustomTheme()"
              class="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded">
            <label for="two-column" class="text-gray-700 dark:text-gray-300">Deux colonnes</label>
          </div>
          <div class="flex items-center">
            <input
              type="radio"
              id="single-column"
              name="layout"
              value="single-column"
              [(ngModel)]="customTheme.layout"
              (change)="updateCustomTheme()"
              class="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded">
            <label for="single-column" class="text-gray-700 dark:text-gray-300">Une colonne</label>
          </div>
        </div>
      </div>

      <!-- Actions Rapides -->
      <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
        <h4 class="font-semibold mb-4">Actions Rapides</h4>
        <div class="space-y-3">
          <button
            (click)="resetToDefault()"
            class="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <i class="fas fa-undo mr-2"></i>
            Réinitialiser le style
          </button>
          <button
            (click)="saveAsTemplate()"
            class="w-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 py-2 px-4 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors">
            <i class="fas fa-save mr-2"></i>
            Sauvegarder comme template
          </button>
        </div>
      </div>
    </div>
  `
})
export class StyleEditorComponent implements OnInit {
  private cvService = inject(CVStateService);
  private externalTemplateService = inject(ExternalTemplateService);
  private cdr = inject(ChangeDetectorRef);
  public themeService = inject(ThemeService);

  availableThemes = this.cvService.availableThemes;
  currentCV = this.cvService.currentCV;
  
  externalTemplates: ExternalTemplate[] = [];
  watermarkStyles: WatermarkStyle[] = [];
  selectedTemplateId: string | null = null;
  selectedWatermarkId: string | null = null;

  customTheme: CVTheme = {
    id: 'custom',
    name: 'Personnalisé',
    primaryColor: '#ec4899',
    secondaryColor: '#db2777',
    accentColor: '#f472b6',
    backgroundColor: '#fdf2f8',
    textColor: '#374151',
    fontFamily: {
      heading: 'Playfair Display',
      body: 'Roboto'
    },
    layout: 'two-column'
  };

  ngOnInit(): void {
    // Initialiser le thème personnalisé avec les valeurs du thème actuel
    const current = this.currentCV()?.theme;
    if (current) {
      this.customTheme = { ...current };
    }
    
    // Charger les templates externes et filigranes
    this.externalTemplates = this.externalTemplateService.getExternalTemplates();
    this.watermarkStyles = this.externalTemplateService.getWatermarkStyles();
    
    // Initialiser les sélections avec les valeurs actuelles du CV
    const cv = this.currentCV();
    if (cv?.externalTemplate) {
      this.selectedTemplateId = cv.externalTemplate.id;
    }
    if (cv?.watermarkStyle) {
      this.selectedWatermarkId = cv.watermarkStyle.id;
    }
    
    console.log('Style Editor initialized:', {
      templates: this.externalTemplates.length,
      watermarks: this.watermarkStyles.length,
      selectedTemplate: this.selectedTemplateId,
      selectedWatermark: this.selectedWatermarkId
    });
  }

  isCurrentTheme(theme: CVTheme): boolean {
    return this.currentCV()?.theme.id === theme.id;
  }

  applyTheme(theme: CVTheme): void {
    this.cvService.applyTheme(theme);
    this.customTheme = { ...theme };
  }

  updateCustomTheme(): void {
    // Mettre à jour la couleur de fond en fonction de la couleur principale
    const primaryColor = this.customTheme.primaryColor;
    const rgb = this.hexToRgb(primaryColor);
    if (rgb) {
      this.customTheme.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
    }
  }

  applyCustomTheme(): void {
    this.updateCustomTheme();
    this.cvService.applyTheme(this.customTheme);
  }

  resetToDefault(): void {
    const defaultTheme = this.availableThemes()[0];
    this.applyTheme(defaultTheme);
  }

  saveAsTemplate(): void {
    console.log('Fonctionnalité "Sauvegarder comme template" à implémenter');
  }

  getThemeDescription(theme: CVTheme): string {
    const descriptions: Record<string, string> = {
      'pink': 'Moderne et élégant, parfait pour les métiers créatifs',
      'blue': 'Professionnel et fiable, idéal pour les entreprises',
      'green': 'Naturel et équilibré, excellent pour l\'environnement',
      'gold': 'Chaleureux et premium, parfait pour le luxe',
      'purple': 'Créatif et innovant, idéal pour la tech'
    };
    return descriptions[theme.id] || 'Style personnalisé';
  }

  selectExternalTemplate(templateId: string): void {
    this.selectedTemplateId = this.selectedTemplateId === templateId ? null : templateId;
    if (this.selectedTemplateId) {
      this.applyExternalTemplate(this.selectedTemplateId);
    }
  }

  selectWatermark(watermarkId: string): void {
    this.selectedWatermarkId = this.selectedWatermarkId === watermarkId ? null : watermarkId;
    if (this.selectedWatermarkId) {
      this.applyWatermark(this.selectedWatermarkId);
    }
  }

  applyExternalTemplate(templateId: string): void {
    const currentCV = this.currentCV();
    if (!currentCV) {
      console.error('No CV found');
      return;
    }

    console.log('Applying external template:', templateId);
    const updatedCV = this.externalTemplateService.applyExternalTemplate(currentCV, templateId);
    
    // Appliquer le thème mis à jour
    if (updatedCV.theme) {
      this.cvService.applyTheme(updatedCV.theme);
    }
    
    // Mettre à jour le CV avec le template externe
    this.cvService.updateCVData({
      externalTemplate: updatedCV.externalTemplate
    });
    
    console.log('Template applied:', updatedCV.externalTemplate);
    this.cdr.detectChanges();
  }

  applyWatermark(watermarkId: string): void {
    const currentCV = this.currentCV();
    if (!currentCV) {
      console.error('No CV found');
      return;
    }

    console.log('Applying watermark:', watermarkId);
    const updatedCV = this.externalTemplateService.applyWatermarkStyle(currentCV, watermarkId);
    
    // Mettre à jour le CV avec le filigrane
    this.cvService.updateCVData({
      watermarkStyle: updatedCV.watermarkStyle
    });
    
    console.log('Watermark applied:', updatedCV.watermarkStyle);
    this.cdr.detectChanges();
  }

  /**
   * Gère la sélection d'un template du backend
   */
  onBackendTemplateSelected(template: CVTemplate): void {
    const currentCV = this.currentCV();
    if (!currentCV) return;

    // Convertir le template du backend en CVTemplate pour l'application
    const cvTemplate = this.cvService.convertTemplateSelectorToCVTemplate({
      id: template.id,
      name: template.name,
      description: template.description,
      layout: template.layout
    });

    // Appliquer le template
    this.cvService.applyTemplate(cvTemplate);
    
    console.log('Template du backend sélectionné:', template);
    this.cdr.detectChanges();
  }

  getTemplatePreviewBackground(template: ExternalTemplate): string {
    if (template.visualConfig?.headerColors) {
      return `linear-gradient(135deg, ${template.visualConfig.headerColors.primary}, ${template.visualConfig.headerColors.secondary})`;
    }
    return 'linear-gradient(135deg, #ec4899, #db2777)';
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
