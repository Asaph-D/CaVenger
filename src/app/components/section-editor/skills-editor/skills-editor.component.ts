import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';
import { ThemeService } from '../../../services/theme.service';
import { Skill } from '../../../models/cv.interface';

@Component({
  selector: 'app-skills-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div class="flex items-center justify-between mb-6">
        <h4 class="text-lg font-semibold">Compétences</h4>
        <button
          (click)="addSkill()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter
        </button>
      </div>

      <!-- Liste des compétences -->
      <div class="space-y-4">
        <div *ngFor="let skill of skills; trackBy: trackBySkillId"
             class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">

          <div class="flex items-center justify-between mb-3">
            <input
              [(ngModel)]="skill.name"
              (ngModelChange)="updateSkill(skill.id, {name: skill.name})"
              class="font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 flex-1 mr-4 text-gray-900 dark:text-gray-100"
              placeholder="Nom de la compétence">
            <button
              (click)="removeSkill(skill.id)"
              class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors p-2"
              title="Supprimer la compétence">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <div class="mb-3">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Niveau de maîtrise
              </label>
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ skill.level }}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              [(ngModel)]="skill.level"
              (ngModelChange)="updateSkill(skill.id, {level: skill.level})"
              class="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer">
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Débutant</span>
              <span>Intermédiaire</span>
              <span>Avancé</span>
              <span>Expert</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie (optionnel)
            </label>
            <select
              [(ngModel)]="skill.category"
              (ngModelChange)="updateSkill(skill.id, {category: skill.category})"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option value="">-- Sélectionner une catégorie --</option>
              <option value="Technique">Technique</option>
              <option value="Logiciels">Logiciels</option>
              <option value="Langages">Langages de programmation</option>
              <option value="Frameworks">Frameworks</option>
              <option value="Outils">Outils</option>
              <option value="Soft Skills">Compétences relationnelles</option>
              <option value="Gestion">Gestion</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div *ngIf="!skills.length" class="text-center py-12">
        <i class="fas fa-star text-4xl text-gray-300 dark:text-gray-500 mb-4"></i>
        <h5 class="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Aucune compétence ajoutée</h5>
        <p class="text-gray-500 dark:text-gray-400 mb-4">Commencez par ajouter vos compétences principales</p>
        <button
          (click)="addSkill()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter ma première compétence
        </button>
      </div>

      <!-- Résumé par catégorie -->
      <div *ngIf="skills.length > 0" class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h5 class="font-medium text-blue-900 dark:text-blue-300 mb-3">Résumé par catégorie</h5>
        <div class="grid grid-cols-2 gap-4">
          <div *ngFor="let category of getSkillCategories()" class="text-sm">
            <span class="font-medium text-blue-800 dark:text-blue-300">{{ category.name }}:</span>
            <span class="text-blue-600 dark:text-blue-400 ml-1">{{ category.count }} compétence(s)</span>
          </div>
        </div>
      </div>

      <!-- Suggestions de compétences -->
      <div class="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <h5 class="font-medium text-green-900 dark:text-green-300 mb-3">Suggestions de compétences</h5>
        <div class="flex flex-wrap gap-2">
          <button
            *ngFor="let suggestion of skillSuggestions"
            (click)="addSuggestedSkill(suggestion)"
            class="bg-white dark:bg-gray-700 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 px-3 py-1 rounded-full text-sm hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors">
            <i class="fas fa-plus mr-1"></i>
            {{ suggestion.name }}
          </button>
        </div>
        <p class="text-sm text-green-700 dark:text-green-400 mt-2">
          <i class="fas fa-lightbulb mr-1"></i>
          Cliquez sur une suggestion pour l'ajouter rapidement
        </p>
      </div>
    </div>
  `
})
export class SkillsEditorComponent {
  private cvService = inject(CVStateService);
  private themeService = inject(ThemeService);

  get skills(): Skill[] {
    return this.cvService.currentCV()?.skills || [];
  }

  skillSuggestions = [
    { name: 'JavaScript', level: 70, category: 'Langages' },
    { name: 'Python', level: 65, category: 'Langages' },
    { name: 'Angular', level: 75, category: 'Frameworks' },
    { name: 'React', level: 70, category: 'Frameworks' },
    { name: 'Node.js', level: 65, category: 'Technique' },
    { name: 'Git', level: 80, category: 'Outils' },
    { name: 'Docker', level: 60, category: 'Outils' },
    { name: 'MySQL', level: 70, category: 'Technique' },
    { name: 'Communication', level: 85, category: 'Soft Skills' },
    { name: 'Gestion de projet', level: 75, category: 'Gestion' },
    { name: 'Adobe Creative Suite', level: 70, category: 'Design' },
    { name: 'Microsoft Office', level: 85, category: 'Logiciels' }
  ];

  addSkill(): void {
    this.cvService.addSkill({
      name: 'Nouvelle compétence',
      level: 50,
      category: '',
      visible: true
    });
  }

  addSuggestedSkill(suggestion: any): void {
    const exists = this.skills.some(skill =>
      skill.name.toLowerCase() === suggestion.name.toLowerCase()
    );

    if (!exists) {
      this.cvService.addSkill(suggestion);
    }
  }

  updateSkill(skillId: string, updates: Partial<Skill>): void {
    this.cvService.updateSkill(skillId, updates);
  }

  removeSkill(skillId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      this.cvService.removeSkill(skillId);
    }
  }

  getSkillCategories(): {name: string, count: number}[] {
    const categories = new Map<string, number>();

    this.skills.forEach(skill => {
      const category = skill.category || 'Non catégorisé';
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }

  trackBySkillId(index: number, skill: Skill): string {
    return skill.id;
  }
}
