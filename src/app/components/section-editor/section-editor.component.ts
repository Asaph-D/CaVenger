import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CVSection } from '../../models/cv.interface';
import { CVStateService } from '../../services/cv-state.service';
import { EducationEditorComponent } from './education-editor/education-editor.component';
import { ExperienceEditorComponent } from './experience-editor/experience-editor.component';
import { PersonalInfoEditorComponent } from './personal-info-editor/personal-info-editor.component';
import { SkillsEditorComponent } from './skills-editor/skills-editor.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-section-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PersonalInfoEditorComponent,
    SkillsEditorComponent,
    ExperienceEditorComponent,
    EducationEditorComponent,
    ContactComponent
  ],
  template: `
    <div class="h-full flex flex-col relative z-51"> <!-- Added relative z-51 for greater authority -->
      <!-- Section Navigation -->
      <div class="border-b bg-gray-50 p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Édition du CV</h3>
        <div class="space-y-1 relative z-10"> <!-- Added relative z-10 here -->
          <button
            *ngFor="let section of dynamicSections()"
            (click)="selectSection(section.id); $event.stopPropagation()"
            class="w-full text-left px-3 py-2 rounded-lg transition-colors"
            [class.bg-purple-100]="selectedSection() === section.id"
            [class.text-purple-700]="selectedSection() === section.id"
            [class.hover:bg-gray-100]="selectedSection() !== section.id">
            <i [class]="section.icon + ' mr-2'"></i>
            {{ section.name }}
          </button>
        </div>
      </div>

      <!-- Display Message for selectSection call -->
      <div *ngIf="displayMessage" class="p-3 bg-blue-100 text-blue-800 rounded-md m-4 text-center">
        {{ displayMessage }}
      </div>

      <!-- Section Content -->
      <div class="flex-1 overflow-y-auto">
        <div [ngSwitch]="selectedSectionType()">
          
          <app-personal-info-editor
            *ngSwitchCase="'personal-info'"
            class="block">
          </app-personal-info-editor>

          <app-contact
            *ngSwitchCase="'contact'"
            class="block">
          </app-contact>

          <app-skills-editor
            *ngSwitchCase="'skills'"
            class="block">
          </app-skills-editor>

          <app-experience-editor
            *ngSwitchCase="'experience'"
            class="block">
          </app-experience-editor>

          <app-education-editor
            *ngSwitchCase="'education'"
            class="block">
          </app-education-editor>

          <!-- Languages Editor -->
          <div *ngSwitchCase="'languages'" class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-lg font-semibold text-gray-900">Langues</h4>
              <button
                (click)="addLanguage()"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                Ajouter
              </button>
            </div>

            <div class="space-y-4">
              <div *ngFor="let language of currentCV()?.languages; trackBy: trackByLanguageId"
                   class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-3">
                  <input
                    [(ngModel)]="language.name"
                    (ngModelChange)="updateLanguage(language.id, {name: language.name})"
                    class="font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-purple-300 focus:rounded px-2 py-1"
                    placeholder="Nom de la langue">
                  <button
                    (click)="removeLanguage(language.id)"
                    class="text-red-600 hover:text-red-800 transition-colors">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Niveau ({{ language.level }}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    [(ngModel)]="language.level"
                    (ngModelChange)="updateLanguage(language.id, {level: language.level})"
                    class="w-full">
                </div>
                <input
                  [(ngModel)]="language.levelDescription"
                  (ngModelChange)="updateLanguage(language.id, {levelDescription: language.levelDescription})"
                  class="w-full text-sm text-gray-600 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-purple-300 focus:rounded px-2 py-1"
                  placeholder="Description du niveau (ex: Avancé C1)">
              </div>
            </div>
          </div>

          <!-- Interests Editor -->
          <div *ngSwitchCase="'interests'" class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-lg font-semibold text-gray-900">Loisirs</h4>
              <button
                (click)="addInterest()"
                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                Ajouter
              </button>
            </div>

            <div class="grid grid-cols-1 gap-3">
              <div *ngFor="let interest of currentCV()?.interests; trackBy: trackByInterestId"
                   class="bg-gray-50 p-3 rounded-lg flex items-center space-x-3">
                <select
                  [(ngModel)]="interest.icon"
                  (ngModelChange)="updateInterest(interest.id, {icon: interest.icon})"
                  class="text-lg border-none bg-transparent outline-none">
                  <option value="fas fa-book">📚</option>
                  <option value="fas fa-plane">✈️</option>
                  <option value="fas fa-music">🎵</option>
                  <option value="fas fa-camera">📷</option>
                  <option value="fas fa-gamepad">🎮</option>
                  <option value="fas fa-running">🏃</option>
                  <option value="fas fa-palette">🎨</option>
                  <option value="fas fa-film">🎬</option>
                </select>
                <input
                  [(ngModel)]="interest.name"
                  (ngModelChange)="updateInterest(interest.id, {name: interest.name})"
                  class="flex-1 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-purple-300 focus:rounded px-2 py-1"
                  placeholder="Nom du loisir">
                <button
                  (click)="removeInterest(interest.id)"
                  class="text-red-600 hover:text-red-800 transition-colors">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Section Editor -->
          <div *ngSwitchCase="'custom'" class="p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Section personnalisée</h4>
            <ng-container *ngIf="selectedCustomSection() as customSection">
              <label class="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input [(ngModel)]="customSection.title"
                     (ngModelChange)="updateCustomSection(customSection.id, { title: customSection.title })"
                     class="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
                     placeholder="Titre de la section">
              <label class="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
              <textarea [ngModel]="customSection.data?.content || ''"
                        (ngModelChange)="onCustomContentChange($event, customSection)"
                        class="w-full min-h-[100px] px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
                        placeholder="Contenu de la section personnalisée"></textarea>
            </ng-container>
          </div>

          <!-- Default Welcome Message -->
          <div *ngSwitchDefault class="p-6 text-center">
            <i class="fas fa-arrow-left text-4xl text-gray-300 mb-4"></i>
            <h4 class="text-lg font-medium text-gray-600 mb-2">Sélectionnez une section</h4>
            <p class="text-gray-500">Choisissez une section à gauche pour commencer l'édition</p>
          </div>
        </div>
      </div>
      <!-- Navigation Arrows -->
      <div class="p-4 flex justify-between items-center border-t bg-gray-50">
        <button
          (click)="goToPreviousSection()"
          [disabled]="!canGoPrevious()"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <i class="fas fa-arrow-left mr-2"></i> Précédent
        </button>
        <button
          (click)="goToNextSection()"
          [disabled]="!canGoNext()"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Suivant <i class="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  `
})
export class SectionEditorComponent {
  private readonly cvService = inject(CVStateService);
  private cdr = inject(ChangeDetectorRef); // Keep cdr for potential future use or other components

  constructor() {
    console.log('[SectionEditorComponent] constructor fired');
  }

  currentCV = this.cvService.currentCV;
  // Using the service's selectedSection signal directly
  selectedSection = this.cvService.selectedSection;

  // Property to hold the message for UI display
  displayMessage: string | null = null;

  // Map section types to icons and display names
  private readonly sectionTypeMap: Record<string, { icon: string; name: string }> = {
    'personal-info': { icon: 'fas fa-user', name: 'Informations Personnelles' },
    'profile': { icon: 'fas fa-user', name: 'Profil Professionnel' },
    'skills': { icon: 'fas fa-star', name: 'Compétences' },
    'experience': { icon: 'fas fa-briefcase', name: 'Expérience' },
    'education': { icon: 'fas fa-graduation-cap', name: 'Formation' },
    'languages': { icon: 'fas fa-language', name: 'Langues' },
    'interests': { icon: 'fas fa-heart', name: 'Loisirs' },
    'contact': { icon: 'fas fa-address-book', name: 'Contact' },
    'custom': { icon: 'fas fa-puzzle-piece', name: 'Section personnalisée' }
  };

  dynamicSections(): Array<{ id: string, icon: string, name: string }> {
    const cv = this.currentCV();
    
    if (!cv?.sections) return [];
    return cv.sections
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        id: section.id,
        icon: this.sectionTypeMap[section.type]?.icon || 'fas fa-puzzle-piece',
        name: this.sectionTypeMap[section.type]?.name || section.title
      }));
  }

  selectedSectionType(): string | null {
    const cv = this.currentCV();
    // Use the selectedSection() signal directly
    const selectedId = this.selectedSection();
    if (!cv || !selectedId) return null;
    const section = cv.sections.find(s => s.id === selectedId);
    return section?.type || null;
  }

  ngOnInit(): void {
    const defaultSectionId = this.dynamicSections()[0]?.id;
    // Check if a section is already selected by the service, otherwise select the first dynamic one
    if (!this.selectedSection() && defaultSectionId) {
      console.log('Selecting default section:', defaultSectionId);
      this.selectSection(defaultSectionId);
    }
  }

  selectSection(sectionId: string) {
    console.log('[SectionEditor] selectSection called with:', sectionId);
    // Display the message on the UI
    this.displayMessage = `[SectionEditor] selectSection called with: ${sectionId}`;
    // Optionally, clear the message after a few seconds
    setTimeout(() => {
      this.displayMessage = null;
    }, 3000); // Message will disappear after 3 seconds

    // If help is active, toggle it off when a section is selected
    if (this.cvService.showHelp()) {
      this.cvService.toggleHelp();
    }

    // Update the selected section via the service, which manages the signal
    this.cvService.setSelectedSection(sectionId);
  }

  // Navigation methods
  goToNextSection(): void {
    const sections = this.dynamicSections();
    const currentSectionId = this.selectedSection();
    const currentIndex = sections.findIndex(s => s.id === currentSectionId);

    if (currentIndex > -1 && currentIndex < sections.length - 1) {
      this.selectSection(sections[currentIndex + 1].id);
    }
  }

  goToPreviousSection(): void {
    const sections = this.dynamicSections();
    const currentSectionId = this.selectedSection();
    const currentIndex = sections.findIndex(s => s.id === currentSectionId);

    if (currentIndex > 0) {
      this.selectSection(sections[currentIndex - 1].id);
    }
  }

  canGoNext(): boolean {
    const sections = this.dynamicSections();
    const currentSectionId = this.selectedSection();
    const currentIndex = sections.findIndex(s => s.id === currentSectionId);
    return currentIndex > -1 && currentIndex < sections.length - 1;
  }

  canGoPrevious(): boolean {
    const sections = this.dynamicSections();
    const currentSectionId = this.selectedSection();
    const currentIndex = sections.findIndex(s => s.id === currentSectionId);
    return currentIndex > 0;
  }

  // Language methods
  addLanguage(): void {
    this.cvService.addLanguage({
      name: 'Nouvelle langue',
      level: 50,
      levelDescription: 'Intermédiaire',
      visible: true
    });
  }

  updateLanguage(languageId: string, updates: any): void {
    this.cvService.updateLanguage(languageId, updates);
  }

  removeLanguage(languageId: string): void {
    // Replaced `confirm` with a custom message to adhere to instructions.
    this.displayMessage = 'Functionality: Remove Language triggered. If this were a real app, a modal would appear here.';
    setTimeout(() => {
      this.displayMessage = null;
      this.cvService.removeLanguage(languageId); // Perform removal after the message disappears (or after user confirms in a real modal)
    }, 2000);
  }

  // Interest methods
  addInterest(): void {
    this.cvService.addInterest({
      name: 'Nouveau loisir',
      icon: 'fas fa-star',
      visible: true
    });
  }

  updateInterest(interestId: string, updates: any): void {
    // Find and update the interest
    const cv = this.currentCV();
    if (!cv) return;

    const interest = cv.interests.find(i => i.id === interestId);
    if (interest) {
      Object.assign(interest, updates);
    }
  }

  removeInterest(interestId: string): void {
    // Replaced `confirm` with a custom message to adhere to instructions.
    this.displayMessage = 'Functionality: Remove Interest triggered. If this were a real app, a modal would appear here.';
    setTimeout(() => {
      this.displayMessage = null;
      this.cvService.removeInterest(interestId); // Perform removal after the message disappears (or after user confirms in a real modal)
    }, 2000);
  }

  // Custom section methods
  selectedCustomSection() {
    const cv = this.currentCV();
    // Use the selectedSection() signal directly
    const selectedId = this.selectedSection();
    if (!cv || !selectedId) return null;
    return cv.sections.find(s => s.id === selectedId && s.type === 'custom') || null;
  }

  onCustomContentChange(content: string, section: CVSection) {
    this.updateCustomSection(section.id, { data: { ...(section.data ?? {}), content } });
  }

  updateCustomSection(sectionId: string, updates: Partial<CVSection>) {
    const cv = this.currentCV();
    if (!cv) return;
    const section = cv.sections.find(s => s.id === sectionId);
    if (section) {
      Object.assign(section, updates);
      // Use the service's public method to trigger update
      (this.cvService as any).updateState({ currentCV: { ...cv }, isDirty: true });
    }
  }

  // TrackBy functions for performance
  trackByLanguageId(index: number, item: any): string {
    return item.id;
  }

  trackByInterestId(index: number, item: any): string {
    return item.id;
  }
}
