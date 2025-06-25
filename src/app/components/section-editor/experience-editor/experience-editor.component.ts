import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';
import { ExperienceItem } from '../../../models/cv.interface';

@Component({
  selector: 'app-experience-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <h4 class="text-lg font-semibold text-gray-900">Expérience Professionnelle</h4>
        <button 
          (click)="addExperience()"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter
        </button>
      </div>

      <!-- Experience List -->
      <div class="space-y-6">
        <div *ngFor="let exp of experiences; trackBy: trackByExperienceId" 
             class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          
          <!-- Header with delete button -->
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-medium text-gray-900">Experience {{ getExperienceIndex(exp.id) + 1 }}</h5>
            <button 
              (click)="removeExperience(exp.id)"
              class="text-red-600 hover:text-red-800 transition-colors p-2"
              title="Supprimer l'expérience">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Titre du poste *
              </label>
              <input 
                type="text"
                [(ngModel)]="exp.title"
                (ngModelChange)="updateExperience(exp.id, {title: exp.title})"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Développeur Full Stack">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Entreprise *
              </label>
              <input 
                type="text"
                [(ngModel)]="exp.company"
                (ngModelChange)="updateExperience(exp.id, {company: exp.company})"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nom de l'entreprise">
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Lieu
            </label>
            <input 
              type="text"
              [(ngModel)]="exp.location"
              (ngModelChange)="updateExperience(exp.id, {location: exp.location})"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ville, Pays">
          </div>

          <!-- Dates -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input 
                type="month"
                [(ngModel)]="exp.startDate"
                (ngModelChange)="updateExperience(exp.id, {startDate: exp.startDate})"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input 
                type="month"
                [(ngModel)]="exp.endDate"
                (ngModelChange)="updateExperience(exp.id, {endDate: exp.endDate})"
                [disabled]="exp.current"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100">
            </div>
          </div>

          <div class="mb-4">
            <label class="flex items-center">
              <input 
                type="checkbox"
                [(ngModel)]="exp.current"
                (ngModelChange)="updateExperience(exp.id, {current: exp.current, endDate: exp.current ? '' : exp.endDate})"
                class="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
              <span class="text-sm font-medium text-gray-700">Poste actuel</span>
            </label>
          </div>

          <!-- Descriptions -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Missions et réalisations
            </label>
            <div class="space-y-2">
              <div *ngFor="let desc of exp.description; let i = index" class="flex items-start space-x-2">
                <span class="text-gray-400 mt-2">•</span>
                <textarea 
                  [(ngModel)]="exp.description[i]"
                  (ngModelChange)="updateExperience(exp.id, {description: exp.description})"
                  rows="2"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Décrivez vos missions et réalisations..."></textarea>
                <button 
                  (click)="removeDescription(exp.id, i)"
                  class="text-red-600 hover:text-red-800 transition-colors p-2 mt-1"
                  title="Supprimer cette description">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <button 
              (click)="addDescription(exp.id)"
              class="mt-2 text-purple-600 hover:text-purple-800 transition-colors text-sm">
              <i class="fas fa-plus mr-1"></i>
              Ajouter une mission
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!experiences.length" class="text-center py-12">
        <i class="fas fa-briefcase text-4xl text-gray-300 mb-4"></i>
        <h5 class="text-lg font-medium text-gray-600 mb-2">Aucune expérience ajoutée</h5>
        <p class="text-gray-500 mb-4">Ajoutez vos expériences professionnelles pour valoriser votre parcours</p>
        <button 
          (click)="addExperience()"
          class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter ma première expérience
        </button>
      </div>

      <!-- Tips -->
      <div *ngIf="experiences.length > 0" class="mt-8 p-4 bg-yellow-50 rounded-lg">
        <h5 class="font-medium text-yellow-900 mb-2">
          <i class="fas fa-lightbulb mr-2"></i>
          Conseils pour vos expériences
        </h5>
        <ul class="text-sm text-yellow-800 space-y-1">
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
}