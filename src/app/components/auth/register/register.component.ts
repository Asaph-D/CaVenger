import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .auth-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      transition: background 0.6s ease;
      position: relative;
    }

    .auth-container.lamp-on {
      background: linear-gradient(135deg, #2a2a3e 0%, #26314e 100%);
    }

    .content-section {
      flex: 1;
      padding: 60px 40px 40px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      z-index: 1;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .info-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 25px;
      transition: all 0.3s ease;
    }

    .info-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(212, 175, 55, 0.2);
    }

    .info-card h3 {
      color: #d4af37;
      font-size: 20px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .info-card h3 i {
      font-size: 24px;
    }

    .info-card p {
      color: #ccc;
      line-height: 1.6;
      font-size: 14px;
    }

    .info-card ul {
      list-style: none;
      padding: 0;
      margin-top: 15px;
    }

    .info-card ul li {
      color: #ccc;
      padding: 8px 0;
      padding-left: 25px;
      position: relative;
      font-size: 14px;
    }

    .info-card ul li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #d4af37;
      font-weight: bold;
    }

    .encouragement-section {
      text-align: center;
      margin: 40px 0;
      padding: 30px;
      background: rgba(212, 175, 55, 0.1);
      border-radius: 15px;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    .encouragement-section h2 {
      color: #d4af37;
      font-size: 28px;
      margin-bottom: 15px;
      font-weight: 300;
    }

    .encouragement-section p {
      color: #fff;
      font-size: 16px;
      line-height: 1.8;
    }

    .history-section {
      margin-top: 40px;
      padding: 30px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 15px;
      border-left: 4px solid #d4af37;
    }

    .history-section h3 {
      color: #d4af37;
      font-size: 22px;
      margin-bottom: 20px;
    }

    .history-timeline {
      position: relative;
      padding-left: 30px;
    }

    .history-timeline::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #d4af37, transparent);
    }

    .history-item {
      position: relative;
      margin-bottom: 25px;
      padding-left: 20px;
    }

    .history-item::before {
      content: '';
      position: absolute;
      left: -34px;
      top: 5px;
      width: 12px;
      height: 12px;
      background: #d4af37;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    }

    .history-item h4 {
      color: #fff;
      font-size: 16px;
      margin-bottom: 5px;
    }

    .history-item p {
      color: #ccc;
      font-size: 14px;
      line-height: 1.6;
    }

    .container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 900px;
      height: 600px;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 100px;
    }

    .lamp-container {
      position: relative;
      z-index: 2;
      cursor: grab;
      user-select: none;
    }

    .lamp-container:active {
      cursor: grabbing;
    }

    .lamp-hint {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      color: #d4af37;
      font-size: 14px;
      text-align: center;
      opacity: 0.8;
      animation: pulse 2s infinite;
      pointer-events: none;
      white-space: nowrap;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.4; }
    }

    .lamp {
      position: relative;
    }

    .lamp-shade {
      width: 120px;
      height: 60px;
      background: #fff;
      border-radius: 50% 50% 0 0;
      position: relative;
      box-shadow: 0 20px 60px rgba(212, 175, 55, 0.6);
      transition: box-shadow 0.3s ease;
    }

    .lamp-shade.on {
      box-shadow: 0 30px 80px rgba(212, 175, 55, 0.9);
    }

    .lamp-pole {
      width: 8px;
      height: 100px;
      background: linear-gradient(to bottom, #e0e0e0, #a0a0a0);
      margin: 0 auto;
      position: relative;
    }

    .lamp-base {
      width: 80px;
      height: 30px;
      background: linear-gradient(to bottom, #a0a0a0, #707070);
      border-radius: 50%;
      margin: 0 auto;
      position: relative;
    }

    .chain {
      position: absolute;
      width: 3px;
      background: #888;
      left: 50%;
      transform: translateX(-50%);
      top: 55px;
      height: 40px;
      z-index: 3;
      transition: height 0.3s ease;
      cursor: grab;
    }

    .chain:active {
      cursor: grabbing;
    }

    .chain::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      background: #d4af37;
      border-radius: 50%;
    }

    .chain::before {
      content: '';
      position: absolute;
      bottom: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 10px;
      height: 10px;
      background: #c9a961;
      border-radius: 50%;
    }

    .auth-modal {
      position: relative;
      transform: translateY(400px);
      background: rgba(40, 40, 40, 0.95);
      backdrop-filter: blur(20px);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      width: 380px;
      max-height: 90vh;
      overflow-y: auto;
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: none;
      z-index: 3;
    }

    .auth-modal.active {
      transform: translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    .auth-modal h2 {
      color: #fff;
      font-size: 28px;
      margin-bottom: 30px;
      text-align: center;
      font-weight: 300;
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-group label {
      display: block;
      color: #999;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .input-group input {
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .input-group input:focus {
      outline: none;
      border-color: #d4af37;
      background: rgba(255, 255, 255, 0.08);
    }

    .input-group input.ng-invalid.ng-touched {
      border-color: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
    }

    .auth-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #d4af37 0%, #c9a961 100%);
      border: none;
      border-radius: 8px;
      color: #1a1a2e;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }

    .auth-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
    }

    .auth-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .light-glow {
      position: absolute;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .light-glow.on {
      opacity: 1;
    }

    .link-to-login {
      text-align: center;
      margin-top: 20px;
      color: #999;
      font-size: 14px;
    }

    .link-to-login a {
      color: #d4af37;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .link-to-login a:hover {
      color: #c9a961;
    }

    @media (max-width: 768px) {
      .content-section {
        padding: 40px 20px 40px;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .lamp-container {
        left: 50%;
        transform: translateX(-50%);
      }

      .auth-modal {
        right: 50%;
        transform: translateX(50%) translateY(-50%) translateY(400px);
        width: 90%;
        max-width: 380px;
      }

      .auth-modal.active {
        transform: translateX(50%) translateY(-50%) translateY(0);
      }
    }
  `],
  template: `
    <div class="auth-container" [class.lamp-on]="isLampOn()">
      <!-- Contenu informatif en arrière-plan -->
      <div class="content-section">
        <!-- Guides et informations -->
        <div class="info-grid">
          <div class="info-card">
            <h3><i class="fas fa-rocket"></i> Commencez Votre Voyage</h3>
            <p>Rejoignez CaVenger et créez votre CV professionnel :</p>
            <ul>
              <li>Inscription gratuite et rapide</li>
              <li>Accès à 13 templates gratuits</li>
              <li>Création de CV en quelques minutes</li>
              <li>Export PDF illimité</li>
            </ul>
          </div>

          <div class="info-card">
            <h3><i class="fas fa-gift"></i> Avantages Gratuits</h3>
            <p>Profitez dès maintenant de :</p>
            <ul>
              <li>Templates professionnels gratuits</li>
              <li>Création de CV pas à pas</li>
              <li>Génération PDF par email</li>
              <li>Prévisualisation en temps réel</li>
            </ul>
          </div>

          <div class="info-card">
            <h3><i class="fas fa-crown"></i> Passez à Premium</h3>
            <p>Débloquez des fonctionnalités avancées :</p>
            <ul>
              <li>Édition avancée avec drag & drop</li>
              <li>Personnalisation complète des styles</li>
              <li>Templates exclusifs Premium</li>
              <li>Support prioritaire</li>
            </ul>
          </div>
        </div>

        <!-- Section d'encouragement -->
        <div class="encouragement-section">
          <h2>🌟 Rejoignez Notre Communauté 🌟</h2>
          <p>
            Des milliers de professionnels font confiance à CaVenger pour créer leur CV.<br>
            Commencez votre parcours dès aujourd'hui et donnez vie à votre carrière !
          </p>
        </div>

        <!-- Historique de la plateforme -->
        <div class="history-section">
          <h3><i class="fas fa-history"></i> Notre Histoire</h3>
          <div class="history-timeline">
            <div class="history-item">
              <h4>2024 - Lancement de CaVenger</h4>
              <p>Naissance de la plateforme avec une vision : rendre la création de CV accessible à tous, avec des outils professionnels et modernes.</p>
            </div>
            <div class="history-item">
              <h4>2024 - Premiers Templates</h4>
              <p>Développement de notre collection de templates gratuits, permettant à chacun de créer un CV professionnel sans compétences techniques.</p>
            </div>
            <div class="history-item">
              <h4>2024 - Version Premium</h4>
              <p>Lancement des fonctionnalités Premium pour offrir encore plus de personnalisation et d'outils avancés aux utilisateurs.</p>
            </div>
            <div class="history-item">
              <h4>Aujourd'hui - Innovation Continue</h4>
              <p>Nous continuons d'améliorer la plateforme avec de nouvelles fonctionnalités, templates et outils pour vous aider à briller.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Lampe interactive -->
      <div class="container">
        <div class="lamp-container">
          <div class="lamp">
            <div class="light-glow" [class.on]="isLampOn()"></div>
            <div class="lamp-shade" [class.on]="isLampOn()"></div>
            <div 
              class="chain" 
              [style.height.px]="chainHeight()"
              (mousedown)="startDrag($event)"
              (touchstart)="startDrag($event)"
            ></div>
            <div class="lamp-pole"></div>
            <div class="lamp-base"></div>
          </div>
          <div class="lamp-hint" *ngIf="!isLampOn()">
            <i class="fas fa-hand-pointer"></i> Tirez sur la chaîne pour vous inscrire
          </div>
        </div>

        <div class="auth-modal" [class.active]="isLampOn()">
          <h2>Inscription</h2>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="input-group">
              <label>Nom complet</label>
              <input 
                type="text" 
                formControlName="fullName"
                placeholder="Jean Dupont"
                [class.ng-invalid]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
              >
              <div *ngIf="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched" class="error-message">
                Le nom est requis
              </div>
            </div>
            <div class="input-group">
              <label>Email</label>
              <input 
                type="email" 
                formControlName="email"
                placeholder="votre.email@example.com"
                [class.ng-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              >
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="error-message">
                <span *ngIf="registerForm.get('email')?.errors?.['required']">L'email est requis</span>
                <span *ngIf="registerForm.get('email')?.errors?.['email']">Format d'email invalide</span>
              </div>
            </div>
            <div class="input-group">
              <label>Mot de passe</label>
              <input 
                type="password" 
                formControlName="password"
                placeholder="••••••••"
                [class.ng-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              >
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="error-message">
                <span *ngIf="registerForm.get('password')?.errors?.['required']">Le mot de passe est requis</span>
                <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Le mot de passe doit contenir au moins 6 caractères</span>
              </div>
            </div>
            <div class="input-group">
              <label>Confirmer le mot de passe</label>
              <input 
                type="password" 
                formControlName="confirmPassword"
                placeholder="••••••••"
                [class.ng-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              >
              <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="error-message">
                <span *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">La confirmation est requise</span>
                <span *ngIf="registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched">Les mots de passe ne correspondent pas</span>
              </div>
            </div>
            <div *ngIf="errorMessage()" class="error-message" style="margin-bottom: 15px; padding: 10px; background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); border-radius: 8px;">
              <i class="fas fa-exclamation-circle mr-2"></i>{{ errorMessage() }}
            </div>
            <button 
              type="submit" 
              class="auth-btn"
              [disabled]="registerForm.invalid || isLoading()"
            >
              <span *ngIf="!isLoading()">S'inscrire</span>
              <span *ngIf="isLoading()">Inscription...</span>
            </button>
          </form>
          <div class="link-to-login">
            Déjà un compte ? <a routerLink="/login">Se connecter</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLampOn = signal(false);
  chainHeight = signal(40);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  
  private isDragging = false;
  private startY = 0;
  private currentY = 0;
  private dragDistance = 0;

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Écouter les événements de drag globaux
    document.addEventListener('mousemove', this.onDrag.bind(this));
    document.addEventListener('mouseup', this.onEndDrag.bind(this));
    document.addEventListener('touchmove', this.onTouchDrag.bind(this));
    document.addEventListener('touchend', this.onEndDrag.bind(this));
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
    this.startY = clientY;
  }

  onDrag(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.currentY = event.clientY;
    this.dragDistance = this.currentY - this.startY;

    // Limite le drag entre 0 et 50px vers le bas
    if (this.dragDistance > 0 && this.dragDistance < 50) {
      this.chainHeight.set(40 + this.dragDistance);
    }
  }

  onTouchDrag(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    this.currentY = event.touches[0].clientY;
    this.dragDistance = this.currentY - this.startY;

    // Limite le drag entre 0 et 50px vers le bas
    if (this.dragDistance > 0 && this.dragDistance < 50) {
      this.chainHeight.set(40 + this.dragDistance);
    }
  }

  onEndDrag(): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.chainHeight.set(40);

    // Si on a tiré plus de 30px, on toggle la lampe
    if (this.dragDistance > 30) {
      this.toggleLamp();
    }

    this.dragDistance = 0;
  }

  toggleLamp(): void {
    this.isLampOn.set(!this.isLampOn());
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      const registerData = {
        fullName: this.registerForm.value.fullName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          if (response.success) {
            // Rediriger vers la page d'accueil après inscription réussie
            this.router.navigate(['/']);
          } else {
            this.errorMessage.set(response.message || 'Erreur lors de l\'inscription');
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          this.errorMessage.set(error || 'Erreur lors de l\'inscription. Veuillez réessayer.');
          this.isLoading.set(false);
        }
      });
    }
  }
}

