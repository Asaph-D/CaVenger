import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../services/cv-state.service';
import { CVTheme } from '../../models/cv.interface';

@Component({
  selector: 'app-style-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full p-6 bg-white">
      <h3 class="text-xl font-bold mb-6 text-gray-900">Personnalisation du CV</h3>

      <!-- Theme Presets -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4 text-gray-800">Thèmes Prédéfinis</h4>
        <div class="space-y-3">
          <div *ngFor="let theme of availableThemes()" 
               class="theme-card cursor-pointer p-4 rounded-lg border-2 transition-all hover:shadow-md"
               [class.border-purple-500]="isCurrentTheme(theme)"
               [class.border-gray-200]="!isCurrentTheme(theme)"
               [class.bg-purple-50]="isCurrentTheme(theme)"
               (click)="applyTheme(theme)">
            <div class="flex items-start space-x-3">
              <div class="flex space-x-1">
                <div class="w-4 h-4 rounded-full" [style.background-color]="theme.primaryColor"></div>
                <div class="w-4 h-4 rounded-full" [style.background-color]="theme.secondaryColor"></div>
                <div class="w-4 h-4 rounded-full" [style.background-color]="theme.accentColor"></div>
              </div>
              <div class="flex-1">
                <h5 class="font-medium text-gray-900">{{ theme.name }}</h5>
                <p class="text-sm text-gray-600">{{ getThemeDescription(theme) }}</p>
              </div>
              <i *ngIf="isCurrentTheme(theme)" class="fas fa-check text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom Colors -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4 text-gray-800">Couleurs Personnalisées</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Couleur Principale
            </label>
            <div class="flex items-center space-x-3">
              <input 
                type="color" 
                [(ngModel)]="customTheme.primaryColor"
                (change)="updateCustomTheme()"
                class="w-12 h-10 rounded border border-gray-300 cursor-pointer">
              <input 
                type="text" 
                [(ngModel)]="customTheme.primaryColor"
                (change)="updateCustomTheme()"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="#ec4899">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Couleur Secondaire
            </label>
            <div class="flex items-center space-x-3">
              <input 
                type="color" 
                [(ngModel)]="customTheme.secondaryColor"
                (change)="updateCustomTheme()"
                class="w-12 h-10 rounded border border-gray-300 cursor-pointer">
              <input 
                type="text" 
                [(ngModel)]="customTheme.secondaryColor"
                (change)="updateCustomTheme()"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="#db2777">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Couleur d'Accent
            </label>
            <div class="flex items-center space-x-3">
              <input 
                type="color" 
                [(ngModel)]="customTheme.accentColor"
                (change)="updateCustomTheme()"
                class="w-12 h-10 rounded border border-gray-300 cursor-pointer">
              <input 
                type="text" 
                [(ngModel)]="customTheme.accentColor"
                (change)="updateCustomTheme()"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="#f472b6">
            </div>
          </div>
        </div>
        
        <button 
          (click)="applyCustomTheme()"
          class="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
          Appliquer les couleurs personnalisées
        </button>
      </div>

      <!-- Typography -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4 text-gray-800">Typographie</h4>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Police des Titres
            </label>
            <select 
              [(ngModel)]="customTheme.fontFamily.heading"
              (change)="updateCustomTheme()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="Playfair Display">Playfair Display</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
              <option value="Lato">Lato</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Police du Corps
            </label>
            <select 
              [(ngModel)]="customTheme.fontFamily.body"
              (change)="updateCustomTheme()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
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

      <!-- Layout Options -->
      <div class="mb-8">
        <h4 class="font-semibold mb-4 text-gray-800">Mise en Page</h4>
        <div class="space-y-3">
          <div class="flex items-center">
            <input 
              type="radio" 
              id="two-column" 
              name="layout" 
              value="two-column"
              class="mr-3">
            <label for="two-column" class="text-gray-700">Deux colonnes</label>
          </div>
          <div class="flex items-center">
            <input 
              type="radio" 
              id="single-column" 
              name="layout" 
              value="single-column"
              class="mr-3">
            <label for="single-column" class="text-gray-700">Une colonne</label>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="border-t pt-6">
        <h4 class="font-semibold mb-4 text-gray-800">Actions Rapides</h4>
        <div class="space-y-3">
          <button 
            (click)="resetToDefault()"
            class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            <i class="fas fa-undo mr-2"></i>
            Réinitialiser le style
          </button>
          <button 
            (click)="saveAsTemplate()"
            class="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors">
            <i class="fas fa-save mr-2"></i>
            Sauvegarder comme template
          </button>
        </div>
      </div>
    </div>
  `
})
export class StyleEditorComponent {
  private cvService = inject(CVStateService);

  availableThemes = this.cvService.availableThemes;
  currentCV = this.cvService.currentCV;

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
    // Initialize custom theme with current theme values
    const current = this.currentCV()?.theme;
    if (current) {
      this.customTheme = { ...current };
    }
  }

  isCurrentTheme(theme: CVTheme): boolean {
    return this.currentCV()?.theme.id === theme.id;
  }

  applyTheme(theme: CVTheme): void {
    this.cvService.applyTheme(theme);
    this.customTheme = { ...theme };
  }

  updateCustomTheme(): void {
    // Update the background color based on primary color
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
    // Implementation for saving current style as template
    console.log('Save as template functionality to be implemented');
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

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}