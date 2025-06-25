import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';

@Component({
  selector: 'app-personal-info-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-6">Informations Personnelles</h4>
      
      <div class="space-y-6">
        <!-- Profile Picture -->
        <div class="text-center">
          <div class="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100">
            <div *ngIf="!personalInfo.profilePicture" 
                 class="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
              {{ getInitials() }}
            </div>
            <img *ngIf="personalInfo.profilePicture" 
                 [src]="personalInfo.profilePicture"
                 alt="Profile Picture"
                 class="w-full h-full object-cover">
          </div>
          <div class="space-y-2">
            <button 
              (click)="uploadPhoto()"
              class="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
              <i class="fas fa-camera mr-2"></i>
              Changer la photo
            </button>
            <button 
              *ngIf="personalInfo.profilePicture"
              (click)="removePhoto()"
              class="block mx-auto text-red-600 hover:text-red-800 transition-colors text-sm">
              Supprimer la photo
            </button>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input 
              type="text"
              [(ngModel)]="personalInfo.firstName"
              (ngModelChange)="updatePersonalInfo()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Votre prénom">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input 
              type="text"
              [(ngModel)]="personalInfo.lastName"
              (ngModelChange)="updatePersonalInfo()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Votre nom">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Titre Professionnel *
          </label>
          <input 
            type="text"
            [(ngModel)]="personalInfo.title"
            (ngModelChange)="updatePersonalInfo()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ex: Développeur Full Stack, Designer UX/UI...">
        </div>

        <!-- Contact Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input 
              type="email"
              [(ngModel)]="personalInfo.email"
              (ngModelChange)="updatePersonalInfo()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="votre@email.com">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Téléphone *
            </label>
            <input 
              type="tel"
              [(ngModel)]="personalInfo.phone"
              (ngModelChange)="updatePersonalInfo()"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="+33 6 12 34 56 78">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Adresse
          </label>
          <input 
            type="text"
            [(ngModel)]="personalInfo.address"
            (ngModelChange)="updatePersonalInfo()"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Ville, Pays">
        </div>

        <!-- Optional Information -->
        <div class="border-t pt-6">
          <h5 class="font-medium text-gray-900 mb-4">Informations Optionnelles</h5>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de Naissance
              </label>
              <input 
                type="date"
                [(ngModel)]="personalInfo.dateOfBirth"
                (ngModelChange)="updatePersonalInfo()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Lieu de Naissance
              </label>
              <input 
                type="text"
                [(ngModel)]="personalInfo.placeOfBirth"
                (ngModelChange)="updatePersonalInfo()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ville, Pays">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Situation Matrimoniale
              </label>
              <select 
                [(ngModel)]="personalInfo.maritalStatus"
                (ngModelChange)="updatePersonalInfo()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">-- Sélectionner --</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf/Veuve">Veuf/Veuve</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nationalité
              </label>
              <input 
                type="text"
                [(ngModel)]="personalInfo.nationality"
                (ngModelChange)="updatePersonalInfo()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Française">
            </div>
          </div>
        </div>

        <!-- Professional Summary -->
        <div class="border-t pt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Résumé Professionnel *
          </label>
          <textarea 
            [(ngModel)]="personalInfo.summary"
            (ngModelChange)="updatePersonalInfo()"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Décrivez brièvement votre profil professionnel, vos compétences clés et vos objectifs de carrière..."></textarea>
          <p class="text-sm text-gray-500 mt-2">
            {{ personalInfo.summary.length || 0 }}/500 caractères
          </p>
        </div>
      </div>
    </div>
  `
})
export class PersonalInfoEditorComponent {
  private cvService = inject(CVStateService);

  get personalInfo() {
    return this.cvService.currentCV()?.personalInfo || {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
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
}