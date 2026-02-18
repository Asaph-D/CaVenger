import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';
import { ThemeService } from '../../../services/theme.service';
import { ModalService } from '../../../services/modal.service';
import { EducationItem } from '../../../models/cv.interface';
import { canAddItem, canRemoveItem, getMaxItems, getMinItems } from '../../../config/section-limits.config';

@Component({
  selector: 'app-education-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h4 class="text-lg font-semibold">Formation Académique</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ educations.length }} / {{ getMaxItems('education') }} formations
          </p>
        </div>
        <button
          (click)="addEducation()"
          [disabled]="!canAdd()"
          [class.opacity-50]="!canAdd()"
          [class.cursor-not-allowed]="!canAdd()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <i class="fas fa-plus mr-2"></i>
          Ajouter
        </button>
      </div>

      <!-- Liste des formations -->
      <div class="space-y-6">
        <div *ngFor="let edu of educations; trackBy: trackByEducationId"
             class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">

          <!-- En-tête avec bouton de suppression -->
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-medium">Formation {{ getEducationIndex(edu.id) + 1 }}</h5>
            <button
              (click)="removeEducation(edu.id)"
              [disabled]="!canRemove()"
              [class.opacity-50]="!canRemove()"
              [class.cursor-not-allowed]="!canRemove()"
              class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              [title]="getRemoveButtonTitle()">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <!-- Informations de base -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Diplôme *
              </label>
              <input
                type="text"
                [(ngModel)]="edu.degree"
                (ngModelChange)="updateEducation(edu.id, {degree: edu.degree})"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Master en Informatique">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Institution *
              </label>
              <input
                type="text"
                [(ngModel)]="edu.institution"
                (ngModelChange)="updateEducation(edu.id, {institution: edu.institution})"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Nom de l'établissement">
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lieu
            </label>
            <input
              type="text"
              [(ngModel)]="edu.location"
              (ngModelChange)="updateEducation(edu.id, {location: edu.location})"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Ville, Pays">
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de début *
              </label>
              <input
                type="month"
                [(ngModel)]="edu.startDate"
                (ngModelChange)="updateEducation(edu.id, {startDate: edu.startDate})"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de fin
              </label>
              <input
                type="month"
                [(ngModel)]="edu.endDate"
                (ngModelChange)="updateEducation(edu.id, {endDate: edu.endDate})"
                [disabled]="edu.current"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600">
            </div>
          </div>

          <div class="mb-4">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="edu.current"
                (ngModelChange)="updateEducation(edu.id, {current: edu.current, endDate: edu.current ? '' : edu.endDate})"
                class="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Formation en cours</span>
            </label>
          </div>

          <!-- Informations supplémentaires -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mention/Note
              </label>
              <select
                [(ngModel)]="edu.grade"
                (ngModelChange)="updateEducation(edu.id, {grade: edu.grade})"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">-- Sélectionner --</option>
                <option value="Très bien">Très bien</option>
                <option value="Bien">Bien</option>
                <option value="Assez bien">Assez bien</option>
                <option value="Passable">Passable</option>
                <option value="Summa Cum Laude">Summa Cum Laude</option>
                <option value="Magna Cum Laude">Magna Cum Laude</option>
                <option value="Cum Laude">Cum Laude</option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (optionnel)
            </label>
            <textarea
              [(ngModel)]="edu.description"
              (ngModelChange)="updateEducation(edu.id, {description: edu.description})"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              placeholder="Spécialisation, projets importants, cours pertinents..."></textarea>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div *ngIf="!educations.length" class="text-center py-12">
        <i class="fas fa-graduation-cap text-4xl text-gray-300 dark:text-gray-500 mb-4"></i>
        <h5 class="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Aucune formation ajoutée</h5>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Ajoutez vos formations pour mettre en valeur votre parcours académique</p>
        <button
          (click)="addEducation()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter ma première formation
        </button>
      </div>

      <!-- Guide des niveaux de formation -->
      <div *ngIf="educations.length > 0" class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h5 class="font-medium text-blue-900 dark:text-blue-300 mb-3">
          <i class="fas fa-info-circle mr-2"></i>
          Guide des niveaux de formation
        </h5>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-300">
          <div>
            <p><strong>Bac +2:</strong> BTS, DUT, DEUG</p>
            <p><strong>Bac +3:</strong> Licence, Bachelor</p>
            <p><strong>Bac +5:</strong> Master, Ingénieur</p>
          </div>
          <div>
            <p><strong>Bac +8:</strong> Doctorat, PhD</p>
            <p><strong>Formations courtes:</strong> Certificats, MOOC</p>
            <p><strong>Formations pro:</strong> CAP, BEP</p>
          </div>
        </div>
      </div>

      <!-- Conseils -->
      <div *ngIf="educations.length > 0" class="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h5 class="font-medium text-green-900 dark:text-green-300 mb-2">
          <i class="fas fa-lightbulb mr-2"></i>
          Conseils pour vos formations
        </h5>
        <ul class="text-sm text-green-800 dark:text-green-300 space-y-1">
          <li>• Listez vos formations par ordre chronologique inverse</li>
          <li>• Mentionnez les spécialisations pertinentes pour le poste visé</li>
          <li>• Incluez les formations continues et certifications</li>
          <li>• N'hésitez pas à mentionner des projets académiques marquants</li>
        </ul>
      </div>
    </div>
  `
})
export class EducationEditorComponent {
  private cvService = inject(CVStateService);
  private themeService = inject(ThemeService);
  private modalService = inject(ModalService);

  get educations(): EducationItem[] {
    return this.cvService.currentCV()?.education || [];
  }

  addEducation(): void {
    if (!this.canAdd()) {
      this.modalService.showWarning(
        `Vous avez atteint le maximum de ${getMaxItems('education')} formations.`,
        'Limite atteinte'
      );
      return;
    }
    this.cvService.addEducation({
      degree: 'Nouveau diplôme',
      institution: 'Institution',
      location: 'Ville, Pays',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      grade: '',
      visible: true
    });
  }

  updateEducation(educationId: string, updates: Partial<EducationItem>): void {
    this.cvService.updateEducation(educationId, updates);
  }

  removeEducation(educationId: string): void {
    if (!this.canRemove()) {
      this.modalService.showWarning(
        `Vous devez conserver au minimum ${getMinItems('education')} formation(s).`,
        'Limite minimale'
      );
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.cvService.removeEducation(educationId);
    }
  }

  canAdd(): boolean {
    return canAddItem('education', this.educations.length);
  }

  canRemove(): boolean {
    return canRemoveItem('education', this.educations.length);
  }

  getMaxItems(sectionType: string): number {
    return getMaxItems(sectionType);
  }

  getMinItems(sectionType: string): number {
    return getMinItems(sectionType);
  }

  getRemoveButtonTitle(): string {
    if (this.canRemove()) {
      return 'Supprimer la formation';
    }
    return `Minimum ${this.getMinItems('education')} formation(s) requise(s)`;
  }

  getEducationIndex(educationId: string): number {
    return this.educations.findIndex(edu => edu.id === educationId);
  }

  trackByEducationId(index: number, education: EducationItem): string {
    return education.id;
  }
}
