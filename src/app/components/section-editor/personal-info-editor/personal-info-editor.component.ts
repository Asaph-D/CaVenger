import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';
import { ThemeService } from '../../../services/theme.service';
import { GlobeSelectorComponent } from '../../shared/globe-picker/globe-selector.component';

@Component({
  selector: 'app-personal-info-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobeSelectorComponent],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h4 class="text-lg font-semibold mb-6">Informations Personnelles</h4>

      <div class="space-y-6">
        <!-- Photo de profil -->
        <div class="text-center">
          <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
            <div *ngIf="!personalInfo.profilePicture"
                 class="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500 dark:text-gray-300">
              {{ getInitials() }}
            </div>
            <img *ngIf="personalInfo.profilePicture"
                 [src]="personalInfo.profilePicture"
                 alt="Photo de profil"
                 class="w-full h-full object-cover">
          </div>
          <div class="space-y-2">
            <button
              (click)="uploadPhoto()"
              class="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-4 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
              <i class="fas fa-camera mr-2"></i>
              Changer la photo
            </button>
            <button
              *ngIf="personalInfo.profilePicture"
              (click)="removePhoto()"
              class="block mx-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors text-sm">
              Supprimer la photo
            </button>
          </div>
        </div>

        <!-- Informations de base -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              [(ngModel)]="personalInfo.firstName"
              (ngModelChange)="updatePersonalInfo()"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Votre prénom">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom *
            </label>
            <input
              type="text"
              [(ngModel)]="personalInfo.lastName"
              (ngModelChange)="updatePersonalInfo()"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Votre nom">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Titre Professionnel *
          </label>
          <input
            type="text"
            [(ngModel)]="personalInfo.title"
            (ngModelChange)="updatePersonalInfo()"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Ex: Développeur Full Stack, Designer UX/UI...">
        </div>

        <!-- Informations optionnelles -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h5 class="font-medium mb-4">Informations Optionnelles</h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de Naissance
              </label>
              <input
                type="date"
                [(ngModel)]="personalInfo.dateOfBirth"
                (ngModelChange)="updatePersonalInfo()"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lieu de Naissance
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="personalInfo.placeOfBirth"
                  (ngModelChange)="updatePersonalInfo()"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ville, Pays"
                  readonly>
                <button
                  (click)="openGlobeSelector('birthplace')"
                  type="button"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  <i class="fas fa-globe text-xl"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situation Matrimoniale
              </label>
              <select
                [(ngModel)]="personalInfo.maritalStatus"
                (ngModelChange)="updatePersonalInfo()"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                <option value="">-- Sélectionner --</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf/Veuve">Veuf/Veuve</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nationalité
              </label>
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="personalInfo.nationality"
                  (ngModelChange)="updatePersonalInfo()"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Française"
                  readonly>
                <button
                  (click)="openGlobeSelector('country')"
                  type="button"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                  <i class="fas fa-globe text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Résumé professionnel -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Résumé Professionnel *
          </label>
          <textarea
            [(ngModel)]="personalInfo.summary"
            (ngModelChange)="updatePersonalInfo()"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            placeholder="Décrivez brièvement votre profil professionnel, vos compétences clés et vos objectifs de carrière..."></textarea>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ personalInfo.summary.length || 0 }}/500 caractères
          </p>
        </div>
      </div>
    </div>

    <!-- Sélecteur de globe -->
    <app-globe-selector
      *ngIf="showGlobeSelector"
      [mode]="globeSelectorMode"
      (countrySelected)="onCountrySelected($event)"
      (closed)="closeGlobeSelector()">
    </app-globe-selector>
  `
})
export class PersonalInfoEditorComponent {
  private cvService = inject(CVStateService);
  private themeService = inject(ThemeService);

  showGlobeSelector = false;
  globeSelectorMode: 'country' | 'birthplace' = 'country';

  get personalInfo() {
    return this.cvService.currentCV()?.personalInfo || {
      firstName: '',
      lastName: '',
      title: '',
      nationality: '',
      dateOfBirth: '',
      placeOfBirth: '',
      profilePicture: undefined,
      address: '',
      summary: '',
      maritalStatus: ''
    };
  }

  updatePersonalInfo(): void {
    this.cvService.updatePersonalInfo(this.personalInfo);
  }

  getInitials(): string {
    const first = this.personalInfo.firstName?.charAt(0) || '';
    const last = this.personalInfo.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'CV';
  }

  uploadPhoto(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.cvService.updatePersonalInfo({
            profilePicture: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  removePhoto(): void {
    this.cvService.updatePersonalInfo({
      profilePicture: undefined
    });
  }

  openGlobeSelector(mode: 'country' | 'birthplace'): void {
    this.globeSelectorMode = mode;
    this.showGlobeSelector = true;
  }

  closeGlobeSelector(): void {
    this.showGlobeSelector = false;
  }

  onCountrySelected(country: string): void {
    if (this.globeSelectorMode === 'country') {
      this.cvService.updatePersonalInfo({
        nationality: country
      });
    } else {
      this.cvService.updatePersonalInfo({
        placeOfBirth: country
      });
    }
    this.closeGlobeSelector();
  }
}
