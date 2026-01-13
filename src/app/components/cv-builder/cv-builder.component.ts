import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CVStateService } from '../../services/cv-state.service';
import { ThemeService } from '../../services/theme.service';
import { CVPreviewComponent } from '../cv-preview/cv-preview.component';
import { CvTemplateSelectorComponent } from '../home/components/cv-template-selector/cv-template-selector.component';
import { SectionEditorComponent } from '../section-editor/section-editor.component';
import { StyleEditorComponent } from '../style-editor/style-editor.component';

@Component({
  selector: 'app-cv-builder',
  standalone: true,
  imports: [
    CommonModule,
    CVPreviewComponent,
    StyleEditorComponent,
    SectionEditorComponent,
    CvTemplateSelectorComponent
  ],
  animations: [
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
  styles: [`
    /* Animations */
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out forwards;
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    .animate-bounce-in {
      animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    /* Mobile Tab Navigation */
    .mobile-tabs {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #e5e7eb;
      z-index: 50;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }
    @media (max-width: 768px) {
      .mobile-tabs {
        display: flex;
      }
      .desktop-only {
        display: none !important;
      }
      .mobile-view-container {
        padding-bottom: 60px;
      }
    }
    .tab-button {
      flex: 1;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      border: none;
      background: transparent;
      color: #6b7280;
      font-size: 0.75rem;
      transition: all 0.2s;
    }
    .tab-button.active {
      color: #3b82f6;
      background: #eff6ff;
    }
    .tab-button i {
      font-size: 1.25rem;
    }
    /* Style des raccourcis clavier */
    kbd {
      font-family: monospace;
      font-size: 0.75rem;
      background: rgba(0, 0, 0, 0.1);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    /* Style des boutons flottants */
    .floating-button {
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .floating-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    /* Style des panneaux */
    .panel {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    /* Style des sections */
    .section-header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    /* Style des menus contextuels */
    .context-menu {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border-radius: 0.5rem;
      overflow: hidden;
    }
    /* Style des indicateurs */
    .status-indicator {
      position: fixed;
      z-index: 1000;
      animation: fade-in 0.3s ease-out;
    }
    /* Boutons uniformes */
    .btn {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background-color: #2563eb;
      color: white;
    }
    .btn-primary:hover {
      background-color: #1d4ed8;
    }
    .btn-secondary {
      color: #4b5563;
    }
    .btn-secondary:hover {
      background-color: #f3f4f6;
    }
    .dark-theme .btn-secondary:hover {
      background-color: #374151;
    }
    /* Thème sombre */
    .dark-theme {
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
    }
    .dark-theme .bg-white {
      background-color: rgba(30, 41, 55, 1);
    }
    .dark-theme .text-gray-900 {
      color: white;
    }
    .dark-theme .text-gray-600 {
      color: rgba(209, 213, 219, 0.8);
    }
    .dark-theme .hover\\:text-gray-900:hover {
      color: white;
    }
    .dark-theme .border-gray-200 {
      border-color: rgba(75, 85, 99, 0.5);
    }
    .dark-theme .bg-gray-100 {
      background-color: rgba(30, 41, 55, 0.5);
    }
    .dark-theme .bg-gray-50 {
      background-color: rgba(17, 24, 39, 1);
    }
    .dark-theme .bg-gray-200 {
      background-color: rgba(75, 85, 99, 0.5);
    }
    .dark-theme .hover\\:bg-gray-50:hover {
      background-color: rgba(30, 41, 55, 0.7);
    }
    /* CV Mobile Container */
    @media (max-width: 768px) {
      /* Dans la section @media (max-width: 768px) */
      .cv-mobile-container {
        display: flex;
        flex-direction: row; /* Affichage en ligne (côte à côte) */
        width: 100%;
        height: auto;
      }
      .cv-left-column {
        flex: 1;
        padding-right: 1rem;
      }
      .cv-right-column {
        flex: 1;
        padding-left: 1rem;
      }
    }
  `],
  template: `
    <div class="relative min-h-screen" [class.dark-theme]="themeService.isDarkMode()">
      <!-- Header Desktop -->
      <header class="desktop-only bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-4">
              <button (click)="goHome()" class="flex items-center text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                <span>Retour</span>
              </button>
              <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 class="text-xl font-medium text-gray-900 dark:text-white">
                {{ currentCV()?.personalInfo?.firstName }} {{ currentCV()?.personalInfo?.lastName }}
              </h1>
              <div *ngIf="isDirty()" class="flex items-center text-amber-500 dark:text-amber-400 animate-pulse">
                <i class="fas fa-circle text-xs mr-1"></i>
                <span class="text-sm">Non sauvegardé</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button (click)="themeService.toggleTheme()" class="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <i [class]="themeService.isDarkMode() ? 'fas fa-sun text-yellow-400' : 'fas fa-moon text-gray-500'" class="mr-2"></i>
                <span>{{ themeService.isDarkMode() ? 'Mode Clair' : 'Mode Sombre' }}</span>
              </button>
              <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                <button (click)="setViewMode('edit')" [ngClass]="{'bg-white text-gray-900': viewMode === 'edit' && !themeService.isDarkMode(), 'bg-gray-600 text-white': viewMode === 'edit' && themeService.isDarkMode()}" class="px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center">
                  <i class="fas fa-edit mr-1"></i>
                  <span>Édition</span>
                </button>
                <button (click)="setViewMode('preview')" [ngClass]="{'bg-white text-gray-900': viewMode === 'preview' && !themeService.isDarkMode(), 'bg-gray-600 text-white': viewMode === 'preview' && themeService.isDarkMode()}" class="px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center">
                  <i class="fas fa-eye mr-1"></i>
                  <span>Aperçu</span>
                </button>
              </div>
              <button (click)="toggleStyleEditor()" [ngClass]="{'bg-purple-100 text-purple-700': showStyleEditor && !themeService.isDarkMode(), 'bg-purple-900 text-purple-200': showStyleEditor && themeService.isDarkMode()}" class="flex items-center px-3 py-2 rounded-lg transition-colors">
                <i class="fas fa-palette mr-2"></i>
                <span>Style</span>
              </button>
              <button (click)="toggleHelp()" [ngClass]="{'bg-blue-100 text-blue-700': showHelp() && !themeService.isDarkMode(), 'bg-blue-900 text-blue-200': showHelp() && themeService.isDarkMode()}" class="flex items-center px-3 py-2 rounded-lg transition-colors">
                <i class="fas fa-question-circle mr-2"></i>
                <span>Aide</span>
              </button>
              <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <button (click)="saveCV()" class="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                <i class="fas fa-save mr-2"></i>
                <span>Sauvegarder</span>
              </button>
              <button (click)="exportPDF()" [disabled]="isExporting" class="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50">
                <i [class]="isExporting ? 'fas fa-spinner fa-spin' : 'fas fa-download'" class="mr-2"></i>
                <span>{{ isExporting ? 'Export...' : 'PDF' }}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <!-- Header Mobile -->
      <header class="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div class="px-2 py-2">
          <div class="flex items-center justify-between">
            <button (click)="goHome()" class="p-2 text-gray-700 dark:text-gray-200">
              <i class="fas fa-arrow-left text-lg"></i>
            </button>
            <h1 class="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 mx-2">
              {{ currentCV()?.personalInfo?.firstName }} {{ currentCV()?.personalInfo?.lastName }}
            </h1>
            <div class="flex items-center gap-1">
              <button (click)="saveCV()" class="p-2 bg-green-600 text-white rounded-lg" title="Sauvegarder">
                <i class="fas fa-save text-sm"></i>
              </button>
              <button (click)="exportPDF()" [disabled]="isExporting" class="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50" title="Export PDF">
                <i [class]="isExporting ? 'fas fa-spinner fa-spin text-sm' : 'fas fa-download text-sm'"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
      <!-- Contenu principal - Desktop -->
      <div class="hidden md:flex h-[calc(100vh-4rem)]">
        <div *ngIf="viewMode === 'edit'" class="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-600 overflow-y-auto transition-all duration-300 panel">
          <app-section-editor></app-section-editor>
        </div>
        <div class="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-8 transition-all duration-300 panel" [class.w-full]="viewMode === 'preview'" [ngClass]="{'w-2/3': viewMode === 'edit'}">
          <div class="max-w-4xl mx-auto">
            <app-cv-preview></app-cv-preview>
          </div>
        </div>
        <div *ngIf="showStyleEditor" class="w-1/4 bg-white dark:bg-gray-800 border-l border-gray-600 overflow-y-auto animate-slide-in-right panel">
          <app-style-editor></app-style-editor>
        </div>
      </div>
      <!-- Contenu principal - Mobile -->
      <div class="md:hidden mobile-view-container" [ngSwitch]="mobileView">
        <div *ngSwitchCase="'edit'" class="h-[calc(100vh-7rem)] overflow-y-auto bg-white dark:bg-gray-800">
          <app-section-editor></app-section-editor>
        </div>
        <div *ngSwitchCase="'preview'" class="h-[calc(100vh-7rem)] overflow-y-auto bg-gray-100 dark:bg-gray-900 p-2">
          <div class="cv-mobile-container">
            <app-cv-preview></app-cv-preview>
          </div>
        </div>
        <div *ngSwitchCase="'style'" class="h-[calc(100vh-7rem)] overflow-y-auto bg-white dark:bg-gray-800">
          <app-style-editor></app-style-editor>
        </div>
        <div *ngSwitchCase="'more'" class="h-[calc(100vh-7rem)] overflow-y-auto bg-white dark:bg-gray-800 p-4">
          <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
          <div class="space-y-2">
            <button (click)="themeService.toggleTheme()" class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i [class]="themeService.isDarkMode() ? 'fas fa-sun mr-3' : 'fas fa-moon mr-3'"></i>
                {{ themeService.isDarkMode() ? 'Mode Clair' : 'Mode Sombre' }}
              </span>
            </button>
            <button (click)="toggleHelp()" class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-question-circle mr-3"></i>
                Aide
              </span>
            </button>
            <!-- Dans la section "Plus" de la vue mobile -->
            <button
              (click)="toggleAddSectionMenu($event)"
              class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-plus-circle mr-3"></i>
                Ajouter une section
              </span>
            </button>
            <div *ngIf="showAddSectionMenu" class="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-600 py-2 min-w-48 context-menu animate-bounce-in">
              <button
                *ngFor="let sectionType of availableSectionTypes"
                (click)="addSection(sectionType.type, sectionType.position); $event.stopPropagation()"
                class="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center transition-colors">
                <i [class]="sectionType.icon + ' mr-3 text-gray-500 dark:text-gray-300'"></i>
                <span>{{ sectionType.name }}</span>
              </button>
            </div>

            <button (click)="toggleDragMode()" class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-arrows-alt mr-3"></i>
                Mode déplacement
              </span>
              <span *ngIf="dragMode()" class="text-green-600"><i class="fas fa-check"></i></span>
            </button>
            <button (click)="toggleResizeMode()" class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-expand-arrows-alt mr-3"></i>
                Mode redimensionnement
              </span>
              <span *ngIf="resizeMode()" class="text-green-600"><i class="fas fa-check"></i></span>
            </button>
            <div *ngIf="isDirty()" class="w-full p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div class="flex items-center text-amber-700 dark:text-amber-400">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span class="text-sm">Modifications non sauvegardées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Navigation Mobile -->
      <nav class="mobile-tabs">
        <button (click)="setMobileView('edit')" [class.active]="mobileView === 'edit'" class="tab-button">
          <i class="fas fa-edit"></i>
          <span>Éditer</span>
        </button>
        <button (click)="setMobileView('preview')" [class.active]="mobileView === 'preview'" class="tab-button">
          <i class="fas fa-eye"></i>
          <span>Aperçu</span>
        </button>
        <button (click)="setMobileView('style')" [class.active]="mobileView === 'style'" class="tab-button">
          <i class="fas fa-palette"></i>
          <span>Style</span>
        </button>
        <button (click)="setMobileView('more')" [class.active]="mobileView === 'more'" class="tab-button">
          <i class="fas fa-ellipsis-h"></i>
          <span>Plus</span>
        </button>
      </nav>
      <!-- Boutons flottants (Desktop seulement) -->
      <div class="hidden md:flex fixed bottom-6 right-6 flex-col space-y-4 z-50">
        <div class="relative group">
          <button (click)="toggleAddSectionMenu($event)" class="floating-button bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105" title="Ajouter une section">
            <i class="fas fa-plus"></i>
          </button>
          <div *ngIf="showAddSectionMenu" class="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-600 py-2 min-w-48 context-menu animate-bounce-in" style="z-index: 1001;">
            <button *ngFor="let sectionType of availableSectionTypes" (click)="addSection(sectionType.type, sectionType.position); $event.stopPropagation()" class="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center transition-colors">
              <i [class]="sectionType.icon + ' mr-3 text-gray-500 dark:text-gray-300'"></i>
              <span>{{ sectionType.name }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Indicateurs -->
      <div *ngIf="autoSaving" class="fixed bottom-6 left-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in status-indicator">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        Sauvegarde automatique...
      </div>
      <div *ngIf="isExporting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in">
          <div class="flex items-center">
            <i class="fas fa-spinner fa-spin text-blue-600 mr-3"></i>
            <span class="text-gray-800 dark:text-white">Génération du PDF en cours...</span>
          </div>
        </div>
      </div>
    </div>
    <app-cv-template-selector 
      (templateSelected)="onTemplateSelected($event)">
    </app-cv-template-selector>
  `
})
export class CVBuilderComponent implements OnInit {
  private readonly cvService = inject(CVStateService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly themeService = inject(ThemeService);
  @ViewChild(CVPreviewComponent) cvPreviewComponent?: CVPreviewComponent;

  currentCV = this.cvService.currentCV;
  isDirty = this.cvService.isDirty;
  dragMode = this.cvService.dragMode;
  resizeMode = this.cvService.resizeMode;
  showHelp = this.cvService.showHelp;
  viewMode: 'edit' | 'preview' = 'edit';
  mobileView: 'edit' | 'preview' | 'style' | 'more' = 'preview';
  showStyleEditor = false;
  autoSaving = false;
  showShortcuts = false;
  showAddSectionMenu = false;
  isExporting = false;

  availableSectionTypes = [
    { type: 'profile', name: 'Profil Professionnel', icon: 'fas fa-user', position: 'right' as const },
    { type: 'personal-info', name: 'Informations Personnelles', icon: 'fas fa-id-card', position: 'right' as const },
    { type: 'experience', name: 'Expérience', icon: 'fas fa-briefcase', position: 'right' as const },
    { type: 'education', name: 'Formation', icon: 'fas fa-graduation-cap', position: 'right' as const },
    { type: 'skills', name: 'Compétences', icon: 'fas fa-star', position: 'left' as const },
    { type: 'languages', name: 'Langues', icon: 'fas fa-language', position: 'left' as const },
    { type: 'interests', name: 'Loisirs', icon: 'fas fa-heart', position: 'left' as const },
    { type: 'contact', name: 'Contact', icon: 'fas fa-address-card', position: 'left' as const },
    { type: 'custom', name: 'Section Personnalisée', icon: 'fas fa-plus-circle', position: 'right' as const }
  ];

  ngOnInit(): void {
    if (!this.currentCV()) {
      this.router.navigate(['/']);
      return;
    }
    this.cvService.setEditing(true);
    this.setupKeyboardShortcuts();
    this.setupAutoSave();
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
    const isMenuClick = target.closest('.context-menu');
    const isButtonClick = target.closest('button[title="Ajouter une section"]');
    if (!isMenuClick && !isButtonClick) {
      this.showAddSectionMenu = false;
      this.cdr.detectChanges();
    }
  }

  setMobileView(view: 'edit' | 'preview' | 'style' | 'more'): void {
    this.mobileView = view;
  }

  toggleAddSectionMenu(event: Event): void {
    event.stopPropagation();
    this.showAddSectionMenu = !this.showAddSectionMenu;
    this.cdr.detectChanges();
  }

  addSection(sectionType: string, position: 'left' | 'right'): void {
    if (this.cvPreviewComponent) {
      this.cvPreviewComponent.addNewSection(sectionType, position);
      this.showAddSectionMenu = false;
      this.cdr.detectChanges();
    }
  }

  toggleDragMode(): void {
    const newDragMode = !this.dragMode();
    this.cvService.setDragMode(newDragMode);
    if (newDragMode) {
      this.cvService.setResizeMode(false);
    }
    this.cdr.detectChanges();
  }

  toggleResizeMode(): void {
    const newResizeMode = !this.resizeMode();
    this.cvService.setResizeMode(newResizeMode);
    if (newResizeMode) {
      this.cvService.setDragMode(false);
    }
    this.cdr.detectChanges();
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
      this.cdr.detectChanges();
    }
  }

  toggleStyleEditor(): void {
    this.showStyleEditor = !this.showStyleEditor;
  }

  onTemplateSelected(templateId: string) {
    console.log('Template sélectionné:', templateId);
    // Logique de sélection
  }

  toggleHelp(): void {
    const newState = this.cvService.toggleHelp();
    if (newState) {
      setTimeout(() => {
        this.cvPreviewComponent?.startHelpTips();
      }, 0);
      this.showShortcuts = true;
      setTimeout(() => {
        this.showShortcuts = false;
        this.cdr.detectChanges();
      }, 5000);
    } else {
      this.cvService.setHelp(false);
      this.cdr.detectChanges();
    }
  }

  closeAllPanels(): void {
    this.showStyleEditor = false;
    this.showAddSectionMenu = false;
    this.showShortcuts = false;
    this.cvService.setDragMode(false);
    this.cvService.setResizeMode(false);
    this.cdr.detectChanges();
  }

  private setupKeyboardShortcuts(): void {}

  private setupAutoSave(): void {
    setInterval(() => {
      if (this.isDirty()) {
        this.autoSaving = true;
        this.saveCV();
        setTimeout(() => {
          this.autoSaving = false;
          this.cdr.detectChanges();
        }, 1000);
      }
    }, 30000);
  }
}
