import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CVSection } from '../../models/cv.interface';
import { CVStateService } from '../../services/cv-state.service';
import { ThemeService } from '../../services/theme.service';
import { ModalService } from '../../services/modal.service';
import { EducationEditorComponent } from './education-editor/education-editor.component';
import { ExperienceEditorComponent } from './experience-editor/experience-editor.component';
import { PersonalInfoEditorComponent } from './personal-info-editor/personal-info-editor.component';
import { SkillsEditorComponent } from './skills-editor/skills-editor.component';
import { ContactComponent } from './contact/contact.component';
import { canAddItem, canRemoveItem, getMaxItems, getMinItems } from '../../config/section-limits.config';

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
    <div class="h-full flex flex-col bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <!-- Section Navigation -->
      <div class="border-b border-gray-200 dark:border-gray-700 px-4 pt-4">
        <h3 class="text-lg font-semibold mb-4">Édition du CV</h3>
      </div>

      <!-- Section Content -->
      <div class="flex-1 overflow-y-auto scrollbar-discrete p-4">
        <div [ngSwitch]="selectedSectionType()">
          <app-personal-info-editor
            *ngSwitchCase="'profile'"
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
          <div *ngSwitchCase="'languages'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-lg font-semibold">Langues</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ (currentCV()?.languages || []).length }} / {{ getMaxItems('languages') }} langues
                </p>
              </div>
              <button
                (click)="addLanguage()"
                [disabled]="!canAddLanguage()"
                [class.opacity-50]="!canAddLanguage()"
                [class.cursor-not-allowed]="!canAddLanguage()"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-plus mr-2"></i>
                Ajouter
              </button>
            </div>
            <div class="space-y-3">
              <div *ngFor="let language of currentCV()?.languages; trackBy: trackByLanguageId"
                   class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <input
                    [(ngModel)]="language.name"
                    (ngModelChange)="updateLanguage(language.id, {name: language.name})"
                    class="font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-300 rounded px-2 py-1 w-full"
                    placeholder="Nom de la langue">
                  <button
                    (click)="removeLanguage(language.id)"
                    [disabled]="!canRemoveLanguage()"
                    [class.opacity-50]="!canRemoveLanguage()"
                    [class.cursor-not-allowed]="!canRemoveLanguage()"
                    class="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    [title]="getRemoveLanguageButtonTitle()">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div class="mb-2">
                  <label class="block text-sm font-medium mb-1">
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
                  class="w-full text-sm bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-300 rounded px-2 py-1"
                  placeholder="Description du niveau (ex: Avancé C1)">
              </div>
            </div>
          </div>

          <!-- Interests Editor -->
          <div *ngSwitchCase="'interests'" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-lg font-semibold">Loisirs</h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ (currentCV()?.interests || []).length }} / {{ getMaxItems('interests') }} loisirs
                </p>
              </div>
              <button
                (click)="addInterest()"
                [disabled]="!canAddInterest()"
                [class.opacity-50]="!canAddInterest()"
                [class.cursor-not-allowed]="!canAddInterest()"
                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-plus mr-2"></i>
                Ajouter
              </button>
            </div>
            <div class="grid grid-cols-1 gap-3">
              <div *ngFor="let interest of currentCV()?.interests; trackBy: trackByInterestId"
                   class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center space-x-3">
                <select
                  [(ngModel)]="interest.icon"
                  (ngModelChange)="updateInterest(interest.id, {icon: interest.icon})"
                  class="text-lg bg-transparent border-none outline-none">
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
                  class="flex-1 bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-300 rounded px-2 py-1"
                  placeholder="Nom du loisir">
                <button
                  (click)="removeInterest(interest.id)"
                  [disabled]="!canRemoveInterest()"
                  [class.opacity-50]="!canRemoveInterest()"
                  [class.cursor-not-allowed]="!canRemoveInterest()"
                  class="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  [title]="getRemoveInterestButtonTitle()">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Custom Section Editor -->
          <div *ngSwitchCase="'custom'" class="space-y-4">
            <h4 class="text-lg font-semibold mb-4">Section personnalisée</h4>
            <ng-container *ngIf="selectedCustomSection() as customSection">
              <label class="block text-sm font-medium mb-1">Titre</label>
              <input [(ngModel)]="customSection.title"
                     (ngModelChange)="updateCustomSection(customSection.id, { title: customSection.title })"
                     class="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                     placeholder="Titre de la section">
              <label class="block text-sm font-medium mb-1">Contenu</label>
              <textarea [ngModel]="customSection.data?.content || ''"
                        (ngModelChange)="onCustomContentChange($event, customSection)"
                        class="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        placeholder="Contenu de la section personnalisée"></textarea>
            </ng-container>
          </div>

          <!-- Default Welcome Message -->
          <div *ngSwitchDefault class="p-6 text-center text-gray-500 dark:text-gray-400">
            <i class="fas fa-arrow-left text-4xl mb-4"></i>
            <h4 class="text-lg font-medium mb-2">Sélectionnez une section</h4>
            <p>Choisissez une section à droite pour commencer l'édition</p>
          </div>
        </div>
      </div>

      <!-- Navigation Arrows -->
      <div class="p-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          (click)="goToPreviousSection()"
          [disabled]="!canGoPrevious()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <i class="fas fa-arrow-left mr-2"></i> Précédent
        </button>
        <button
          (click)="goToNextSection()"
          [disabled]="!canGoNext()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Suivant <i class="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  `
})
export class SectionEditorComponent {
  private readonly cvService = inject(CVStateService);
  private readonly themeService = inject(ThemeService);
  private readonly modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  currentCV = this.cvService.currentCV;
  selectedSection = this.cvService.selectedSection;

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

  // --- Méthodes existantes ---
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
    const selectedId = this.selectedSection();
    if (!cv || !selectedId) return null;
    const section = cv.sections.find(s => s.id === selectedId);
    return section?.type || null;
  }

  ngOnInit(): void {
    const defaultSectionId = this.dynamicSections()[0]?.id;
    if (!this.selectedSection() && defaultSectionId) {
      this.selectSection(defaultSectionId);
    }
  }

  selectSection(sectionId: string) {
    if (this.cvService.showHelp()) {
      this.cvService.toggleHelp();
    }
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
    const languages = this.currentCV()?.languages || [];
    if (!canAddItem('languages', languages.length)) {
      this.modalService.showWarning(
        `Vous avez atteint le maximum de ${getMaxItems('languages')} langues.`,
        'Limite atteinte'
      );
      return;
    }
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
    const languages = this.currentCV()?.languages || [];
    if (!canRemoveItem('languages', languages.length)) {
      this.modalService.showWarning(
        `Vous devez conserver au minimum ${getMinItems('languages')} langue(s).`,
        'Limite minimale'
      );
      return;
    }
    this.cvService.removeLanguage(languageId);
  }

  canAddLanguage(): boolean {
    const languages = this.currentCV()?.languages || [];
    return canAddItem('languages', languages.length);
  }

  canRemoveLanguage(): boolean {
    const languages = this.currentCV()?.languages || [];
    return canRemoveItem('languages', languages.length);
  }

  // Interest methods
  addInterest(): void {
    const interests = this.currentCV()?.interests || [];
    if (!canAddItem('interests', interests.length)) {
      this.modalService.showWarning(
        `Vous avez atteint le maximum de ${getMaxItems('interests')} loisirs.`,
        'Limite atteinte'
      );
      return;
    }
    this.cvService.addInterest({
      name: 'Nouveau loisir',
      icon: 'fas fa-star',
      visible: true
    });
  }

  updateInterest(interestId: string, updates: any): void {
    const cv = this.currentCV();
    if (!cv) return;
    const interest = cv.interests.find(i => i.id === interestId);
    if (interest) {
      Object.assign(interest, updates);
    }
  }

  removeInterest(interestId: string): void {
    const interests = this.currentCV()?.interests || [];
    if (!canRemoveItem('interests', interests.length)) {
      this.modalService.showWarning(
        `Vous devez conserver au minimum ${getMinItems('interests')} loisir(s).`,
        'Limite minimale'
      );
      return;
    }
    this.cvService.removeInterest(interestId);
  }

  canAddInterest(): boolean {
    const interests = this.currentCV()?.interests || [];
    return canAddItem('interests', interests.length);
  }

  canRemoveInterest(): boolean {
    const interests = this.currentCV()?.interests || [];
    return canRemoveItem('interests', interests.length);
  }

  getMaxItems(sectionType: string): number {
    return getMaxItems(sectionType);
  }

  getMinItems(sectionType: string): number {
    return getMinItems(sectionType);
  }

  getRemoveLanguageButtonTitle(): string {
    if (this.canRemoveLanguage()) {
      return 'Supprimer la langue';
    }
    return `Minimum ${this.getMinItems('languages')} langue(s) requise(s)`;
  }

  getRemoveInterestButtonTitle(): string {
    if (this.canRemoveInterest()) {
      return 'Supprimer le loisir';
    }
    return `Minimum ${this.getMinItems('interests')} loisir(s) requis`;
  }

  // Custom section methods
  selectedCustomSection() {
    const cv = this.currentCV();
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
