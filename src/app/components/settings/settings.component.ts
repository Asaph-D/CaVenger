import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';
import { ModalService } from '../../services/modal.service';
import { HttpClient } from '@angular/common/http';
import { getAuthUrl } from '../../config/api.config';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Paramètres
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            Gérez votre compte et vos préférences
          </p>
        </div>

        <!-- Informations du compte -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Informations du compte
          </h2>
          
          <div *ngIf="currentUser(); else noUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                [value]="currentUser()?.email"
                disabled
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                [value]="currentUser()?.fullName || (currentUser()?.firstName + ' ' + currentUser()?.lastName) || 'Non défini'"
                disabled
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
            </div>
          </div>

          <ng-template #noUser>
            <p class="text-gray-500 dark:text-gray-400">Aucun utilisateur connecté</p>
          </ng-template>
        </div>

        <!-- Abonnement -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Abonnement
          </h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  Statut actuel
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ subscriptionService.isPremium() ? 'Premium' : 'Gratuit' }}
                </p>
              </div>
              <span 
                [class]="subscriptionService.isPremium() 
                  ? 'px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold'
                  : 'px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full text-sm font-semibold'">
                {{ subscriptionService.isPremium() ? 'Premium' : 'Gratuit' }}
              </span>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">
                    Mode Premium
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Activez ou désactivez le mode premium
                  </p>
                </div>
                <div class="relative">
                  <input
                    type="checkbox"
                    [checked]="subscriptionService.isPremium()"
                    (change)="togglePremium($event)"
                    [disabled]="isUpdating()"
                    class="sr-only"
                    id="premium-toggle"
                  />
                  <label
                    for="premium-toggle"
                    [class]="subscriptionService.isPremium()
                      ? 'block w-14 h-8 bg-purple-600 rounded-full cursor-pointer transition-colors'
                      : 'block w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer transition-colors'"
                  >
                    <span
                      [class]="subscriptionService.isPremium()
                        ? 'absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform translate-x-6'
                        : 'absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform translate-x-0'"
                    ></span>
                  </label>
                </div>
              </label>
            </div>

            <div *ngIf="!subscriptionService.isPremium()" class="mt-4">
              <a
                routerLink="/payment"
                class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <i class="fas fa-crown mr-2"></i>
                Passer à Premium
              </a>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Actions
          </h2>

          <div class="space-y-4">
            <button
              (click)="handleLogout()"
              class="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
              <i class="fas fa-sign-out-alt mr-2"></i>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  subscriptionService = inject(SubscriptionService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private http = inject(HttpClient);

  currentUser = signal<User | null>(null);
  isUpdating = signal(false);

  ngOnInit(): void {
    // Récupérer l'utilisateur actuel
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);

    // Synchroniser le subscriptionTier avec l'utilisateur connecté
    if (user?.subscriptionTier) {
      this.subscriptionService.setSubscriptionTier(user.subscriptionTier);
    }

    // S'abonner aux changements de l'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
      if (user?.subscriptionTier) {
        this.subscriptionService.setSubscriptionTier(user.subscriptionTier);
      }
    });
  }

  togglePremium(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newTier = target.checked ? 'premium' : 'free';

    this.modalService.showConfirm(
      `Êtes-vous sûr de vouloir ${newTier === 'premium' ? 'activer' : 'désactiver'} le mode premium ?`,
      'Confirmation',
      () => {
        this.updateSubscriptionTier(newTier);
      },
      () => {
        // Réinitialiser le toggle si annulé
        target.checked = !target.checked;
      }
    );
  }

  updateSubscriptionTier(tier: 'free' | 'premium'): void {
    this.isUpdating.set(true);
    const oldTier = this.subscriptionService.getSubscriptionTier();

    // Mettre à jour localement
    this.subscriptionService.setSubscriptionTier(tier);

    // Mettre à jour sur le backend
    this.http.patch(getAuthUrl('/subscription'), { subscriptionTier: tier })
      .subscribe({
        next: (response: any) => {
          this.isUpdating.set(false);
          if (response.success) {
            // Mettre à jour l'utilisateur dans AuthService
            const user = this.authService.getCurrentUser();
            if (user) {
              user.subscriptionTier = tier;
              this.authService.setUser(user);
            }

            this.modalService.showSuccess(
              `Mode ${tier === 'premium' ? 'Premium' : 'Gratuit'} activé avec succès`,
              'Abonnement mis à jour'
            );
          }
        },
        error: (error) => {
          this.isUpdating.set(false);
          // Revenir à l'ancien statut en cas d'erreur
          this.subscriptionService.setSubscriptionTier(oldTier);

          this.modalService.showError(
            'Erreur lors de la mise à jour de l\'abonnement',
            'Erreur'
          );
        }
      });
  }

  handleLogout(): void {
    this.modalService.showConfirm(
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      'Déconnexion',
      () => {
        this.authService.logout();
        this.modalService.showInfo('Vous avez été déconnecté avec succès');
      }
    );
  }
}

