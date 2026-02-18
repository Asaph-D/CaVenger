import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { Router } from '@angular/router';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    .plan-card {
      transition: all 0.3s ease;
    }
    .plan-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }
    .plan-card.popular {
      border: 2px solid #3b82f6;
      position: relative;
    }
    .plan-card.popular::before {
      content: 'POPULAIRE';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      padding: 4px 16px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }
    .feature-item i {
      color: #10b981;
      font-size: 0.875rem;
    }
    .payment-form {
      animation: slideInUp 0.3s ease-out;
    }
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
  `],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choisissez votre plan
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Débloquez toutes les fonctionnalités premium pour créer des CV professionnels exceptionnels
          </p>
        </div>

        <!-- Plans -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12" *ngIf="!showPaymentForm()">
          <!-- Plan Gratuit -->
          <div class="plan-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gratuit</h3>
              <div class="text-4xl font-bold text-gray-900 dark:text-white mb-1">0€</div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Pour toujours</p>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">13 templates gratuits</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Édition de base</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Sauvegarde locale</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-times-circle text-red-500"></i>
                <span class="text-gray-500 dark:text-gray-400 line-through">Personnalisation avancée</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-times-circle text-red-500"></i>
                <span class="text-gray-500 dark:text-gray-400 line-through">Export PDF</span>
              </li>
            </ul>
            <button 
              (click)="selectPlan(null)"
              class="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              Plan actuel
            </button>
          </div>

          <!-- Plan Premium Mensuel -->
          <div class="plan-card popular bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium</h3>
              <div class="text-4xl font-bold text-gray-900 dark:text-white mb-1">9.99€</div>
              <p class="text-sm text-gray-500 dark:text-gray-400">par mois</p>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Tous les templates</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Personnalisation complète</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Export PDF haute qualité</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Éditeur avancé</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Interactions dans le preview</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Changement de styles</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">200+ icônes</span>
              </li>
            </ul>
            <button 
              (click)="selectPlan('monthly')"
              class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Choisir ce plan
            </button>
          </div>

          <!-- Plan Premium Annuel -->
          <div class="plan-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
            <div class="text-center mb-6">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Premium</h3>
              <div class="text-4xl font-bold text-gray-900 dark:text-white mb-1">79.99€</div>
              <p class="text-sm text-gray-500 dark:text-gray-400">par an</p>
              <div class="mt-2 inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                Économisez 33%
              </div>
            </div>
            <ul class="space-y-3 mb-8">
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Tous les templates</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Personnalisation complète</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Export PDF haute qualité</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Éditeur avancé</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Interactions dans le preview</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">Changement de styles</span>
              </li>
              <li class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span class="text-gray-700 dark:text-gray-300">200+ icônes</span>
              </li>
            </ul>
            <button 
              (click)="selectPlan('yearly')"
              class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Choisir ce plan
            </button>
          </div>
        </div>

        <!-- Formulaire de paiement -->
        <div *ngIf="showPaymentForm()" class="max-w-2xl mx-auto payment-form">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Informations de paiement</h2>
              <button 
                (click)="cancelPayment()"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Plan sélectionné</p>
                  <p class="text-lg font-semibold text-gray-900 dark:text-white">
                    Premium {{ selectedPlan() === 'monthly' ? 'Mensuel' : 'Annuel' }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {{ selectedPlan() === 'monthly' ? '9.99€' : '79.99€' }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ selectedPlan() === 'monthly' ? '/mois' : '/an' }}
                  </p>
                </div>
              </div>
            </div>

            <form (ngSubmit)="processPayment()" class="space-y-6">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  [(ngModel)]="paymentData.email"
                  name="email"
                  required
                  placeholder="votre.email@example.com"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Nom sur la carte -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  [(ngModel)]="paymentData.cardName"
                  name="cardName"
                  required
                  placeholder="Jean Dupont"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Numéro de carte -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  [(ngModel)]="paymentData.cardNumber"
                  name="cardNumber"
                  required
                  placeholder="1234 5678 9012 3456"
                  maxlength="19"
                  (input)="formatCardNumber($event)"
                  class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <!-- Date d'expiration et CVV -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="paymentData.expiryDate"
                    name="expiryDate"
                    required
                    placeholder="MM/AA"
                    maxlength="5"
                    (input)="formatExpiryDate($event)"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="paymentData.cvv"
                    name="cvv"
                    required
                    placeholder="123"
                    maxlength="4"
                    (input)="formatCVV($event)"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <!-- Boutons -->
              <div class="flex gap-4 pt-4">
                <button
                  type="button"
                  (click)="cancelPayment()"
                  class="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Annuler
                </button>
                <button
                  type="submit"
                  [disabled]="isProcessing()"
                  class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
                  <span *ngIf="!isProcessing()">Payer maintenant</span>
                  <span *ngIf="isProcessing()" class="flex items-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Traitement...
                  </span>
                </button>
              </div>
            </form>

            <!-- Note de sécurité -->
            <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="flex items-start gap-3">
                <i class="fas fa-lock text-gray-500 dark:text-gray-400 mt-1"></i>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  <p class="font-semibold mb-1">Paiement sécurisé</p>
                  <p>Vos informations de paiement sont cryptées et sécurisées. L'intégration API sera effectuée ultérieurement.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overlay de chargement -->
        <div *ngIf="isProcessing()" class="loading-overlay">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Traitement du paiement...</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">Veuillez patienter</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentComponent implements OnInit {
  protected subscriptionService = inject(SubscriptionService);
  private router = inject(Router);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  
  @Output() paymentCompleted = new EventEmitter<void>();
  @Output() paymentCancelled = new EventEmitter<void>();

  showPaymentForm = signal(false);
  selectedPlan = signal<'monthly' | 'yearly' | null>(null);
  isProcessing = signal(false);

  paymentData = {
    email: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  };

  ngOnInit(): void {
    // Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.modalService.showWarning(
        'Vous devez être connecté pour accéder au paiement premium.',
        'Connexion requise'
      );
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/payment' } });
      return;
    }

    // Pré-remplir l'email avec l'email de l'utilisateur connecté
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      this.paymentData.email = user.email;
    }
  }

  selectPlan(plan: 'monthly' | 'yearly' | null): void {
    if (plan === null) {
      // Plan gratuit - ne rien faire
      return;
    }
    this.selectedPlan.set(plan);
    this.showPaymentForm.set(true);
  }

  cancelPayment(): void {
    this.showPaymentForm.set(false);
    this.selectedPlan.set(null);
    this.paymentCancelled.emit();
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '');
    value = value.replace(/(.{4})/g, '$1 ').trim();
    this.paymentData.cardNumber = value;
  }

  formatExpiryDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentData.expiryDate = value;
  }

  formatCVV(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.paymentData.cvv = input.value.replace(/\D/g, '');
  }

  async processPayment(): Promise<void> {
    if (!this.selectedPlan()) {
      return;
    }

    this.isProcessing.set(true);

    try {
      const result = await this.subscriptionService.processPayment({
        plan: this.selectedPlan(),
        ...this.paymentData
      });

      if (result.success) {
        // Attendre un peu pour l'effet visuel
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.paymentCompleted.emit();
        // Rediriger vers l'accueil ou le builder
        this.router.navigate(['/']);
      } else {
        this.modalService.showError(
          'Erreur lors du paiement: ' + result.message,
          'Erreur de paiement'
        );
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      this.modalService.showError(
        'Une erreur est survenue lors du traitement du paiement.',
        'Erreur de paiement'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }
}


