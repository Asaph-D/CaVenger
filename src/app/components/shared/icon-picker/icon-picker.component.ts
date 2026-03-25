import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isVisible" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         (click)="closeModal()">
      
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Choisir une icône</h3>
            <button 
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600 transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <!-- Search -->
          <div class="mt-4">
            <div class="relative">
              <input 
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="filterIcons()"
                placeholder="Rechercher une icône..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <!-- Categories -->
          <div class="mt-4 flex flex-wrap gap-2">
            <button 
              *ngFor="let category of categories"
              (click)="selectCategory(category.key)"
              [class.bg-purple-600]="selectedCategory === category.key"
              [class.text-white]="selectedCategory === category.key"
              [class.bg-gray-100]="selectedCategory !== category.key"
              [class.text-gray-700]="selectedCategory !== category.key"
              class="px-3 py-1 rounded-full text-sm font-medium transition-colors hover:bg-purple-500 hover:text-white">
              <i [class]="category.icon + ' mr-1'"></i>
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Icons Grid -->
        <div class="p-6 overflow-y-auto scrollbar-discrete max-h-96">
          <div class="grid grid-cols-8 gap-3">
            <button 
              *ngFor="let icon of filteredIcons"
              (click)="selectIcon(icon)"
              class="p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group flex items-center justify-center"
              [title]="icon.name">
              <i [class]="icon.class + ' text-xl text-gray-600 group-hover:text-purple-600'"></i>
            </button>
          </div>

          <!-- No results -->
          <div *ngIf="filteredIcons.length === 0" class="text-center py-8">
            <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">Aucune icône trouvée pour "{{ searchTerm }}"</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <p class="text-sm text-gray-600">
              {{ filteredIcons.length }} icône(s) disponible(s)
            </p>
            <button 
              (click)="closeModal()"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IconPickerComponent {
  @Input() isVisible = false;
  @Output() iconSelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  searchTerm = '';
  selectedCategory = 'all';
  filteredIcons: any[] = [];

  categories = [
    { key: 'all', name: 'Toutes', icon: 'fas fa-th' },
    { key: 'contact', name: 'Contact', icon: 'fas fa-address-book' },
    { key: 'social', name: 'Social', icon: 'fas fa-share-alt' },
    { key: 'work', name: 'Travail', icon: 'fas fa-briefcase' },
    { key: 'education', name: 'Éducation', icon: 'fas fa-graduation-cap' },
    { key: 'skills', name: 'Compétences', icon: 'fas fa-star' },
    { key: 'hobbies', name: 'Loisirs', icon: 'fas fa-heart' },
    { key: 'tech', name: 'Tech', icon: 'fas fa-laptop-code' },
    { key: 'transport', name: 'Transport', icon: 'fas fa-car' },
    { key: 'misc', name: 'Divers', icon: 'fas fa-ellipsis-h' }
  ];

  allIcons = [
    // Contact Icons
    { class: 'fas fa-envelope', name: 'Email', category: 'contact' },
    { class: 'fas fa-phone', name: 'Téléphone', category: 'contact' },
    { class: 'fas fa-mobile-alt', name: 'Mobile', category: 'contact' },
    { class: 'fas fa-map-marker-alt', name: 'Adresse', category: 'contact' },
    { class: 'fas fa-home', name: 'Domicile', category: 'contact' },
    { class: 'fas fa-building', name: 'Bureau', category: 'contact' },
    { class: 'fas fa-globe', name: 'Site web', category: 'contact' },
    { class: 'fas fa-fax', name: 'Fax', category: 'contact' },

    // Social Icons
    { class: 'fab fa-linkedin', name: 'LinkedIn', category: 'social' },
    { class: 'fab fa-github', name: 'GitHub', category: 'social' },
    { class: 'fab fa-twitter', name: 'Twitter', category: 'social' },
    { class: 'fab fa-facebook', name: 'Facebook', category: 'social' },
    { class: 'fab fa-instagram', name: 'Instagram', category: 'social' },
    { class: 'fab fa-youtube', name: 'YouTube', category: 'social' },
    { class: 'fab fa-behance', name: 'Behance', category: 'social' },
    { class: 'fab fa-dribbble', name: 'Dribbble', category: 'social' },
    { class: 'fab fa-portfolio', name: 'Portfolio', category: 'social' },

    // Work Icons
    { class: 'fas fa-briefcase', name: 'Travail', category: 'work' },
    { class: 'fas fa-user-tie', name: 'Professionnel', category: 'work' },
    { class: 'fas fa-building', name: 'Entreprise', category: 'work' },
    { class: 'fas fa-handshake', name: 'Partenariat', category: 'work' },
    { class: 'fas fa-chart-line', name: 'Croissance', category: 'work' },
    { class: 'fas fa-target', name: 'Objectif', category: 'work' },
    { class: 'fas fa-trophy', name: 'Réussite', category: 'work' },
    { class: 'fas fa-medal', name: 'Récompense', category: 'work' },
    { class: 'fas fa-award', name: 'Prix', category: 'work' },

    // Education Icons
    { class: 'fas fa-graduation-cap', name: 'Diplôme', category: 'education' },
    { class: 'fas fa-university', name: 'Université', category: 'education' },
    { class: 'fas fa-book', name: 'Livre', category: 'education' },
    { class: 'fas fa-book-open', name: 'Lecture', category: 'education' },
    { class: 'fas fa-certificate', name: 'Certificat', category: 'education' },
    { class: 'fas fa-chalkboard-teacher', name: 'Enseignement', category: 'education' },
    { class: 'fas fa-school', name: 'École', category: 'education' },
    { class: 'fas fa-pencil-alt', name: 'Écriture', category: 'education' },

    // Skills Icons
    { class: 'fas fa-star', name: 'Compétence', category: 'skills' },
    { class: 'fas fa-cog', name: 'Configuration', category: 'skills' },
    { class: 'fas fa-tools', name: 'Outils', category: 'skills' },
    { class: 'fas fa-lightbulb', name: 'Idée', category: 'skills' },
    { class: 'fas fa-brain', name: 'Intelligence', category: 'skills' },
    { class: 'fas fa-puzzle-piece', name: 'Résolution', category: 'skills' },
    { class: 'fas fa-rocket', name: 'Innovation', category: 'skills' },
    { class: 'fas fa-magic', name: 'Créativité', category: 'skills' },

    // Tech Icons
    { class: 'fas fa-laptop-code', name: 'Développement', category: 'tech' },
    { class: 'fas fa-code', name: 'Code', category: 'tech' },
    { class: 'fas fa-database', name: 'Base de données', category: 'tech' },
    { class: 'fas fa-server', name: 'Serveur', category: 'tech' },
    { class: 'fas fa-cloud', name: 'Cloud', category: 'tech' },
    { class: 'fas fa-mobile-alt', name: 'Mobile', category: 'tech' },
    { class: 'fas fa-desktop', name: 'Desktop', category: 'tech' },
    { class: 'fas fa-wifi', name: 'Réseau', category: 'tech' },
    { class: 'fab fa-html5', name: 'HTML5', category: 'tech' },
    { class: 'fab fa-css3-alt', name: 'CSS3', category: 'tech' },
    { class: 'fab fa-js-square', name: 'JavaScript', category: 'tech' },
    { class: 'fab fa-react', name: 'React', category: 'tech' },
    { class: 'fab fa-angular', name: 'Angular', category: 'tech' },
    { class: 'fab fa-vue', name: 'Vue.js', category: 'tech' },
    { class: 'fab fa-node-js', name: 'Node.js', category: 'tech' },
    { class: 'fab fa-python', name: 'Python', category: 'tech' },
    { class: 'fab fa-java', name: 'Java', category: 'tech' },
    { class: 'fab fa-php', name: 'PHP', category: 'tech' },

    // Hobbies Icons
    { class: 'fas fa-heart', name: 'Passion', category: 'hobbies' },
    { class: 'fas fa-music', name: 'Musique', category: 'hobbies' },
    { class: 'fas fa-camera', name: 'Photographie', category: 'hobbies' },
    { class: 'fas fa-paint-brush', name: 'Art', category: 'hobbies' },
    { class: 'fas fa-gamepad', name: 'Jeux', category: 'hobbies' },
    { class: 'fas fa-running', name: 'Course', category: 'hobbies' },
    { class: 'fas fa-bicycle', name: 'Vélo', category: 'hobbies' },
    { class: 'fas fa-swimming-pool', name: 'Natation', category: 'hobbies' },
    { class: 'fas fa-hiking', name: 'Randonnée', category: 'hobbies' },
    { class: 'fas fa-plane', name: 'Voyage', category: 'hobbies' },
    { class: 'fas fa-film', name: 'Cinéma', category: 'hobbies' },
    { class: 'fas fa-theater-masks', name: 'Théâtre', category: 'hobbies' },

    // Transport Icons
    { class: 'fas fa-car', name: 'Voiture', category: 'transport' },
    { class: 'fas fa-motorcycle', name: 'Moto', category: 'transport' },
    { class: 'fas fa-bus', name: 'Bus', category: 'transport' },
    { class: 'fas fa-train', name: 'Train', category: 'transport' },
    { class: 'fas fa-plane', name: 'Avion', category: 'transport' },
    { class: 'fas fa-ship', name: 'Bateau', category: 'transport' },

    // Personal Info Icons
    { class: 'fas fa-user', name: 'Utilisateur', category: 'misc' },
    { class: 'fas fa-birthday-cake', name: 'Anniversaire', category: 'misc' },
    { class: 'fas fa-flag', name: 'Nationalité', category: 'misc' },
    { class: 'fas fa-language', name: 'Langue', category: 'misc' },
    { class: 'fas fa-calendar', name: 'Date', category: 'misc' },
    { class: 'fas fa-clock', name: 'Heure', category: 'misc' },
    { class: 'fas fa-info-circle', name: 'Information', category: 'misc' },
    { class: 'fas fa-question-circle', name: 'Question', category: 'misc' },
    { class: 'fas fa-exclamation-circle', name: 'Attention', category: 'misc' },
    { class: 'fas fa-check-circle', name: 'Validé', category: 'misc' },
    { class: 'fas fa-times-circle', name: 'Erreur', category: 'misc' },

    // Additional Professional Icons
    { class: 'fas fa-project-diagram', name: 'Projet', category: 'work' },
    { class: 'fas fa-tasks', name: 'Tâches', category: 'work' },
    { class: 'fas fa-clipboard-list', name: 'Liste', category: 'work' },
    { class: 'fas fa-file-alt', name: 'Document', category: 'work' },
    { class: 'fas fa-folder', name: 'Dossier', category: 'work' },
    { class: 'fas fa-archive', name: 'Archive', category: 'work' },
    { class: 'fas fa-download', name: 'Télécharger', category: 'work' },
    { class: 'fas fa-upload', name: 'Uploader', category: 'work' },
    { class: 'fas fa-share', name: 'Partager', category: 'work' },
    { class: 'fas fa-link', name: 'Lien', category: 'work' }
  ];

  ngOnInit(): void {
    this.filteredIcons = this.allIcons;
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.filterIcons();
  }

  filterIcons(): void {
    let filtered = this.allIcons;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(icon => icon.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(icon => 
        icon.name.toLowerCase().includes(searchLower) ||
        icon.class.toLowerCase().includes(searchLower)
      );
    }

    this.filteredIcons = filtered;
  }

  selectIcon(icon: any): void {
    this.iconSelected.emit(icon.class);
    this.closeModal();
  }

  closeModal(): void {
    this.isVisible = false;
    this.closed.emit();
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.filteredIcons = this.allIcons;
  }
}