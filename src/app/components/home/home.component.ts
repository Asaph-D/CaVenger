import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CvApiService, CVTemplate } from '../../services/cv-api.service';
import { CVStateService } from '../../services/cv-state.service';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { ParticlesComponent } from '../particles/particles.component';
import { CvTemplateSelectorComponent } from './components/cv-template-selector/cv-template-selector.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ParticlesComponent, CvTemplateSelectorComponent],
  styles: [`
    /* Fade In Animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fadeInUp 0.8s ease-out forwards;
    }
    .delay-100 { animation-delay: 0.1s; opacity: 0; }
    .delay-200 { animation-delay: 0.2s; opacity: 0; }
    .delay-300 { animation-delay: 0.3s; opacity: 0; }
    .delay-400 { animation-delay: 0.4s; opacity: 0; }
    .delay-500 { animation-delay: 0.5s; opacity: 0; }
    /* Floating Animation */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    .float-animation {
      animation: float 6s ease-in-out infinite;
    }
    /* Shimmer Effect */
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    .shimmer {
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
      background-size: 1000px 100%;
      animation: shimmer 3s infinite;
    }
    /* Card Hover Effect */
    .feature-card {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .feature-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }
    /* Template Card Effect */
    .template-card {
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
    }
    .template-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      transition: left 0.5s;
    }
    .template-card:hover::before {
      left: 100%;
    }
    .template-card:hover {
      transform: translateY(-15px);
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
    }
    /* Scroll Progress Bar */
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #000, #444);
      z-index: 1000;
      transition: width 0.1s ease;
    }
    /* Stats Counter Animation */
    @keyframes countUp {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .stat-number {
      animation: countUp 0.6s ease-out;
    }
  `],
  template: `
    <!-- Particles Background -->
    <app-particles></app-particles>

    <!-- CV Template Selector -->
    <app-cv-template-selector (templateSelected)="onTemplateSelected($event)"></app-cv-template-selector>

    <!-- Scroll Progress Bar -->
    <div class="scroll-progress" [style.width.%]="scrollProgress"></div>

    <div class="min-h-screen bg-black/90 text-white relative">
      <!-- Header -->
      <header class="fixed w-full top-0 z-50 transition-all duration-300"
              [class.bg-black]="isScrolled"
              [class.backdrop-blur-lg]="isScrolled"
              [class.border-b]="isScrolled"
              [ngClass]="{'border-white/10': isScrolled}">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-white text-black flex items-center justify-center text-xl font-bold">
                CV
              </div>
              <div>
                <h1 class="text-2xl font-light tracking-wider">CV BUILDER</h1>
                <p class="text-xs text-gray-400 tracking-widest">PROFESSIONAL</p>
              </div>
            </div>
            <nav class="hidden md:flex items-center space-x-8">
              <button (click)="scrollToSection('templates')"
                      class="text-sm tracking-wide hover:text-gray-300 transition-colors">
                TEMPLATES
              </button>
              <button (click)="scrollToSection('features')"
                      class="text-sm tracking-wide hover:text-gray-300 transition-colors">
                FONCTIONNALITÉS
              </button>
              <button class="text-sm tracking-wide hover:text-gray-300 transition-colors">
                AIDE
              </button>
              <a 
                *ngIf="!authService.isLoggedIn()"
                routerLink="/login"
                class="text-sm tracking-wide hover:text-gray-300 transition-colors">
                CONNEXION
              </a>
              <a 
                *ngIf="!authService.isLoggedIn()"
                routerLink="/register"
                class="bg-white text-black px-6 py-2 text-sm font-medium hover:bg-gray-200 transition-all">
                INSCRIPTION
              </a>
              <a 
                *ngIf="authService.isLoggedIn()"
                routerLink="/settings"
                class="text-sm tracking-wide hover:text-gray-300 transition-colors">
                PARAMÈTRES
              </a>
              <button 
                *ngIf="authService.isLoggedIn() && !subscriptionService.isPremium()"
                (click)="goToPayment()"
                class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
                <i class="fas fa-crown mr-2"></i>
                PREMIUM
              </button>
              <button 
                *ngIf="authService.isLoggedIn()"
                (click)="handleLogout()"
                class="text-sm tracking-wide hover:text-gray-300 transition-colors">
                DÉCONNEXION
              </button>
            </nav>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="relative min-h-screen flex items-center justify-center pt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="animate-fade-in delay-100">
            <p class="text-sm tracking-[0.3em] text-gray-400 mb-8 uppercase">
              Créateur de CV Professionnel
            </p>
          </div>

          <h2 class="text-6xl md:text-8xl font-light mb-8 leading-tight animate-fade-in delay-200">
            Créez un CV<br>
            <span class="font-light">qui démarque</span>
          </h2>

          <p class="text-xl text-gray-400 mb-12 max-w-3xl mx-auto font-light animate-fade-in delay-300">
            Des templates élégants, des outils puissants et une expérience intuitive
            pour créer le CV parfait en quelques minutes.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-400">
            <button
              (click)="startNewCV()"
              class="bg-white text-black px-8 py-4 text-sm font-medium tracking-wide hover:bg-gray-200 transition-all transform hover:scale-105">
              CRÉER UN CV
            </button>
            <button
              (click)="scrollToSection('templates')"
              class="border border-white/30 px-8 py-4 text-sm font-medium tracking-wide hover:bg-white/10 transition-all">
              VOIR LES TEMPLATES
            </button>
          </div>

          <div *ngIf="!authService.isLoggedIn()" class="flex flex-col sm:flex-row gap-4 justify-center mt-6 animate-fade-in delay-500">
            <p class="text-sm text-gray-400 tracking-wide">
              Vous avez déjà un compte ? 
              <a routerLink="/login" class="text-white hover:underline transition-colors">Connectez-vous</a>
            </p>
            <span class="hidden sm:inline text-gray-400">|</span>
            <p class="text-sm text-gray-400 tracking-wide">
              Nouveau ? 
              <a routerLink="/register" class="text-white hover:underline transition-colors">Créez un compte</a>
            </p>
          </div>

          <!-- Scroll Indicator -->
          <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-fade-in delay-500">
            <div class="w-6 h-10 border border-white/30 rounded-full flex justify-center">
              <div class="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-32 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-20">
            <p class="text-sm tracking-[0.3em] text-gray-400 mb-4 uppercase">Fonctionnalités</p>
            <h3 class="text-4xl md:text-5xl font-light mb-6">
              Tout ce dont vous avez besoin
            </h3>
            <p class="text-lg text-gray-400 max-w-2xl mx-auto font-light">
              Des outils professionnels pour créer un CV impeccable
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="feature-card bg-white/5 backdrop-blur-sm p-8 border border-white/10">
              <div class="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 text-2xl">
                ✏️
              </div>
              <h4 class="text-xl font-light mb-4">Édition Intuitive</h4>
              <p class="text-gray-400 font-light leading-relaxed">
                Interface simple et élégante. Modifiez votre CV en temps réel
                avec des outils d'édition puissants.
              </p>
            </div>
            <div class="feature-card bg-white/5 backdrop-blur-sm p-8 border border-white/10">
              <div class="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 text-2xl">
                🎨
              </div>
              <h4 class="text-xl font-light mb-4">Design Personnalisable</h4>
              <p class="text-gray-400 font-light leading-relaxed">
                15+ templates professionnels. Personnalisez les couleurs,
                polices et mise en page selon vos préférences.
              </p>
            </div>
            <div class="feature-card bg-white/5 backdrop-blur-sm p-8 border border-white/10">
              <div class="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 text-2xl">
                📥
              </div>
              <h4 class="text-xl font-light mb-4">Export Multi-Format</h4>
              <p class="text-gray-400 font-light leading-relaxed">
                Téléchargez en PDF haute qualité, Word ou partagez
                directement via un lien personnalisé.
              </p>
            </div>
            <div class="feature-card bg-white/5 backdrop-blur-sm p-8 border border-white/10">
              <div class="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 text-2xl">
                ↔️
              </div>
              <h4 class="text-xl font-light mb-4">Mise en Page Flexible</h4>
              <p class="text-gray-400 font-light leading-relaxed">
                Redimensionnez les colonnes et organisez votre contenu
                avec des outils de mise en page avancés.
              </p>
            </div>
            <div class="feature-card bg-white/5 backdrop-blur-sm p-8 border border-white/10">
              <div class="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 text-2xl">
                ⚡
              </div>
              <h4 class="text-xl font-light mb-4">200+ Icônes</h4>
              <p class="text-gray-400 font-light leading-relaxed">
                Bibliothèque complète d'icônes FontAwesome pour
                personnaliser votre CV de façon unique.
              </p>
            </div>
            <div class="feature-card bg-white/5 backdrop-blur-sm p-8 border border-white/10">
              <div class="w-14 h-14 bg-white/10 flex items-center justify-center mb-6 text-2xl">
                💾
              </div>
              <h4 class="text-xl font-light mb-4">Sauvegarde Auto</h4>
              <p class="text-gray-400 font-light leading-relaxed">
                Vos modifications sont sauvegardées automatiquement.
                Travaillez en toute sérénité.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Templates Section -->
      <section id="templates" class="py-32 bg-white/5 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-20">
            <p class="text-sm tracking-[0.3em] text-gray-400 mb-4 uppercase">Templates</p>
            <h3 class="text-4xl md:text-5xl font-light mb-6">
              15+ Designs Professionnels
            </h3>
            <p class="text-lg text-gray-400 max-w-2xl mx-auto font-light">
              Choisissez parmi notre collection de templates élégants conçus par des professionnels
            </p>
          </div>
          <div *ngIf="isLoadingTemplates()" class="text-center py-20">
            <p class="text-gray-400">Chargement des templates...</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="!isLoadingTemplates()">
            <div
              *ngFor="let template of availableTemplates().slice(0, 6)"
              class="template-card bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden cursor-pointer group"
              (click)="selectTemplate(template)">

              <div class="h-80 bg-white/10 relative overflow-hidden">
                <img 
                  [src]="getTemplateImagePath(template.id)" 
                  [alt]="template.name"
                  class="w-full h-full object-cover"
                  (error)="onImageError($event, template)"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div class="absolute top-4 right-4">
                  <span class="bg-black/50 backdrop-blur-sm text-white px-3 py-1 text-xs tracking-wider">
                    {{ template.layout | uppercase }}
                  </span>
                </div>
                <div *ngIf="isTemplateFree(template.id)" class="absolute top-4 left-4">
                  <span class="bg-green-500 text-white px-3 py-1 text-xs tracking-wider font-semibold">
                    GRATUIT
                  </span>
                </div>
                <div *ngIf="!isTemplateFree(template.id) && !subscriptionService.isPremium()" class="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div class="text-center text-white">
                    <i class="fas fa-lock text-3xl mb-2"></i>
                    <p class="text-sm font-semibold tracking-wider">PREMIUM</p>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <h4 class="text-xl font-light mb-2">{{ template.name }}</h4>
                <p class="text-gray-400 text-sm mb-4 font-light">{{ template.description }}</p>
                <div class="flex items-center justify-between">
                  <div class="flex space-x-2">
                    <div class="w-3 h-3 border border-white/30 bg-blue-500"></div>
                    <div class="w-3 h-3 border border-white/30 bg-blue-400"></div>
                    <div class="w-3 h-3 border border-white/30 bg-blue-300"></div>
                  </div>
                  <button class="text-sm tracking-wide group-hover:text-white transition-colors">
                    UTILISER →
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="text-center mt-16">
            <button
              (click)="viewAllTemplates()"
              class="border border-white/30 px-8 py-3 text-sm tracking-wide hover:bg-white/10 transition-all">
              VOIR TOUS LES {{ availableTemplates().length }} TEMPLATES
            </button>
          </div>
        </div>
      </section>

      <!-- Saved CVs Section -->
      <section *ngIf="savedCVs().length > 0" class="py-32 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-20">
            <p class="text-sm tracking-[0.3em] text-gray-400 mb-4 uppercase">Vos CV</p>
            <h3 class="text-4xl md:text-5xl font-light mb-6">
              Reprendre votre travail
            </h3>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              *ngFor="let cv of savedCVs()"
              class="bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:border-white/30 transition-all cursor-pointer group"
              (click)="loadCV(cv.id)">

              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-12 h-12 flex items-center justify-center text-black font-bold"
                       [style.background-color]="cv.theme.primaryColor">
                    {{ getInitials(cv.personalInfo.firstName, cv.personalInfo.lastName) }}
                  </div>
                  <div>
                    <h4 class="font-light">
                      {{ cv.personalInfo.firstName }} {{ cv.personalInfo.lastName }}
                    </h4>
                    <p class="text-xs text-gray-400">
                      {{ cv.updatedAt | date:'short' }}
                    </p>
                  </div>
                </div>
                <button class="opacity-0 group-hover:opacity-100 transition-opacity">
                  ✏️
                </button>
              </div>

              <p class="text-gray-400 text-sm mb-4">{{ cv.personalInfo.title }}</p>

              <div class="flex items-center justify-between">
                <span class="text-xs tracking-wider text-gray-400">
                  {{ cv.template.name }}
                </span>
                <div class="flex space-x-1">
                  <div class="w-2 h-2 border border-white/30"
                       [style.background-color]="cv.theme.primaryColor"></div>
                  <div class="w-2 h-2 border border-white/30"
                       [style.background-color]="cv.theme.secondaryColor"></div>
                  <div class="w-2 h-2 border border-white/30"
                       [style.background-color]="cv.theme.accentColor"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics Section -->
      <section class="py-32 border-t border-white/10 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-4 gap-12 text-center">
            <div>
              <div class="text-5xl font-light mb-3 stat-number">50K+</div>
              <div class="text-sm tracking-wider text-gray-400 uppercase">CV créés</div>
            </div>
            <div>
              <div class="text-5xl font-light mb-3 stat-number">15+</div>
              <div class="text-sm tracking-wider text-gray-400 uppercase">Templates</div>
            </div>
            <div>
              <div class="text-5xl font-light mb-3 stat-number">200+</div>
              <div class="text-sm tracking-wider text-gray-400 uppercase">Icônes</div>
            </div>
            <div>
              <div class="text-5xl font-light mb-3 stat-number">98%</div>
              <div class="text-sm tracking-wider text-gray-400 uppercase">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
      <!-- Footer -->
      <footer class="border-t border-white/10 py-16 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-4 gap-12">
            <div>
              <div class="flex items-center space-x-2 mb-4">
                <div class="w-8 h-8 bg-white text-black flex items-center justify-center text-sm font-bold">
                  CV
                </div>
                <h5 class="font-light tracking-wider">CV BUILDER</h5>
              </div>
              <p class="text-gray-400 text-sm font-light">
                Créez des CV professionnels qui vous aideront à décrocher l'emploi de vos rêves.
              </p>
            </div>
            <div>
              <h5 class="font-light mb-4 tracking-wider">PRODUIT</h5>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h5 class="font-light mb-4 tracking-wider">SUPPORT</h5>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Aide</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h5 class="font-light mb-4 tracking-wider">LÉGAL</h5>
              <ul class="space-y-2 text-sm">
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Conditions</a></li>
                <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div class="border-t border-white/10 mt-12 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 CV Builder Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private cvService = inject(CVStateService);
  private router = inject(Router);
  private cvApiService = inject(CvApiService);
  private modalService = inject(ModalService);
  protected subscriptionService = inject(SubscriptionService);
  protected authService = inject(AuthService);
  @ViewChild(CvTemplateSelectorComponent) templateSelector!: CvTemplateSelectorComponent;
  
  savedCVs = this.cvService.savedCVs;

  // Templates chargés depuis le backend
  availableTemplates = signal<CVTemplate[]>([]);
  isLoadingTemplates = signal(false);

  scrollProgress = 0;
  isScrolled = false;

  ngOnInit(): void {
    this.subscriptionService.initialize();
    this.loadTemplates();
  }

  ngAfterViewInit(): void {
    this.initScrollListener();
  }

  /**
   * Charge les templates depuis le backend
   */
  loadTemplates(): void {
    this.isLoadingTemplates.set(true);
    this.cvApiService.getTemplates().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          this.availableTemplates.set(response.data);
          console.log('✅ Templates chargés depuis le backend:', response.data.length);
        } else {
          // Fallback: utiliser les templates statiques
          console.warn('⚠️ Backend ne retourne pas de templates, utilisation des templates statiques');
          this.availableTemplates.set(this.subscriptionService.getStaticTemplates());
        }
        this.isLoadingTemplates.set(false);
      },
      error: (error) => {
        console.warn('⚠️ Erreur lors du chargement des templates depuis le backend, utilisation des templates statiques:', error);
        // Fallback: utiliser les templates statiques même en cas d'erreur
        this.availableTemplates.set(this.subscriptionService.getStaticTemplates());
        this.isLoadingTemplates.set(false);
      }
    });
  }

  initScrollListener() {
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      this.scrollProgress = scrolled;
      this.isScrolled = window.scrollY > 50;
    });
  }
  
  onTemplateSelected(templateId: string) {
    console.log('🎯 Template sélectionné depuis cv-template-selector:', templateId);
    
    // Trouver le template correspondant et l'appliquer
    const template = this.availableTemplates().find((t: CVTemplate) => t.id === templateId);
    if (template) {
      // Vérifier si le template est accessible
      if (!this.subscriptionService.isTemplateFree(template.id) && !this.subscriptionService.isPremium()) {
        this.modalService.showWarning(
          'Ce template est réservé aux abonnés Premium. Passez à Premium pour l\'utiliser.',
          'Template Premium'
        );
        this.goToPayment();
        return;
      }

      // Créer un nouveau CV
      this.cvService.createNewCV();
      
      // Attendre un peu pour que le CV soit créé
      setTimeout(() => {
        // Convertir CVTemplateSelector en CVTemplate pour l'application
        const cvTemplate = this.cvService.convertTemplateSelectorToCVTemplate({
          id: template.id,
          name: template.name,
          description: template.description,
          layout: template.layout
        });
        
        // Appliquer le template
        this.cvService.applyTemplate(cvTemplate);
        
        // Sauvegarder le CV avec le template
        this.cvService.saveCV();
        
        console.log('✅ Template appliqué:', template.name, 'ID:', template.id);
        
        // Naviguer vers le builder
        this.router.navigate(['/builder']);
      }, 100);
    } else {
      console.error('❌ Template non trouvé:', templateId);
    }
  }

  startNewCV(): void {
    this.cvService.createNewCV();
    this.router.navigate(['/builder']);
  }

  selectTemplate(template: CVTemplate): void {
    console.log('🎯 Template sélectionné depuis la page d\'accueil:', template);
    
    // Vérifier si le template est accessible
    if (!this.subscriptionService.isTemplateFree(template.id) && !this.subscriptionService.isPremium()) {
      this.modalService.showWarning(
        'Ce template est réservé aux abonnés Premium. Passez à Premium pour l\'utiliser.',
        'Template Premium'
      );
      this.goToPayment();
      return;
    }

    // Sélectionner le template dans le composant cv-template-selector pour synchronisation visuelle
    if (this.templateSelector) {
      // Convertir CVTemplate en CVTemplateSelector pour le composant
      const templateSelector = {
        id: template.id,
        name: template.name,
        description: template.description,
        layout: template.layout
      };
      this.templateSelector.setSelectedTemplate(templateSelector);
    }
    
    // Créer un nouveau CV
    this.cvService.createNewCV();
    
    // Attendre un peu pour que le CV soit créé
    setTimeout(() => {
      // Convertir le template du backend en CVTemplate pour l'application
      const cvTemplate = this.cvService.convertTemplateSelectorToCVTemplate({
        id: template.id,
        name: template.name,
        description: template.description,
        layout: template.layout
      });
      
      // Appliquer le template
      this.cvService.applyTemplate(cvTemplate);
      
      // Sauvegarder le CV avec le template
      this.cvService.saveCV();
      
      console.log('✅ Template appliqué:', template.name, 'ID:', template.id);
      
      // Naviguer vers le builder
      this.router.navigate(['/builder']);
    }, 100);
  }

  loadCV(cvId: string): void {
    this.cvService.loadCV(cvId);
    this.router.navigate(['/builder']);
  }

  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({ behavior: 'smooth' });
  }

  viewAllTemplates(): void {
    this.scrollToSection('templates');
  }

  getInitials(firstName: string, lastName: string): string {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'CV';
  }

  getTemplateImagePath(templateId: string): string {
    const normalizedId = templateId.toLowerCase();
    return `assets/templates/${normalizedId}.png`;
  }

  isTemplateFree(templateId: string): boolean {
    return this.subscriptionService.isTemplateFree(templateId);
  }

  onImageError(event: Event, template: CVTemplate): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
          <div class="text-white text-xs opacity-50 text-center">
            <i class="fas fa-file-alt text-4xl mb-2"></i>
            <p>${template.name}</p>
          </div>
        </div>
      `;
    }
  }

  goToPayment(): void {
    if (!this.authService.isLoggedIn()) {
      this.modalService.showWarning(
        'Vous devez être connecté pour accéder au paiement premium.',
        'Connexion requise'
      );
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/payment' } });
      return;
    }
    this.router.navigate(['/payment']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  handleLogout(): void {
    this.modalService.showConfirm(
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      'Déconnexion',
      () => {
        this.authService.logout();
      }
    );
  }
}
