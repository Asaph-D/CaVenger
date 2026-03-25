import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CvApiService, CVTemplate } from '../../services/cv-api.service';
import { CVStateService } from '../../services/cv-state.service';
import { ModalService } from '../../services/modal.service';
import { SubscriptionService } from '../../services/subscription.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { CVPreviewComponent } from '../cv-preview/cv-preview.component';
import { CvTemplateSelectorComponent } from '../home/components/cv-template-selector/cv-template-selector.component';
import { SectionEditorComponent } from '../section-editor/section-editor.component';
import { StyleEditorComponent } from '../style-editor/style-editor.component';
import { CVDataWizardComponent } from './components/cv-data-wizard/cv-data-wizard.component';
import { TemplatePickerComponent } from './components/template-picker/template-picker.component';

@Component({
  selector: 'app-cv-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CVPreviewComponent,
    StyleEditorComponent,
    SectionEditorComponent,
    CvTemplateSelectorComponent,
    TemplatePickerComponent,
    CVDataWizardComponent,
  ],
  animations: [
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('0.3s ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.3s ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
  styles: [`
    /* Animations */
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out forwards;
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
    .animate-bounce-in {
      animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    /* Mobile Tab Navigation */
    .mobile-tabs {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #e5e7eb;
      z-index: 50;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }
    @media (max-width: 768px) {
      .mobile-tabs {
        display: flex;
      }
      .desktop-only {
        display: none !important;
      }
      .mobile-view-container {
        padding-bottom: 60px;
      }
    }
    .tab-button {
      flex: 1;
      padding: 0.75rem 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      border: none;
      background: transparent;
      color: #6b7280;
      font-size: 0.75rem;
      transition: all 0.2s;
    }
    .tab-button.active {
      color: #3b82f6;
      background: #eff6ff;
    }
    .tab-button i {
      font-size: 1.25rem;
    }
    /* Style des raccourcis clavier */
    kbd {
      font-family: monospace;
      font-size: 0.75rem;
      background: rgba(0, 0, 0, 0.1);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
    /* Style des boutons flottants */
    .floating-button {
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .floating-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    /* Style des panneaux */
    .panel {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    /* Style des sections */
    .section-header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    /* Style des menus contextuels */
    .context-menu {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border-radius: 0.5rem;
      overflow: hidden;
    }
    /* Style des indicateurs */
    .status-indicator {
      position: fixed;
      z-index: 1000;
      animation: fade-in 0.3s ease-out;
    }
    /* Boutons uniformes */
    .btn {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background-color: #2563eb;
      color: white;
    }
    .btn-primary:hover {
      background-color: #1d4ed8;
    }
    .btn-secondary {
      color: #4b5563;
    }
    .btn-secondary:hover {
      background-color: #f3f4f6;
    }
    .dark-theme .btn-secondary:hover {
      background-color: #374151;
    }
    /* Thème sombre */
    .dark-theme {
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
    }
    .dark-theme .bg-white {
      background-color: rgba(30, 41, 55, 1);
    }
    .dark-theme .text-gray-900 {
      color: white;
    }
    .dark-theme .text-gray-600 {
      color: rgba(209, 213, 219, 0.8);
    }
    .dark-theme .hover\\:text-gray-900:hover {
      color: white;
    }
    .dark-theme .border-gray-200 {
      border-color: rgba(75, 85, 99, 0.5);
    }
    .dark-theme .bg-gray-100 {
      background-color: rgba(30, 41, 55, 0.5);
    }
    .dark-theme .bg-gray-50 {
      background-color: rgba(17, 24, 39, 1);
    }
    .dark-theme .bg-gray-200 {
      background-color: rgba(75, 85, 99, 0.5);
    }
    .dark-theme .hover\\:bg-gray-50:hover {
      background-color: rgba(30, 41, 55, 0.7);
    }

    /* Header icon buttons */
    .header-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      background: transparent;
      color: #374151;
      transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 160ms ease;
    }
    .header-icon-btn:hover {
      background-color: rgba(0, 0, 0, 0.04);
      transform: translateY(-1px);
    }
    .header-icon-btn:active {
      transform: translateY(0);
    }
    .header-icon-btn:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
      border-color: rgba(37, 99, 235, 0.35);
    }
    .dark-theme .header-icon-btn {
      border-color: rgba(255, 255, 255, 0.14);
      color: rgba(229, 231, 235, 0.95);
    }
    .dark-theme .header-icon-btn:hover {
      background-color: rgba(255, 255, 255, 0.06);
    }
    .header-icon-btn i {
      font-size: 16px;
      line-height: 1;
    }

    @keyframes premium-glow {
      0%, 100% { box-shadow: 0 0 0 rgba(236, 72, 153, 0); transform: translateY(0) scale(1); }
      50% { box-shadow: 0 0 18px rgba(236, 72, 153, 0.28); transform: translateY(-1px) scale(1.03); }
    }
    .header-icon-btn--premium {
      border-color: rgba(236, 72, 153, 0.35);
      color: #db2777;
      animation: premium-glow 1.6s ease-in-out infinite;
    }
    .dark-theme .header-icon-btn--premium {
      border-color: rgba(236, 72, 153, 0.45);
      color: #f472b6;
    }
    /* CV Mobile Container */
    @media (max-width: 768px) {
      /* Dans la section @media (max-width: 768px) */
      .cv-mobile-container {
        display: flex;
        flex-direction: row; /* Affichage en ligne (côte à côte) */
        width: 100%;
        height: auto;
      }
      .cv-left-column {
        flex: 1;
        padding-right: 1rem;
      }
      .cv-right-column {
        flex: 1;
        padding-left: 1rem;
      }
    }
  `],
  template: `
    <div class="relative min-h-screen" [class.dark-theme]="themeService.isDarkMode()">
      <!-- Header Desktop -->
      <header class="desktop-only bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center space-x-4">
              <button (click)="goHome()" class="flex items-center text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                <span>Retour</span>
              </button>
              <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 class="text-xl font-medium text-gray-900 dark:text-white">
                {{ currentCV()?.personalInfo?.firstName }} {{ currentCV()?.personalInfo?.lastName }}
              </h1>
              <div *ngIf="isDirty()" class="flex items-center text-amber-500 dark:text-amber-400 animate-pulse">
                <i class="fas fa-circle text-xs mr-1"></i>
                <span class="text-sm">Non sauvegardé</span>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                (click)="themeService.toggleTheme()"
                class="header-icon-btn"
                [title]="themeService.isDarkMode() ? 'Mode clair' : 'Mode sombre'"
                aria-label="Basculer le thème">
                <i [class]="themeService.isDarkMode() ? 'fas fa-sun text-yellow-400' : 'fas fa-moon text-gray-500'"></i>
              </button>
              <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
                <button 
                  (click)="!subscriptionService.isPremium() ? goToPayment() : setViewMode('edit')" 
                  [ngClass]="{
                    'bg-white text-gray-900': viewMode === 'edit' && !themeService.isDarkMode() && subscriptionService.isPremium(), 
                    'bg-gray-600 text-white': viewMode === 'edit' && themeService.isDarkMode() && subscriptionService.isPremium(),
                    'opacity-50 cursor-not-allowed': !subscriptionService.isPremium()
                  }" 
                  [title]="!subscriptionService.isPremium() ? 'Fonctionnalité Premium - Cliquez pour passer à Premium' : 'Mode Édition'"
                  class="px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center relative">
                  <i class="fas fa-edit mr-1"></i>
                  <span>Édition</span>
                  <i *ngIf="!subscriptionService.isPremium()" class="fas fa-lock ml-1 text-xs"></i>
                </button>
                <button (click)="setViewMode('preview')" [ngClass]="{'bg-white text-gray-900': viewMode === 'preview' && !themeService.isDarkMode(), 'bg-gray-600 text-white': viewMode === 'preview' && themeService.isDarkMode()}" class="px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center">
                  <i class="fas fa-eye mr-1"></i>
                  <span>Aperçu</span>
                </button>
              </div>
              <button 
                (click)="toggleStyleEditor()" 
                [ngClass]="{'bg-purple-100 text-purple-700': showStyleEditor && !themeService.isDarkMode(), 'bg-purple-900 text-purple-200': showStyleEditor && themeService.isDarkMode(), 'opacity-50 cursor-not-allowed': !subscriptionService.hasFeature('canCustomizeStyles')}"
                [title]="!subscriptionService.hasFeature('canCustomizeStyles') ? 'Fonctionnalité Premium - Cliquez pour passer à Premium' : 'Éditeur de style'"
                class="flex items-center px-3 py-2 rounded-lg transition-colors relative"
                (click)="!subscriptionService.hasFeature('canCustomizeStyles') && goToPayment()">
                <i class="fas fa-palette mr-2"></i>
                <span>Style</span>
                <i *ngIf="!subscriptionService.hasFeature('canCustomizeStyles')" class="fas fa-lock ml-2 text-xs"></i>
              </button>
              <button (click)="toggleTemplatePicker()" [ngClass]="{'bg-blue-100 text-blue-700': showTemplatePicker && !themeService.isDarkMode(), 'bg-blue-900 text-blue-200': showTemplatePicker && themeService.isDarkMode()}" class="flex items-center px-3 py-2 rounded-lg transition-colors">
                <i class="fas fa-file-alt mr-2"></i>
                <span>Templates</span>
              </button>
              <button (click)="toggleHelp()" [ngClass]="{'bg-blue-100 text-blue-700': showHelp() && !themeService.isDarkMode(), 'bg-blue-900 text-blue-200': showHelp() && themeService.isDarkMode()}" class="flex items-center px-3 py-2 rounded-lg transition-colors">
                <i class="fas fa-question-circle mr-2"></i>
                <span>Aide</span>
              </button>
              <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <button (click)="saveCV()" class="header-icon-btn" title="Sauvegarder" aria-label="Sauvegarder">
                <i class="fas fa-save"></i>
              </button>
              <button 
                (click)="openEmailModal()" 
                [disabled]="isExporting" 
                [title]="subscriptionService.isPremium() ? 'Générer et envoyer le CV' : 'Commencer la création de votre CV'"
                class="header-icon-btn disabled:opacity-50"
                aria-label="Commencer / Générer">
                <i [class]="isExporting ? 'fas fa-spinner fa-spin' : (subscriptionService.isPremium() ? 'fas fa-envelope' : 'fas fa-play')"></i>
              </button>
              <button 
                *ngIf="!subscriptionService.isPremium()"
                (click)="goToPayment()"
                class="header-icon-btn header-icon-btn--premium"
                title="Passer à Premium"
                aria-label="Passer à Premium">
                <i class="fas fa-crown"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
      <!-- Header Mobile -->
      <header class="md:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div class="px-2 py-2">
          <div class="flex items-center justify-between">
            <button (click)="goHome()" class="p-2 text-gray-700 dark:text-gray-200">
              <i class="fas fa-arrow-left text-lg"></i>
            </button>
            <h1 class="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 mx-2">
              {{ currentCV()?.personalInfo?.firstName }} {{ currentCV()?.personalInfo?.lastName }}
            </h1>
            <div class="flex items-center gap-1">
              <button (click)="saveCV()" class="header-icon-btn" title="Sauvegarder" aria-label="Sauvegarder">
                <i class="fas fa-save"></i>
              </button>
              <button (click)="openEmailModal()" [disabled]="isExporting" [title]="subscriptionService.isPremium() ? 'Générer et Envoyer' : 'Commencer'" class="header-icon-btn disabled:opacity-50" aria-label="Commencer / Générer">
                <i [class]="isExporting ? 'fas fa-spinner fa-spin' : (subscriptionService.isPremium() ? 'fas fa-envelope' : 'fas fa-play')"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
      <!-- Contenu principal - Desktop -->
      <div class="hidden md:flex h-[calc(100vh-4rem)]">
        <!-- Zone d'édition - visible en mode edit ou en mode preview pour les utilisateurs gratuits -->
        <div *ngIf="(viewMode === 'edit' || (!subscriptionService.isPremium() && viewMode === 'preview')) && !showTemplatePicker" class="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-600 overflow-y-auto scrollbar-discrete transition-all duration-300 panel relative">
          <!-- Contenu de l'éditeur en arrière-plan -->
          <app-section-editor [class.opacity-70]="!subscriptionService.isPremium()" [class.pointer-events-none]="!subscriptionService.isPremium()"></app-section-editor>
          <!-- Overlay Premium pour les utilisateurs gratuits -->
          <div *ngIf="!subscriptionService.isPremium()" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-[2px] flex items-center justify-center z-10 p-6">
            <div class="text-center max-w-sm">
              <i class="fas fa-lock text-4xl text-gray-400 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fonctionnalité Premium</h3>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
              L'édition avancée du CV est disponible uniquement avec l'abonnement Premium.
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-500 mb-6">
                Découvrez toutes les fonctionnalités d'édition en passant à Premium.
              </p>
              <button 
                (click)="goToPayment()"
                class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                <i class="fas fa-crown mr-2"></i>
                Passer à Premium
              </button>
            </div>
          </div>
        </div>
        <div *ngIf="viewMode === 'edit' && showTemplatePicker" class="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-600 overflow-y-auto scrollbar-discrete transition-all duration-300 panel">
          <app-template-picker (templateSelected)="onTemplateSelectedFromPicker($event)"></app-template-picker>
        </div>
        <div class="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto scrollbar-discrete p-8 transition-all duration-300 panel" [class.w-full]="viewMode === 'preview' && subscriptionService.isPremium()" [ngClass]="{'w-2/3': viewMode === 'edit' || (!subscriptionService.isPremium() && viewMode === 'preview')}">
          <div class="max-w-4xl mx-auto">
            <app-cv-preview></app-cv-preview>
          </div>
        </div>
        <div *ngIf="showStyleEditor && subscriptionService.hasFeature('canCustomizeStyles')" class="w-1/4 bg-white dark:bg-gray-800 border-l border-gray-600 overflow-y-auto scrollbar-discrete animate-slide-in-right panel">
          <app-style-editor></app-style-editor>
        </div>
        <div *ngIf="showStyleEditor && !subscriptionService.hasFeature('canCustomizeStyles')" class="w-1/4 bg-white dark:bg-gray-800 border-l border-gray-600 overflow-y-auto scrollbar-discrete animate-slide-in-right panel p-6">
          <div class="text-center py-12">
            <i class="fas fa-lock text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fonctionnalité Premium</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              L'éditeur de style est disponible uniquement avec l'abonnement Premium.
            </p>
            <button 
              (click)="goToPayment()"
              class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
              <i class="fas fa-crown mr-2"></i>
              Passer à Premium
            </button>
          </div>
        </div>
      </div>
      <!-- Contenu principal - Mobile -->
      <div class="md:hidden mobile-view-container" [ngSwitch]="mobileView">
        <!-- Zone d'édition - visible en mode edit ou en mode preview pour les utilisateurs gratuits -->
        <div *ngSwitchCase="'edit'" class="h-[calc(100vh-7rem)] overflow-y-auto scrollbar-discrete bg-white dark:bg-gray-800 relative">
          <div *ngIf="!showTemplatePicker">
            <!-- Contenu de l'éditeur en arrière-plan -->
            <app-section-editor [class.opacity-70]="!subscriptionService.isPremium()" [class.pointer-events-none]="!subscriptionService.isPremium()"></app-section-editor>
            <!-- Overlay Premium pour les utilisateurs gratuits -->
            <div *ngIf="!subscriptionService.isPremium()" class="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center z-10 p-6">
              <div class="text-center max-w-sm">
                <i class="fas fa-lock text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fonctionnalité Premium</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  L'édition avancée du CV est disponible uniquement avec l'abonnement Premium.
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-500 mb-6">
                  Découvrez toutes les fonctionnalités d'édition en passant à Premium.
                </p>
                <button 
                  (click)="goToPayment()"
                  class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                  <i class="fas fa-crown mr-2"></i>
                  Passer à Premium
                </button>
              </div>
            </div>
          </div>
          <div *ngIf="showTemplatePicker">
            <div class="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Choisir un template</h3>
              <button (click)="showTemplatePicker = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <app-template-picker (templateSelected)="onTemplateSelectedFromPicker($event)"></app-template-picker>
          </div>
        </div>
        <div *ngSwitchCase="'preview'" class="h-[calc(100vh-7rem)] overflow-y-auto scrollbar-discrete bg-gray-100 dark:bg-gray-900 p-2">
          <div class="cv-mobile-container">
            <app-cv-preview></app-cv-preview>
          </div>
        </div>
        <div *ngSwitchCase="'style'" class="h-[calc(100vh-7rem)] overflow-y-auto scrollbar-discrete bg-white dark:bg-gray-800">
          <div *ngIf="subscriptionService.hasFeature('canCustomizeStyles')">
            <app-style-editor></app-style-editor>
          </div>
          <div *ngIf="!subscriptionService.hasFeature('canCustomizeStyles')" class="p-6 text-center py-12">
            <i class="fas fa-lock text-4xl text-gray-400 mb-4"></i>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fonctionnalité Premium</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              L'éditeur de style est disponible uniquement avec l'abonnement Premium.
            </p>
            <button 
              (click)="goToPayment()"
              class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
              <i class="fas fa-crown mr-2"></i>
              Passer à Premium
            </button>
          </div>
        </div>
        <div *ngSwitchCase="'more'" class="h-[calc(100vh-7rem)] overflow-y-auto scrollbar-discrete bg-white dark:bg-gray-800 p-4">
          <h2 class="text-lg font-bold mb-4 text-gray-900 dark:text-white">Actions</h2>
          <div class="space-y-2">
            <button (click)="themeService.toggleTheme()" class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i [class]="themeService.isDarkMode() ? 'fas fa-sun mr-3' : 'fas fa-moon mr-3'"></i>
                {{ themeService.isDarkMode() ? 'Mode Clair' : 'Mode Sombre' }}
              </span>
            </button>
            <button (click)="toggleHelp()" class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-question-circle mr-3"></i>
                Aide
              </span>
            </button>
            <!-- Dans la section "Plus" de la vue mobile -->
            <button
              (click)="toggleTemplatePicker()"
              class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-file-alt mr-3"></i>
                Changer de template
              </span>
            </button>
            <button
              *ngIf="subscriptionService.isPremium()"
              (click)="toggleAddSectionMenu($event)"
              class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-plus-circle mr-3"></i>
                Ajouter une section
              </span>
            </button>
            <div *ngIf="showAddSectionMenu" class="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-600 py-2 min-w-48 context-menu animate-bounce-in">
              <button
                *ngFor="let sectionType of availableSectionTypes"
                (click)="addSection(sectionType.type, sectionType.position); $event.stopPropagation()"
                class="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center transition-colors">
                <i [class]="sectionType.icon + ' mr-3 text-gray-500 dark:text-gray-300'"></i>
                <span>{{ sectionType.name }}</span>
              </button>
            </div>

            <button 
              (click)="subscriptionService.hasFeature('canChangeLayout') ? toggleDragMode() : goToPayment()" 
              [class.opacity-50]="!subscriptionService.hasFeature('canChangeLayout')"
              class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-arrows-alt mr-3"></i>
                Mode déplacement
                <i *ngIf="!subscriptionService.hasFeature('canChangeLayout')" class="fas fa-lock ml-2 text-xs"></i>
              </span>
              <span *ngIf="dragMode()" class="text-green-600"><i class="fas fa-check"></i></span>
            </button>
            <button 
              (click)="subscriptionService.hasFeature('canChangeLayout') ? toggleResizeMode() : goToPayment()" 
              [class.opacity-50]="!subscriptionService.hasFeature('canChangeLayout')"
              class="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span class="flex items-center text-gray-700 dark:text-gray-200">
                <i class="fas fa-expand-arrows-alt mr-3"></i>
                Mode redimensionnement
                <i *ngIf="!subscriptionService.hasFeature('canChangeLayout')" class="fas fa-lock ml-2 text-xs"></i>
              </span>
              <span *ngIf="resizeMode()" class="text-green-600"><i class="fas fa-check"></i></span>
            </button>
            <button 
              *ngIf="!subscriptionService.isPremium()"
              (click)="goToPayment()"
              class="w-full flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold mt-4">
              <i class="fas fa-crown mr-2"></i>
              Passer à Premium
            </button>
            <div *ngIf="isDirty()" class="w-full p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div class="flex items-center text-amber-700 dark:text-amber-400">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                <span class="text-sm">Modifications non sauvegardées</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Navigation Mobile -->
      <nav class="mobile-tabs">
        <button 
          (click)="!subscriptionService.isPremium() ? goToPayment() : setMobileView('edit')" 
          [class.active]="mobileView === 'edit' && subscriptionService.isPremium()" 
          [class.opacity-50]="!subscriptionService.isPremium()"
          [title]="!subscriptionService.isPremium() ? 'Fonctionnalité Premium' : 'Mode Édition'"
          class="tab-button relative">
          <i [class]="showTemplatePicker ? 'fas fa-file-alt' : 'fas fa-edit'"></i>
          <span>{{ showTemplatePicker ? 'Templates' : 'Éditer' }}</span>
          <i *ngIf="!subscriptionService.isPremium()" class="fas fa-lock absolute top-0 right-0 text-xs"></i>
        </button>
        <button (click)="setMobileView('preview')" [class.active]="mobileView === 'preview'" class="tab-button">
          <i class="fas fa-eye"></i>
          <span>Aperçu</span>
        </button>
        <button (click)="setMobileView('style')" [class.active]="mobileView === 'style'" class="tab-button">
          <i class="fas fa-palette"></i>
          <span>Style</span>
        </button>
        <button (click)="setMobileView('more')" [class.active]="mobileView === 'more'" class="tab-button">
          <i class="fas fa-ellipsis-h"></i>
          <span>Plus</span>
        </button>
      </nav>
      <!-- Boutons flottants (Desktop seulement) -->
      <div class="hidden md:flex fixed bottom-6 right-6 flex-col space-y-4 z-50">
        <div class="relative group" *ngIf="subscriptionService.isPremium()">
          <button (click)="toggleAddSectionMenu($event)" class="floating-button bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105" title="Ajouter une section">
            <i class="fas fa-plus"></i>
          </button>
          <div *ngIf="showAddSectionMenu" class="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-600 py-2 min-w-48 context-menu animate-bounce-in" style="z-index: 1001;">
            <button *ngFor="let sectionType of availableSectionTypes" (click)="addSection(sectionType.type, sectionType.position); $event.stopPropagation()" class="w-full text-left px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center transition-colors">
              <i [class]="sectionType.icon + ' mr-3 text-gray-500 dark:text-gray-300'"></i>
              <span>{{ sectionType.name }}</span>
            </button>
          </div>
        </div>
      </div>
      <!-- Indicateurs -->
      <div *ngIf="autoSaving" class="fixed bottom-6 left-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in status-indicator">
        <i class="fas fa-spinner fa-spin mr-2"></i>
        Sauvegarde automatique...
      </div>
      <div *ngIf="isExporting" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in">
          <div class="flex items-center">
            <i class="fas fa-spinner fa-spin text-blue-600 mr-3"></i>
            <span class="text-gray-800 dark:text-white">Génération du CV en cours...</span>
          </div>
        </div>
      </div>
      <!-- Modal de saisie d'email -->
      <div *ngIf="showEmailModal && !showDataWizard" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeEmailModal()">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in max-w-md w-full mx-4" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Générer et Envoyer le CV</h2>
            <button (click)="closeEmailModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Entrez votre adresse email pour recevoir votre CV généré au format PDF.
          </p>
          <div class="mb-4">
            <label for="userEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              id="userEmail"
              [(ngModel)]="userEmail"
              placeholder="votre.email@domain.com"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              [class.border-red-500]="emailError"
            />
            <p *ngIf="emailError" class="mt-2 text-sm text-red-600 dark:text-red-400">
              <i class="fas fa-exclamation-circle mr-1"></i>{{ emailError }}
            </p>
          </div>
          <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <i class="fas fa-info-circle mr-2 text-blue-600"></i>
              <strong>Mode Gratuit :</strong> Remplissez les informations de votre CV étape par étape.
            </p>
            <button 
              (click)="showDataWizard = true"
              class="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <i class="fas fa-edit mr-2"></i>
              Remplir les informations du CV
            </button>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              (click)="closeEmailModal()"
              class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              (click)="generateAndSendCV()"
              [disabled]="isExporting || !userEmail"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <i *ngIf="isExporting" class="fas fa-spinner fa-spin mr-2"></i>
              <i *ngIf="!isExporting" class="fas fa-paper-plane mr-2"></i>
              {{ isExporting ? 'Génération...' : 'Générer et Envoyer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Wizard de collecte de données -->
      <app-cv-data-wizard
        *ngIf="showDataWizard"
        [initialData]="getWizardInitialData()"
        (completed)="onWizardCompleted($event)"
        (cancelled)="showDataWizard = false">
      </app-cv-data-wizard>
    </div>
    <app-cv-template-selector 
      (templateSelected)="onTemplateSelected($event)">
    </app-cv-template-selector>
  `
})
export class CVBuilderComponent implements OnInit {
  private readonly cvService = inject(CVStateService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly themeService = inject(ThemeService);
  private readonly cvApiService = inject(CvApiService);
  protected readonly subscriptionService = inject(SubscriptionService);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);
  @ViewChild(CVPreviewComponent) cvPreviewComponent?: CVPreviewComponent;

  currentCV = this.cvService.currentCV;
  isDirty = this.cvService.isDirty;
  dragMode = this.cvService.dragMode;
  resizeMode = this.cvService.resizeMode;
  showHelp = this.cvService.showHelp;
  viewMode: 'edit' | 'preview' = 'edit';
  mobileView: 'edit' | 'preview' | 'style' | 'more' = 'preview';
  showStyleEditor = false;
  showTemplatePicker = false;
  showDataWizard = false;
  autoSaving = false;
  showShortcuts = false;
  showAddSectionMenu = false;
  isExporting = false;
  showEmailModal = false;
  userEmail = '';
  emailError = '';
  wizardCollectedData: any = null;

  availableSectionTypes = [
    { type: 'profile', name: 'Profil Professionnel', icon: 'fas fa-user', position: 'right' as const },
    { type: 'personal-info', name: 'Informations Personnelles', icon: 'fas fa-id-card', position: 'right' as const },
    { type: 'experience', name: 'Expérience', icon: 'fas fa-briefcase', position: 'right' as const },
    { type: 'education', name: 'Formation', icon: 'fas fa-graduation-cap', position: 'right' as const },
    { type: 'skills', name: 'Compétences', icon: 'fas fa-star', position: 'left' as const },
    { type: 'languages', name: 'Langues', icon: 'fas fa-language', position: 'left' as const },
    { type: 'interests', name: 'Loisirs', icon: 'fas fa-heart', position: 'left' as const },
    { type: 'contact', name: 'Contact', icon: 'fas fa-address-card', position: 'left' as const },
    { type: 'custom', name: 'Section Personnalisée', icon: 'fas fa-plus-circle', position: 'right' as const }
  ];

  ngOnInit(): void {
    // Si l'utilisateur n'est pas premium et est en mode édition, le rediriger vers le mode preview
    if (!this.subscriptionService.isPremium() && this.viewMode === 'edit') {
      this.viewMode = 'preview';
    }
    if (!this.subscriptionService.isPremium() && this.mobileView === 'edit') {
      this.mobileView = 'preview';
    }
    if (!this.currentCV()) {
      this.router.navigate(['/']);
      return;
    }
    this.cvService.setEditing(true);
    this.setupKeyboardShortcuts();
    this.setupAutoSave();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          this.saveCV();
          break;
        case 'p':
          event.preventDefault();
          window.print();
          break;
        case 'e':
          event.preventDefault();
          this.openEmailModal();
          break;
        case 'h':
          event.preventDefault();
          this.toggleHelp();
          break;
      }
    } else if (event.key === 'Escape') {
      this.closeAllPanels();
    }
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    const isMenuClick = target.closest('.context-menu');
    const isButtonClick = target.closest('button[title="Ajouter une section"]');
    if (!isMenuClick && !isButtonClick) {
      this.showAddSectionMenu = false;
      this.cdr.detectChanges();
    }
  }

  setMobileView(view: 'edit' | 'preview' | 'style' | 'more'): void {
    // Empêcher le passage en mode édition pour les utilisateurs gratuits
    if (view === 'edit' && !this.subscriptionService.isPremium()) {
      this.goToPayment();
      return;
    }
    this.mobileView = view;
  }

  toggleAddSectionMenu(event: Event): void {
    event.stopPropagation();
    this.showAddSectionMenu = !this.showAddSectionMenu;
    this.cdr.detectChanges();
  }

  addSection(sectionType: string, position: 'left' | 'right'): void {
    if (this.cvPreviewComponent) {
      this.cvPreviewComponent.addNewSection(sectionType, position);
      this.showAddSectionMenu = false;
      this.cdr.detectChanges();
    }
  }

  toggleDragMode(): void {
    const newDragMode = !this.dragMode();
    this.cvService.setDragMode(newDragMode);
    if (newDragMode) {
      this.cvService.setResizeMode(false);
    }
    this.cdr.detectChanges();
  }

  toggleResizeMode(): void {
    const newResizeMode = !this.resizeMode();
    this.cvService.setResizeMode(newResizeMode);
    if (newResizeMode) {
      this.cvService.setDragMode(false);
    }
    this.cdr.detectChanges();
  }

  setViewMode(mode: 'edit' | 'preview'): void {
    // Empêcher le passage en mode édition pour les utilisateurs gratuits
    if (mode === 'edit' && !this.subscriptionService.isPremium()) {
      this.goToPayment();
      return;
    }
    this.viewMode = mode;
  }

  goHome(): void {
    if (this.isDirty()) {
      const shouldSave = confirm('Vous avez des modifications non sauvegardées. Voulez-vous sauvegarder avant de quitter ?');
      if (shouldSave) {
        this.saveCV();
      }
    }
    this.router.navigate(['/']);
  }

  saveCV(): void {
    this.cvService.saveCV();
  }

  openEmailModal(): void {
    const currentCV = this.currentCV();
    // Pré-remplir avec l'email du contact si disponible
    const emailContact = currentCV?.contactInfo?.find(c => c.type === 'email' && c.visible);
    this.userEmail = emailContact?.value || '';
    this.emailError = '';
    this.showEmailModal = true;
    this.showDataWizard = false;
    this.cdr.detectChanges();
  }

  closeEmailModal(): void {
    this.showEmailModal = false;
    this.userEmail = '';
    this.emailError = '';
    this.cdr.detectChanges();
  }

  getWizardInitialData(): any {
    const currentCV = this.currentCV();
    if (!currentCV) return null;

    return {
      personalInfo: currentCV.personalInfo || {
        firstName: '',
        lastName: '',
        title: '',
        summary: '',
        profileType: 'initials' as const
      },
      contactInfo: currentCV.contactInfo || [],
      experience: currentCV.experience || [],
      education: currentCV.education || [],
      skills: currentCV.skills || [],
      languages: currentCV.languages || []
    };
  }

  onWizardCompleted(data: any): void {
    console.log('✅ Données collectées depuis le wizard:', data);
    this.wizardCollectedData = data;
    this.showDataWizard = false;
    
    // Extraire l'email depuis les données de contact
    const emailContact = data.contactInfo?.find((c: any) => c.type === 'email');
    if (emailContact?.value) {
      this.userEmail = emailContact.value;
    }
    
    // Générer directement le CV avec les données collectées
    this.generateAndSendCVWithData(data);
  }

  async generateAndSendCV(): Promise<void> {
    // Si on a des données du wizard, les utiliser
    if (this.wizardCollectedData) {
      this.generateAndSendCVWithData(this.wizardCollectedData);
      return;
    }

    // Sinon, utiliser les données du CV actuel
    const currentCV = this.currentCV();
    if (!currentCV) {
      // Si pas de CV, ouvrir le wizard
      this.showEmailModal = false;
      this.showDataWizard = true;
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.userEmail || !emailRegex.test(this.userEmail)) {
      this.emailError = 'Veuillez entrer une adresse email valide';
      this.cdr.detectChanges();
      return;
    }

    // Déterminer le template ID depuis le template du CV
    const templateId = currentCV.template?.id || 'cv1';

    this.isExporting = true;
    this.emailError = '';

    try {
      this.cvApiService.generateCVFromFrontend(
        this.userEmail,
        templateId,
        currentCV
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.modalService.showSuccess(
              `${response.message}\nVotre CV a été envoyé à ${this.userEmail}`,
              'CV envoyé avec succès'
            );
            this.closeEmailModal();
          } else {
            this.emailError = 'Erreur lors de la génération du CV';
          }
          this.isExporting = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors de la génération du CV:', error);
          this.emailError = error.error?.error || 'Erreur lors de la génération du CV. Veuillez réessayer.';
          this.isExporting = false;
          this.cdr.detectChanges();
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du CV:', error);
      this.emailError = 'Erreur lors de la génération du CV. Veuillez réessayer.';
      this.isExporting = false;
      this.cdr.detectChanges();
    }
  }

  async generateAndSendCVWithData(data: any): Promise<void> {
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.userEmail || !emailRegex.test(this.userEmail)) {
      this.emailError = 'Veuillez entrer une adresse email valide';
      this.cdr.detectChanges();
      return;
    }

    // Déterminer le template ID depuis le template du CV actuel ou utiliser cv1 par défaut
    const currentCV = this.currentCV();
    const templateId = currentCV?.template?.id || 'cv1';

    this.isExporting = true;
    this.emailError = '';

    // Préparer les données pour le backend
    const cvDataForBackend = {
      personalInfo: data.personalInfo,
      contactInfo: data.contactInfo,
      experience: data.experience || [],
      education: data.education || [],
      skills: data.skills || [],
      languages: data.languages || [],
      interests: data.interests || []
    };

    try {
      this.cvApiService.generateCV({
        userEmail: this.userEmail,
        templateId: templateId,
        cvData: cvDataForBackend
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.modalService.showSuccess(
              `${response.message}\nVotre CV a été envoyé à ${this.userEmail}`,
              'CV envoyé avec succès'
            );
            this.closeEmailModal();
            this.wizardCollectedData = null;
          } else {
            this.emailError = 'Erreur lors de la génération du CV';
          }
          this.isExporting = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur lors de la génération du CV:', error);
          this.emailError = error.error?.error || 'Erreur lors de la génération du CV. Veuillez réessayer.';
          this.isExporting = false;
          this.cdr.detectChanges();
        }
      });
    } catch (error) {
      console.error('Erreur lors de la génération du CV:', error);
      this.emailError = 'Erreur lors de la génération du CV. Veuillez réessayer.';
      this.isExporting = false;
      this.cdr.detectChanges();
    }
  }

  toggleStyleEditor(): void {
    if (!this.subscriptionService.hasFeature('canCustomizeStyles')) {
      this.goToPayment();
      return;
    }
    this.showStyleEditor = !this.showStyleEditor;
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


  onTemplateSelected(templateId: string) {
    console.log('Template sélectionné (depuis cv-template-selector):', templateId);
    // Mettre à jour le template du CV pour la génération backend
    const currentCV = this.cvService.currentCV();
    if (currentCV && currentCV.template) {
      // Mettre à jour l'ID du template pour qu'il corresponde aux fichiers du backend (cv1.html, cv2.html, etc.)
      this.cvService.updateCVData({
        template: {
          ...currentCV.template,
          id: templateId
        }
      });
    }
  }

  onTemplateSelectedFromPicker(template: CVTemplate): void {
    console.log('Template sélectionné depuis le picker:', template);
    
    // Vérifier si le template est gratuit ou si l'utilisateur est premium
    if (!this.subscriptionService.isTemplateFree(template.id) && !this.subscriptionService.isPremium()) {
      this.modalService.showWarning(
        'Ce template est réservé aux abonnés Premium. Passez à Premium pour l\'utiliser.',
        'Template Premium'
      );
      this.goToPayment();
      return;
    }

    // Convertir le template du backend en CVTemplate pour l'application
    const cvTemplate = this.cvService.convertTemplateSelectorToCVTemplate({
      id: template.id,
      name: template.name,
      description: template.description,
      layout: template.layout
    });

    // Appliquer le template au CV
    this.cvService.applyTemplate(cvTemplate);
    
    // Fermer le template picker
    this.showTemplatePicker = false;
    
    // Afficher un message de confirmation
    console.log('✅ Template appliqué:', template.name);
    this.cdr.detectChanges();
  }

  toggleTemplatePicker(): void {
    this.showTemplatePicker = !this.showTemplatePicker;
    if (this.showTemplatePicker && this.viewMode !== 'edit') {
      this.setViewMode('edit');
    }
  }

  toggleHelp(): void {
    const newState = this.cvService.toggleHelp();
    if (newState) {
      setTimeout(() => {
        this.cvPreviewComponent?.startHelpTips();
      }, 0);
      this.showShortcuts = true;
      setTimeout(() => {
        this.showShortcuts = false;
        this.cdr.detectChanges();
      }, 5000);
    } else {
      this.cvService.setHelp(false);
      this.cdr.detectChanges();
    }
  }

  closeAllPanels(): void {
    this.showStyleEditor = false;
    this.showAddSectionMenu = false;
    this.showShortcuts = false;
    this.cvService.setDragMode(false);
    this.cvService.setResizeMode(false);
    this.cdr.detectChanges();
  }

  private setupKeyboardShortcuts(): void {}

  private setupAutoSave(): void {
    setInterval(() => {
      if (this.isDirty()) {
        this.autoSaving = true;
        this.saveCV();
        setTimeout(() => {
          this.autoSaving = false;
          this.cdr.detectChanges();
        }, 1000);
      }
    }, 30000);
  }
}
