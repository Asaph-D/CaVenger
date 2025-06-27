import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CVStateService } from '../../services/cv-state.service';
import { CVPreviewComponent } from '../cv-preview/cv-preview.component';
import { SectionEditorComponent } from '../section-editor/section-editor.component';
import { StyleEditorComponent } from '../style-editor/style-editor.component';

@Component({
  selector: 'app-cv-builder',
  standalone: true,
  imports: [
    CommonModule,
    CVPreviewComponent,
    StyleEditorComponent,
    SectionEditorComponent
  ],
  template: `
    <div class="relative z-1 min-h-screen bg-gray-50 -mt-16">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-4">
              <button 
                (click)="goHome()"
                class="text-gray-600 hover:text-gray-900 transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                Retour
              </button>
              <div class="h-6 w-px bg-gray-300"></div>
              <h1 class="text-xl font-semibold text-gray-900">
                {{ currentCV()?.personalInfo?.firstName }} {{ currentCV()?.personalInfo?.lastName }}
              </h1>
              <div *ngIf="isDirty()" class="flex items-center text-amber-600">
                <i class="fas fa-circle text-xs mr-1"></i>
                <span class="text-sm">Non sauvegardé</span>
              </div>
            </div>

            <div class="flex items-center space-x-4">
              <!-- View mode toggle -->
              <div class="flex bg-gray-100 rounded-lg p-1">
                <button 
                  (click)="setViewMode('edit')"
                  [class.bg-white]="viewMode === 'edit'"
                  [class.shadow-sm]="viewMode === 'edit'"
                  class="px-3 py-1 rounded-md text-sm font-medium transition-all">
                  <i class="fas fa-edit mr-1"></i>
                  Édition
                </button>
                <button 
                  (click)="setViewMode('preview')"
                  [class.bg-white]="viewMode === 'preview'"
                  [class.shadow-sm]="viewMode === 'preview'"
                  class="px-3 py-1 rounded-md text-sm font-medium transition-all">
                  <i class="fas fa-eye mr-1"></i>
                  Aperçu
                </button>
              </div>

              <button 
                (click)="toggleStyleEditor()"
                [class.bg-purple-100]="showStyleEditor"
                [class.text-purple-700]="showStyleEditor"
                class="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg">
                <i class="fas fa-palette mr-2"></i>
                Style
              </button>

              <button 
                (click)="toggleHelp()"
                [class.bg-blue-100]="showHelp()"
                [class.text-blue-700]="showHelp()"
                class="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg">
                <i class="fas fa-question-circle mr-2"></i>
                Aide
              </button>

              <div class="h-6 w-px bg-gray-300"></div>

              <button 
                (click)="saveCV()"
                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <i class="fas fa-save mr-2"></i>
                Sauvegarder
              </button>
              
              <button 
                (click)="exportPDF()"
                [disabled]="isExporting"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <i [class]="isExporting ? 'fas fa-spinner fa-spin' : 'fas fa-download'" class="mr-2"></i>
                {{ isExporting ? 'Export...' : 'PDF' }}
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex h-screen pt-16">
        <!-- Left Panel - Section Editor -->
        <div *ngIf="viewMode === 'edit'" 
             class="w-1/3 bg-white border-r overflow-y-auto transition-all duration-300">
          <app-section-editor></app-section-editor>
        </div>

        <!-- Center Panel - CV Preview -->
        <div class="flex-1 bg-gray-100 overflow-y-auto p-8 transition-all duration-300"
             [class.w-full]="viewMode === 'preview'"
             [class.w-2]="viewMode === 'edit'">
          <div class="max-w-4xl mx-auto">
            <app-cv-preview></app-cv-preview>
          </div>
        </div>

        <!-- Right Panel - Style Editor (conditional) -->
        <div 
          *ngIf="showStyleEditor" 
          class="w-1/4 bg-white border-l overflow-y-auto animate-slide-in-right">
          <app-style-editor></app-style-editor>
        </div>
      </div>

      <!-- Floating Action Buttons -->
      <div class="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
        <div class="relative group">
          <button 
            (click)="showAddSectionMenu = !showAddSectionMenu"
            class="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
            title="Ajouter une section">
            <i class="fas fa-plus"></i>
          </button>
          
          <!-- Add section menu -->
          <div *ngIf="showAddSectionMenu" 
               class="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-xl border py-2 min-w-48">
            <button 
              *ngFor="let sectionType of availableSectionTypes"
              (click)="addSection(sectionType.type, sectionType.position)"
              class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center">
              <i [class]="sectionType.icon + ' mr-3 text-gray-500'"></i>
              <span>{{ sectionType.name }}</span>
            </button>
          </div>
        </div>

        <button 
          (click)="toggleDragMode()"
          [class.bg-orange-600]="dragMode()"
          [class.bg-gray-600]="!dragMode()"
          class="text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          title="Mode déplacement">
          <i class="fas fa-arrows-alt"></i>
        </button>

        <button 
          (click)="toggleResizeMode()"
          [class.bg-indigo-600]="resizeMode()"
          [class.bg-gray-600]="!resizeMode()"
          class="text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          title="Mode redimensionnement">
          <i class="fas fa-expand-arrows-alt"></i>
        </button>
      </div>

      <!-- Auto-save indicator -->
      <div 
        *ngIf="autoSaving" 
        class="fixed bottom-6 left-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        Sauvegarde automatique...
      </div>

      <!-- Export progress -->
      <div 
        *ngIf="isExporting"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl">
          <div class="flex items-center">
            <i class="fas fa-spinner fa-spin text-blue-600 mr-3"></i>
            <span>Génération du PDF en cours...</span>
          </div>
        </div>
      </div>

      <!-- Keyboard shortcuts help -->
      <div 
        *ngIf="showShortcuts"
        class="fixed bottom-20 right-6 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-xs z-50">
        <h4 class="font-bold mb-2">Raccourcis clavier</h4>
        <div class="space-y-1 text-sm">
          <div><kbd class="bg-gray-700 px-1 rounded">Ctrl+S</kbd> Sauvegarder</div>
          <div><kbd class="bg-gray-700 px-1 rounded">Ctrl+P</kbd> Imprimer</div>
          <div><kbd class="bg-gray-700 px-1 rounded">Ctrl+E</kbd> Export PDF</div>
          <div><kbd class="bg-gray-700 px-1 rounded">Ctrl+H</kbd> Aide</div>
          <div><kbd class="bg-gray-700 px-1 rounded">Escape</kbd> Fermer panneaux</div>
        </div>
        <button 
          (click)="showShortcuts = false"
          class="absolute top-2 right-2 text-gray-400 hover:text-white">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in-right {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }

    kbd {
      font-family: monospace;
      font-size: 0.75rem;
    }
  `]
})
export class CVBuilderComponent implements OnInit {
  private readonly cvService = inject(CVStateService);
  private readonly router = inject(Router);

  @ViewChild(CVPreviewComponent) cvPreviewComponent?: CVPreviewComponent;

  currentCV = this.cvService.currentCV;
  isDirty = this.cvService.isDirty;
  isEditing = this.cvService.isEditing;
  dragMode = this.cvService.dragMode;
  resizeMode = this.cvService.resizeMode;
  showHelp = this.cvService.showHelp;

  viewMode: 'edit' | 'preview' = 'edit';
  showStyleEditor = false;
  autoSaving = false;
  showShortcuts = false;
  showAddSectionMenu = false;
  isExporting = false;

  availableSectionTypes = [
    { type: 'profile', name: 'Profil Professionnel', icon: 'fas fa-user', position: 'right' as const },
    { type: 'experience', name: 'Expérience', icon: 'fas fa-briefcase', position: 'right' as const },
    { type: 'education', name: 'Formation', icon: 'fas fa-graduation-cap', position: 'right' as const },
    { type: 'skills', name: 'Compétences', icon: 'fas fa-star', position: 'left' as const },
    { type: 'languages', name: 'Langues', icon: 'fas fa-language', position: 'left' as const },
    { type: 'interests', name: 'Loisirs', icon: 'fas fa-heart', position: 'left' as const },
    { type: 'contact', name: 'Contact', icon: 'fas fa-address-card', position: 'left' as const },
    { type: 'custom', name: 'Section Personnalisée', icon: 'fas fa-plus-circle', position: 'right' as const }
  ];

  ngOnInit(): void {
    // If no CV is loaded, redirect to home
    if (!this.currentCV()) {
      this.router.navigate(['/']);
      return;
    }

    this.cvService.setEditing(true);
    this.setupKeyboardShortcuts();
    this.setupAutoSave();
    this.setupClickOutside();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          this.saveCV();
          break;
        case 'p':
          event.preventDefault();
          window.print();
          break;
        case 'e':
          event.preventDefault();
          this.exportPDF();
          break;
        case 'h':
          event.preventDefault();
          this.toggleHelp();
          break;
      }
    } else if (event.key === 'Escape') {
      this.closeAllPanels();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.floating-action-buttons') && !target.closest('.add-section-menu')&& !target.closest('app-section-editor')) {
      this.showAddSectionMenu = false;
    }
  }

  setViewMode(mode: 'edit' | 'preview'): void {
    this.viewMode = mode;
  }

  goHome(): void {
    if (this.isDirty()) {
      const shouldSave = confirm('Vous avez des modifications non sauvegardées. Voulez-vous sauvegarder avant de quitter ?');
      if (shouldSave) {
        this.saveCV();
      }
    }
    this.router.navigate(['/']);
  }

  saveCV(): void {
    this.cvService.saveCV();
  }

  async exportPDF(): Promise<void> {
    this.isExporting = true;
    try {
      await this.cvService.exportToPDF();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    } finally {
      this.isExporting = false;
    }
  }

  toggleStyleEditor(): void {
    this.showStyleEditor = !this.showStyleEditor;
  }

  toggleHelp(): void {
    this.cvService.toggleHelp();
    if (this.showHelp()) {
      // Lance la file de modals d'aide dans le composant preview
      setTimeout(() => {
        this.cvPreviewComponent?.startHelpTips();
      }, 0);
      this.showShortcuts = true;
      setTimeout(() => {
        this.showShortcuts = false;
      }, 5000);
    }
  }

  toggleDragMode(): void {
    this.cvService.setDragMode(!this.dragMode());
    if (this.dragMode()) {
      this.cvService.setResizeMode(false);
    }
  }

  toggleResizeMode(): void {
    this.cvService.setResizeMode(!this.resizeMode());
    if (this.resizeMode()) {
      this.cvService.setDragMode(false);
    }
  }

  addSection(sectionType: string, position: 'left' | 'right'): void {
    // For custom section, prompt for title
    let customTitle = '';
    let customContent = '';
    if (sectionType === 'custom') {
      customTitle = prompt('Titre de la section personnalisée :', 'Section personnalisée') ?? 'Section personnalisée';
      customContent = prompt('Contenu initial (optionnel) :', '') ?? '';
      this.cvService.addSection(sectionType, position, {
        title: customTitle,
        data: { content: customContent }
      });
    } else {
      this.cvService.addSection(sectionType, position);
    }
    // Find the last added section (should be the last in the array)
    const cv = this.currentCV();
    if (cv?.sections && cv?.sections.length > 0) {
      const lastSection = cv.sections[cv.sections.length - 1];
      this.cvService.setSelectedSection(lastSection.id);
    }
    this.showAddSectionMenu = false;
  }

  closeAllPanels(): void {
    this.showStyleEditor = false;
    this.showAddSectionMenu = false;
    this.showShortcuts = false;
    this.cvService.setDragMode(false);
    this.cvService.setResizeMode(false);
  }

  private setupKeyboardShortcuts(): void {
    // Keyboard shortcuts are handled by @HostListener
  }

  private setupAutoSave(): void {
    // Auto-save every 30 seconds if there are changes
    setInterval(() => {
      if (this.isDirty()) {
        this.autoSaving = true;
        this.saveCV();
        setTimeout(() => {
          this.autoSaving = false;
        }, 1000);
      }
    }, 30000);
  }

  private setupClickOutside(): void {
    // Click outside handling is done by @HostListener
  }
}