import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PersonalInfo, ContactInfo, ExperienceItem, EducationItem, Skill, Language, Interest } from '../../../../models/cv.interface';

@Component({
  selector: 'app-cv-data-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .step-indicator {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
    }
    .step {
      flex: 1;
      text-align: center;
      position: relative;
    }
    .step::after {
      content: '';
      position: absolute;
      top: 20px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: #e5e7eb;
      z-index: 0;
    }
    .step:last-child::after {
      display: none;
    }
    .step.active .step-number {
      background: #3b82f6;
      color: white;
    }
    .step.completed .step-number {
      background: #10b981;
      color: white;
    }
    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.5rem;
      position: relative;
      z-index: 1;
      font-weight: bold;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }
    .dark .form-group label {
      color: #d1d5db;
    }
    .add-item-btn {
      margin-top: 1rem;
    }
    .item-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .dark .item-card {
      background: #1f2937;
      border-color: #374151;
    }
  `],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="onCancel()">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Édition du CV - Pas à pas</h2>
            <button (click)="onCancel()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <!-- Step Indicator -->
          <div class="step-indicator mt-6">
            <div *ngFor="let step of steps; let i = index" 
                 [class]="'step ' + (currentStep() === i ? 'active' : currentStep() > i ? 'completed' : '')">
              <div class="step-number">
                <i *ngIf="currentStep() > i" class="fas fa-check"></i>
                <span *ngIf="currentStep() <= i">{{ i + 1 }}</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400">{{ step.label }}</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Step 1: Informations Personnelles -->
          <div *ngIf="currentStep() === 0" class="space-y-4">
            <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Informations Personnelles</h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label>Prénom *</label>
                <input type="text" [(ngModel)]="cvData.personalInfo.firstName" 
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
              </div>
              <div class="form-group">
                <label>Nom *</label>
                <input type="text" [(ngModel)]="cvData.personalInfo.lastName" 
                       class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
              </div>
            </div>

            <div class="form-group">
              <label>Titre Professionnel *</label>
              <input type="text" [(ngModel)]="cvData.personalInfo.title" 
                     placeholder="Ex: Développeur Full Stack"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
            </div>

            <div class="form-group">
              <label>Résumé Professionnel</label>
              <textarea [(ngModel)]="cvData.personalInfo.summary" rows="4" 
                        placeholder="Décrivez votre profil professionnel..."
                        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"></textarea>
            </div>
          </div>

          <!-- Step 2: Contact -->
          <div *ngIf="currentStep() === 1" class="space-y-4">
            <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Informations de Contact</h3>
            
            <div class="form-group">
              <label>Email *</label>
              <input type="email" [(ngModel)]="cvData.contactInfo[0].value" 
                     placeholder="votre.email@example.com"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
            </div>

            <div class="form-group">
              <label>Téléphone</label>
              <input type="tel" [(ngModel)]="cvData.contactInfo[1].value" 
                     placeholder="+33 6 12 34 56 78"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>

            <div class="form-group">
              <label>Adresse</label>
              <input type="text" [(ngModel)]="cvData.contactInfo[2].value" 
                     placeholder="Ville, Pays"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>

            <div class="form-group">
              <label>LinkedIn</label>
              <input type="url" [(ngModel)]="cvData.contactInfo[3].value" 
                     placeholder="https://linkedin.com/in/votre-profil"
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            </div>
          </div>

          <!-- Step 3: Expérience -->
          <div *ngIf="currentStep() === 2" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Expérience Professionnelle</h3>
              <button (click)="addExperience()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <i class="fas fa-plus mr-2"></i>Ajouter
              </button>
            </div>
            
            <div *ngFor="let exp of cvData.experience; let i = index" class="item-card">
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">Expérience {{ i + 1 }}</h4>
                <button (click)="removeExperience(i)" class="text-red-600 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label>Poste *</label>
                  <input type="text" [(ngModel)]="exp.title" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                </div>
                <div class="form-group">
                  <label>Entreprise *</label>
                  <input type="text" [(ngModel)]="exp.company" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                </div>
                <div class="form-group">
                  <label>Lieu</label>
                  <input type="text" [(ngModel)]="exp.location" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                </div>
                <div class="form-group">
                  <label>Date de début *</label>
                  <input type="month" [(ngModel)]="exp.startDate" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                </div>
                <div class="form-group">
                  <label>Date de fin</label>
                  <input type="month" [(ngModel)]="exp.endDate" 
                         [disabled]="exp.current"
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                </div>
                <div class="form-group flex items-center">
                  <input type="checkbox" [(ngModel)]="exp.current" id="current-{{i}}" class="mr-2">
                  <label for="current-{{i}}" class="mb-0">Poste actuel</label>
                </div>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea [(ngModel)]="exp.descriptionText" rows="3" 
                          placeholder="Décrivez vos responsabilités et réalisations..."
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                          (blur)="updateExperienceDescription(i)"></textarea>
              </div>
            </div>
          </div>

          <!-- Step 4: Formation -->
          <div *ngIf="currentStep() === 3" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Formation</h3>
              <button (click)="addEducation()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <i class="fas fa-plus mr-2"></i>Ajouter
              </button>
            </div>
            
            <div *ngFor="let edu of cvData.education; let i = index" class="item-card">
              <div class="flex items-start justify-between mb-2">
                <h4 class="font-semibold text-gray-900 dark:text-white">Formation {{ i + 1 }}</h4>
                <button (click)="removeEducation(i)" class="text-red-600 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label>Diplôme *</label>
                  <input type="text" [(ngModel)]="edu.degree" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                </div>
                <div class="form-group">
                  <label>Établissement *</label>
                  <input type="text" [(ngModel)]="edu.institution" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" required>
                </div>
                <div class="form-group">
                  <label>Lieu</label>
                  <input type="text" [(ngModel)]="edu.location" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                </div>
                <div class="form-group">
                  <label>Date de début</label>
                  <input type="month" [(ngModel)]="edu.startDate" 
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                </div>
                <div class="form-group">
                  <label>Date de fin</label>
                  <input type="month" [(ngModel)]="edu.endDate" 
                         [disabled]="edu.current"
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                </div>
                <div class="form-group flex items-center">
                  <input type="checkbox" [(ngModel)]="edu.current" id="edu-current-{{i}}" class="mr-2">
                  <label for="edu-current-{{i}}" class="mb-0">En cours</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Compétences -->
          <div *ngIf="currentStep() === 4" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Compétences</h3>
              <button (click)="addSkill()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <i class="fas fa-plus mr-2"></i>Ajouter
              </button>
            </div>
            
            <div *ngFor="let skill of cvData.skills; let i = index" class="item-card">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <input type="text" [(ngModel)]="skill.name" 
                         placeholder="Nom de la compétence"
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                </div>
                <div class="ml-4 w-32">
                  <input type="range" min="0" max="100" [(ngModel)]="skill.level" 
                         class="w-full">
                  <div class="text-xs text-center mt-1">{{ skill.level }}%</div>
                </div>
                <button (click)="removeSkill(i)" class="ml-4 text-red-600 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Step 6: Langues -->
          <div *ngIf="currentStep() === 5" class="space-y-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Langues</h3>
              <button (click)="addLanguage()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <i class="fas fa-plus mr-2"></i>Ajouter
              </button>
            </div>
            
            <div *ngFor="let lang of cvData.languages; let i = index" class="item-card">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <input type="text" [(ngModel)]="lang.name" 
                         placeholder="Nom de la langue"
                         class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                </div>
                <div class="ml-4 w-48">
                  <select [(ngModel)]="lang.levelDescription" 
                          class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                    <option value="Débutant (A1)">Débutant (A1)</option>
                    <option value="Élémentaire (A2)">Élémentaire (A2)</option>
                    <option value="Intermédiaire (B1)">Intermédiaire (B1)</option>
                    <option value="Intermédiaire supérieur (B2)">Intermédiaire supérieur (B2)</option>
                    <option value="Avancé (C1)">Avancé (C1)</option>
                    <option value="Maîtrise (C2)">Maîtrise (C2)</option>
                    <option value="Natif">Natif</option>
                  </select>
                </div>
                <button (click)="removeLanguage(i)" class="ml-4 text-red-600 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button (click)="previousStep()" 
                  [disabled]="currentStep() === 0"
                  class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-arrow-left mr-2"></i>Précédent
          </button>
          <div class="flex gap-3">
            <button (click)="onCancel()" 
                    class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              Annuler
            </button>
            <button *ngIf="currentStep() < steps.length - 1"
                    (click)="nextStep()" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Suivant <i class="fas fa-arrow-right ml-2"></i>
            </button>
            <button *ngIf="currentStep() === steps.length - 1"
                    (click)="onComplete()" 
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <i class="fas fa-check mr-2"></i>Terminer
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CVDataWizardComponent implements OnInit {
  @Input() initialData: any = null;
  @Output() completed = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  currentStep = signal(0);
  
  steps = [
    { label: 'Informations', key: 'personal' },
    { label: 'Contact', key: 'contact' },
    { label: 'Expérience', key: 'experience' },
    { label: 'Formation', key: 'education' },
    { label: 'Compétences', key: 'skills' },
    { label: 'Langues', key: 'languages' }
  ];

  cvData = {
    personalInfo: {
      firstName: '',
      lastName: '',
      title: '',
      summary: '',
      profileType: 'initials' as const
    },
    contactInfo: [
      { id: '1', icon: 'fas fa-envelope', label: 'Email', value: '', type: 'email' as const, visible: true },
      { id: '2', icon: 'fas fa-phone', label: 'Téléphone', value: '', type: 'phone' as const, visible: true },
      { id: '3', icon: 'fas fa-map-marker-alt', label: 'Adresse', value: '', type: 'address' as const, visible: true },
      { id: '4', icon: 'fab fa-linkedin', label: 'LinkedIn', value: '', type: 'linkedin' as const, visible: true }
    ],
    experience: [] as any[],
    education: [] as EducationItem[],
    skills: [] as Skill[],
    languages: [] as Language[],
    interests: [] as Interest[]
  };

  ngOnInit(): void {
    if (this.initialData) {
      // Fusionner les données initiales avec les données par défaut
      if (this.initialData.personalInfo) {
        this.cvData.personalInfo = { ...this.cvData.personalInfo, ...this.initialData.personalInfo };
      }
      if (this.initialData.contactInfo && this.initialData.contactInfo.length > 0) {
        this.cvData.contactInfo = this.initialData.contactInfo;
      }
      if (this.initialData.experience && this.initialData.experience.length > 0) {
        // Ajouter descriptionText pour chaque expérience pour l'affichage dans le textarea
        this.cvData.experience = this.initialData.experience.map((exp: any) => ({
          ...exp,
          descriptionText: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || '')
        }));
      }
      if (this.initialData.education && this.initialData.education.length > 0) {
        this.cvData.education = this.initialData.education;
      }
      if (this.initialData.skills && this.initialData.skills.length > 0) {
        this.cvData.skills = this.initialData.skills;
      }
      if (this.initialData.languages && this.initialData.languages.length > 0) {
        this.cvData.languages = this.initialData.languages;
      }
    }
  }

  nextStep(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  onComplete(): void {
    // S'assurer que toutes les descriptions d'expérience sont converties en tableaux
    this.cvData.experience.forEach((exp: any) => {
      if (exp.descriptionText !== undefined) {
        if (exp.descriptionText) {
          exp.description = exp.descriptionText.split('\n').filter((line: string) => line.trim() !== '') as string[];
        } else {
          exp.description = [''];
        }
        delete exp.descriptionText; // Nettoyer avant l'envoi
      }
    });

    // Filtrer les éléments vides
    const cleanedData = {
      personalInfo: this.cvData.personalInfo,
      contactInfo: this.cvData.contactInfo.filter((c: any) => c.value && c.value.trim() !== ''),
      experience: this.cvData.experience.filter((exp: any) => exp.title && exp.company),
      education: this.cvData.education.filter((edu: any) => edu.degree && edu.institution),
      skills: this.cvData.skills.filter((skill: any) => skill.name && skill.name.trim() !== ''),
      languages: this.cvData.languages.filter((lang: any) => lang.name && lang.name.trim() !== ''),
      interests: []
    };

    this.completed.emit(cleanedData);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  addExperience(): void {
    const newExp: any = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: [''],
      descriptionText: '',
      visible: true,
      bulletStyle: 'dot'
    };
    this.cvData.experience.push(newExp);
  }

  updateExperienceDescription(index: number): void {
    const exp = this.cvData.experience[index];
    if (exp.descriptionText) {
      // Convertir le texte en tableau (une ligne = un élément)
      exp.description = exp.descriptionText.split('\n').filter((line: string) => line.trim() !== '') as string[];
    } else {
      exp.description = [''];
    }
  }

  removeExperience(index: number): void {
    this.cvData.experience.splice(index, 1);
  }

  addEducation(): void {
    this.cvData.education.push({
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      visible: true
    });
  }

  removeEducation(index: number): void {
    this.cvData.education.splice(index, 1);
  }

  addSkill(): void {
    this.cvData.skills.push({
      id: Date.now().toString(),
      name: '',
      level: 50,
      visible: true
    });
  }

  removeSkill(index: number): void {
    this.cvData.skills.splice(index, 1);
  }

  addLanguage(): void {
    this.cvData.languages.push({
      id: Date.now().toString(),
      name: '',
      level: 50,
      levelDescription: 'Intermédiaire (B1)',
      visible: true
    });
  }

  removeLanguage(index: number): void {
    this.cvData.languages.splice(index, 1);
  }
}

