import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CVStateService } from '../../services/cv-state.service';
import { CVTemplate } from '../../models/cv.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <!-- Header -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-xl">
                <i class="fas fa-file-alt text-2xl"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  CV Builder Pro
                </h1>
                <p class="text-gray-600">Créez votre CV professionnel en quelques minutes</p>
              </div>
            </div>
            <div class="hidden md:flex items-center space-x-6">
              <button class="text-gray-600 hover:text-gray-900 transition-colors">
                <i class="fas fa-palette mr-2"></i>
                Templates
              </button>
              <button class="text-gray-600 hover:text-gray-900 transition-colors">
                <i class="fas fa-question-circle mr-2"></i>
                Aide
              </button>
              <button class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                <i class="fas fa-user mr-2"></i>
                Connexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h2 class="text-5xl font-bold text-gray-900 mb-6">
            Créez un CV qui vous
            <span class="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              démarque
            </span>
          </h2>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Notre constructeur de CV intelligent vous aide à créer un CV professionnel personnalisé 
            avec des templates modernes et des outils d'édition avancés.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              (click)="startNewCV()"
              class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:-translate-y-1">
              <i class="fas fa-plus mr-2"></i>
              Créer un nouveau CV
            </button>
            <button 
              (click)="viewTemplates()"
              class="border-2 border-purple-300 text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all">
              <i class="fas fa-eye mr-2"></i>
              Voir les templates
            </button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center mb-16">
          <h3 class="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi choisir CV Builder Pro ?
          </h3>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Des outils professionnels pour créer le CV parfait, adapté à votre domaine
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-pink-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <i class="fas fa-palette text-2xl text-pink-600"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-4">Design Personnalisable</h4>
            <p class="text-gray-600">
              Choisissez parmi nos thèmes professionnels et personnalisez les couleurs, 
              polices et mise en page selon vos préférences.
            </p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <i class="fas fa-edit text-2xl text-purple-600"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-4">Édition Intuitive</h4>
            <p class="text-gray-600">
              Interface glisser-déposer simple, édition en temps réel et ajout/suppression 
              facile de sections selon vos besoins.
            </p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <i class="fas fa-download text-2xl text-blue-600"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-4">Export Multi-Format</h4>
            <p class="text-gray-600">
              Téléchargez votre CV en PDF haute qualité, Word ou partagez-le directement 
              via un lien personnalisé.
            </p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <i class="fas fa-expand-arrows-alt text-2xl text-green-600"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-4">Redimensionnement Intelligent</h4>
            <p class="text-gray-600">
              Redimensionnez les colonnes, ajustez la taille des polices et organisez 
              votre contenu avec des outils de mise en page avancés.
            </p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-yellow-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <i class="fas fa-icons text-2xl text-yellow-600"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-4">200+ Icônes FontAwesome</h4>
            <p class="text-gray-600">
              Personnalisez votre CV avec plus de 200 icônes professionnelles. 
              Changez les icônes en un clic pour un rendu unique.
            </p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div class="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <i class="fas fa-save text-2xl text-indigo-600"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-4">Sauvegarde Automatique</h4>
            <p class="text-gray-600">
              Vos modifications sont sauvegardées automatiquement. Travaillez en toute 
              sérénité sans risquer de perdre votre travail.
            </p>
          </div>
        </div>
      </section>

      <!-- Templates Preview -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center mb-16">
          <h3 class="text-3xl font-bold text-gray-900 mb-4">
            15+ Templates Professionnels
          </h3>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Commencez avec l'un de nos templates conçus par des professionnels pour différents secteurs
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            *ngFor="let template of availableTemplates().slice(0, 9)" 
            class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-2 group"
            (click)="selectTemplate(template)">
            
            <div class="h-64 bg-gradient-to-br overflow-hidden relative"
                 [style.background]="getTemplateGradient(template)">
              <img [src]="template.thumbnail" 
                   [alt]="template.name"
                   class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
              <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
              <div class="absolute top-4 right-4">
                <span class="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                  {{ template.layout | titlecase }}
                </span>
              </div>
            </div>
            
            <div class="p-6">
              <h4 class="text-xl font-bold text-gray-900 mb-2">{{ template.name }}</h4>
              <p class="text-gray-600 mb-4">{{ template.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex space-x-1">
                  <div class="w-3 h-3 rounded-full" [style.background-color]="template.theme.primaryColor"></div>
                  <div class="w-3 h-3 rounded-full" [style.background-color]="template.theme.secondaryColor"></div>
                  <div class="w-3 h-3 rounded-full" [style.background-color]="template.theme.accentColor"></div>
                </div>
                <button class="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <i class="fas fa-arrow-right mr-1"></i>
                  Utiliser
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Show more templates button -->
        <div class="text-center mt-12">
          <button 
            (click)="viewAllTemplates()"
            class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-all">
            <i class="fas fa-th mr-2"></i>
            Voir tous les {{ availableTemplates().length }} templates
          </button>
        </div>
      </section>

      <!-- Saved CVs Section -->
      <section *ngIf="savedCVs().length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center mb-16">
          <h3 class="text-3xl font-bold text-gray-900 mb-4">
            Vos CV Sauvegardés
          </h3>
          <p class="text-lg text-gray-600">
            Continuez à travailler sur vos CV existants
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            *ngFor="let cv of savedCVs()" 
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
            (click)="loadCV(cv.id)">
            
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                     [style.background]="cv.theme.primaryColor">
                  {{ getInitials(cv.personalInfo.firstName, cv.personalInfo.lastName) }}
                </div>
                <div>
                  <h4 class="text-lg font-bold text-gray-900">
                    {{ cv.personalInfo.firstName }} {{ cv.personalInfo.lastName }}
                  </h4>
                  <p class="text-sm text-gray-500">
                    {{ cv.updatedAt | date:'short' }}
                  </p>
                </div>
              </div>
              <button class="text-purple-600 hover:text-purple-800 transition-colors opacity-0 group-hover:opacity-100">
                <i class="fas fa-edit text-lg"></i>
              </button>
            </div>
            
            <p class="text-gray-600 mb-4">{{ cv.personalInfo.title }}</p>
            
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium px-2 py-1 rounded-full"
                    [style.background-color]="cv.theme.backgroundColor"
                    [style.color]="cv.theme.primaryColor">
                {{ cv.template.name }}
              </span>
              <div class="flex space-x-1">
                <div class="w-2 h-2 rounded-full" [style.background-color]="cv.theme.primaryColor"></div>
                <div class="w-2 h-2 rounded-full" [style.background-color]="cv.theme.secondaryColor"></div>
                <div class="w-2 h-2 rounded-full" [style.background-color]="cv.theme.accentColor"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics Section -->
      <section class="bg-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h3 class="text-3xl font-bold text-gray-900 mb-4">
              Rejoignez des milliers d'utilisateurs satisfaits
            </h3>
          </div>
          
          <div class="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div class="text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div class="text-gray-600">CV créés</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-pink-600 mb-2">15+</div>
              <div class="text-gray-600">Templates disponibles</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div class="text-gray-600">Icônes FontAwesome</div>
            </div>
            <div>
              <div class="text-4xl font-bold text-green-600 mb-2">98%</div>
              <div class="text-gray-600">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-4 gap-8">
            <div>
              <div class="flex items-center space-x-2 mb-4">
                <div class="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-2 rounded-lg">
                  <i class="fas fa-file-alt"></i>
                </div>
                <h5 class="text-lg font-bold">CV Builder Pro</h5>
              </div>
              <p class="text-gray-400">
                Créez des CV professionnels qui vous aideront à décrocher l'emploi de vos rêves.
              </p>
            </div>
            <div>
              <h5 class="text-lg font-bold mb-4">Produit</h5>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-palette mr-2"></i>Templates</a></li>
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-star mr-2"></i>Fonctionnalités</a></li>
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-tag mr-2"></i>Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h5 class="text-lg font-bold mb-4">Support</h5>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-question-circle mr-2"></i>Aide</a></li>
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-envelope mr-2"></i>Contact</a></li>
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-comments mr-2"></i>FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 class="text-lg font-bold mb-4">Légal</h5>
              <ul class="space-y-2 text-gray-400">
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-shield-alt mr-2"></i>Confidentialité</a></li>
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-file-contract mr-2"></i>Conditions</a></li>
                <li><a href="#" class="hover:text-white transition-colors flex items-center"><i class="fas fa-cookie-bite mr-2"></i>Cookies</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CV Builder Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class HomeComponent {
  private cvService = inject(CVStateService);
  private router = inject(Router);

  availableTemplates = this.cvService.availableTemplates;
  savedCVs = this.cvService.savedCVs;

  startNewCV(): void {
    this.cvService.createNewCV();
    this.router.navigate(['/builder']);
  }

  selectTemplate(template: CVTemplate): void {
    this.cvService.createNewCV();
    this.cvService.applyTemplate(template);
    this.router.navigate(['/builder']);
  }

  loadCV(cvId: string): void {
    this.cvService.loadCV(cvId);
    this.router.navigate(['/builder']);
  }

  viewTemplates(): void {
    // Scroll to templates section
    const templatesSection = document.querySelector('section:nth-of-type(3)');
    templatesSection?.scrollIntoView({ behavior: 'smooth' });
  }

  viewAllTemplates(): void {
    // Could open a modal or navigate to a dedicated templates page
    this.viewTemplates();
  }

  getTemplateGradient(template: CVTemplate): string {
    return `linear-gradient(135deg, ${template.theme.primaryColor}, ${template.theme.secondaryColor})`;
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'CV';
  }
}