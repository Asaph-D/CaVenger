import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';
import { ThemeService } from '../../../services/theme.service';
import { ExperienceItem } from '../../../models/cv.interface';

@Component({
  selector: 'app-experience-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div class="flex items-center justify-between mb-6">
        <h4 class="text-lg font-semibold">Expérience Professionnelle</h4>
        <button
          (click)="addExperience()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter
        </button>
      </div>

      <!-- Liste des expériences -->
      <div class="space-y-6">
        <div *ngFor="let exp of experiences; trackBy: trackByExperienceId"
             class="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">

          <!-- En-tête avec bouton de suppression -->
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-medium">Expérience {{ getExperienceIndex(exp.id) + 1 }}</h5>
            <button
              (click)="removeExperience(exp.id)"
              class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2"
              title="Supprimer l'expérience">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <!-- Informations de base -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Titre du poste *
              </label>
              <input
                type="text"
                [(ngModel)]="exp.title"
                (ngModelChange)="updateExperience(exp.id, {title: exp.title})"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Développeur Full Stack">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entreprise *
              </label>
              <input
                type="text"
                [(ngModel)]="exp.company"
                (ngModelChange)="updateExperience(exp.id, {company: exp.company})"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Nom de l'entreprise">
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lieu
            </label>
            <input
              type="text"
              [(ngModel)]="exp.location"
              (ngModelChange)="updateExperience(exp.id, {location: exp.location})"
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
                [(ngModel)]="exp.startDate"
                (ngModelChange)="updateExperience(exp.id, {startDate: exp.startDate})"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de fin
              </label>
              <input
                type="month"
                [(ngModel)]="exp.endDate"
                (ngModelChange)="updateExperience(exp.id, {endDate: exp.endDate})"
                [disabled]="exp.current"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-600">
            </div>
          </div>

          <div class="mb-4">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="exp.current"
                (ngModelChange)="updateExperience(exp.id, {current: exp.current, endDate: exp.current ? '' : exp.endDate})"
                class="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Poste actuel</span>
            </label>
          </div>

          <!-- Descriptions -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Missions et réalisations
            </label>

            <!-- Menu déroulant pour choisir le style de puce -->
            <div class="relative mb-2" *ngIf="exp.description.length > 0">
              <button
                (click)="toggleBulletMenu(exp.id)"
                class="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                <span class="mr-2">
                  <span *ngIf="exp.bulletStyle === 'disc'">●</span>
                  <span *ngIf="exp.bulletStyle === 'circle'">○</span>
                  <span *ngIf="exp.bulletStyle === 'square'">■</span>
                  <span *ngIf="exp.bulletStyle === 'arrow'">→</span>
                  <span *ngIf="exp.bulletStyle === 'dash'">-</span>
                  <span *ngIf="!exp.bulletStyle || exp.bulletStyle === 'none'">•</span>
                </span>
                <i class="fas fa-chevron-down text-xs"></i>
              </button>

              <!-- Menu déroulant des styles de puce -->
              <div *ngIf="activeBulletMenuId === exp.id"
                   class="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600">
                <div class="py-1">
                  <button (click)="setBulletStyle(exp.id, 'disc')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center">
                    <span class="mr-2">●</span> Puce ronde
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'circle')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center">
                    <span class="mr-2">○</span> Puce cercle
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'square')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center">
                    <span class="mr-2">■</span> Puce carré
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'arrow')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center">
                    <span class="mr-2">→</span> Flèche
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'dash')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center">
                    <span class="mr-2">-</span> Tiret
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'smallcircle')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span class="mr-2">◯</span> Petit cercle
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'star')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span class="mr-2">★</span> Étoile
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'check')" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <span class="mr-2">✔️</span> Cocher
                  </button>
                  <button (click)="setBulletStyle(exp.id, 'none')"
                          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    Aucune puce
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div *ngFor="let desc of exp.description; let i = index" class="flex items-start space-x-2">
                <span class="mt-2">
                  <span *ngIf="exp.bulletStyle === 'disc'">●</span>
                  <span *ngIf="exp.bulletStyle === 'circle'">○</span>
                  <span *ngIf="exp.bulletStyle === 'square'">■</span>
                  <span *ngIf="exp.bulletStyle === 'arrow'">→</span>
                  <span *ngIf="exp.bulletStyle === 'dash'">-</span>
                  <span *ngIf="exp.bulletStyle === 'smallcircle'">◯</span>
                  <span *ngIf="exp.bulletStyle === 'star'">★</span>
                  <span *ngIf="exp.bulletStyle === 'check'">✔️</span>
                  <span *ngIf="!exp.bulletStyle || exp.bulletStyle === 'none'">•</span>
                </span>
                <textarea
                  [(ngModel)]="exp.description[i]"
                  (ngModelChange)="updateExperience(exp.id, {description: exp.description})"
                  rows="2"
                  class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"></textarea>
                <button
                  (click)="removeDescription(exp.id, i)"
                  class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2 mt-1"
                  title="Supprimer cette description">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button
              (click)="addDescription(exp.id)"
              class="mt-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors text-sm">
              <i class="fas fa-plus mr-1"></i>
              Ajouter une mission
            </button>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div *ngIf="!experiences.length" class="text-center py-12">
        <i class="fas fa-briefcase text-4xl text-gray-300 dark:text-gray-500 mb-4"></i>
        <h5 class="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Aucune expérience ajoutée</h5>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Ajoutez vos expériences professionnelles pour valoriser votre parcours</p>
        <button
          (click)="addExperience()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter ma première expérience
        </button>
      </div>

      <!-- Conseils -->
      <div *ngIf="experiences.length > 0" class="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h5 class="font-medium text-yellow-900 dark:text-yellow-300 mb-2">
          <i class="fas fa-lightbulb mr-2"></i>
          Conseils pour vos expériences
        </h5>
        <ul class="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
          <li>• Commencez chaque mission par un verbe d'action</li>
          <li>• Quantifiez vos résultats quand c'est possible (ex: "Augmenté les ventes de 25%")</li>
          <li>• Utilisez des mots-clés pertinents pour votre secteur</li>
          <li>• Organisez vos expériences par ordre chronologique inverse</li>
        </ul>
      </div>
    </div>
  `
})
export class ExperienceEditorComponent {
  private readonly cvService = inject(CVStateService);
  private readonly themeService = inject(ThemeService);

  activeBulletMenuId: string | null = null;

  get experiences(): ExperienceItem[] {
    return this.cvService.currentCV()?.experience || [];
  }

  addExperience(): void {
    this.cvService.addExperience({
      title: 'Nouveau poste',
      company: 'Entreprise',
      location: 'Ville, Pays',
      startDate: '',
      endDate: '',
      current: false,
      bulletStyle: 'disc', // Style de puce par défaut
      description: ['Décrivez vos principales missions et réalisations...'],
      visible: true
    });
  }

  updateExperience(experienceId: string, updates: Partial<ExperienceItem>): void {
    this.cvService.updateExperience(experienceId, updates);
  }

  removeExperience(experienceId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
      this.cvService.removeExperience(experienceId);
    }
  }

  addDescription(experienceId: string): void {
    const experience = this.experiences.find(exp => exp.id === experienceId);
    if (experience) {
      experience.description.push('Nouvelle mission...');
      this.updateExperience(experienceId, { description: experience.description });
    }
  }

  removeDescription(experienceId: string, index: number): void {
    const experience = this.experiences.find(exp => exp.id === experienceId);
    if (experience && experience.description.length > 1) {
      experience.description.splice(index, 1);
      this.updateExperience(experienceId, { description: experience.description });
    }
  }

  getExperienceIndex(experienceId: string): number {
    return this.experiences.findIndex(exp => exp.id === experienceId);
  }

  trackByExperienceId(index: number, experience: ExperienceItem): string {
    return experience.id;
  }

  toggleBulletMenu(experienceId: string): void {
    this.activeBulletMenuId = this.activeBulletMenuId === experienceId ? null : experienceId;
  }

  setBulletStyle(experienceId: string, style: string): void {
    const experience = this.experiences.find(exp => exp.id === experienceId);
    if (experience) {
      this.updateExperience(experienceId, { bulletStyle: style });
      this.activeBulletMenuId = null; // Fermer le menu après sélection
    }
  }
}
