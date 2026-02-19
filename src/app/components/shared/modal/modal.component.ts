import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalConfig, ModalType } from '../../../services/modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isVisible()"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] transition-opacity duration-300"
      (click)="onBackdropClick()">
      <div 
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100"
        [class.scale-95]="!isVisible()"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                [ngClass]="getIconColorClass()">
                <i [class]="getIcon()"></i>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ getTitle() }}
              </h3>
            </div>
            <button 
              (click)="close()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6">
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {{ getMessage() }}
          </p>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button 
            *ngIf="showCancel()"
            (click)="onCancel()"
            class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            {{ getCancelText() }}
          </button>
          <button 
            (click)="onConfirm()"
            class="px-6 py-2 rounded-lg transition-colors"
            [ngClass]="getConfirmButtonClass()">
            {{ getConfirmText() }}
          </button>
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
export class ModalComponent implements OnInit, OnDestroy {
  private modalService = inject(ModalService);
  private subscription?: Subscription;

  isVisible = this.modalService.isVisible;
  currentConfig = this.modalService.currentConfig;

  ngOnInit(): void {
    this.subscription = this.modalService.getModal$().subscribe();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getTitle(): string {
    return this.currentConfig()?.title || 'Information';
  }

  getMessage(): string {
    return this.currentConfig()?.message || '';
  }

  getType(): ModalType {
    return this.currentConfig()?.type || 'info';
  }

  showCancel(): boolean {
    return this.currentConfig()?.showCancel || false;
  }

  getConfirmText(): string {
    return this.currentConfig()?.confirmText || 'OK';
  }

  getCancelText(): string {
    return this.currentConfig()?.cancelText || 'Annuler';
  }

  getIcon(): string {
    return this.currentConfig()?.icon || 'fas fa-info-circle';
  }

  getIconColorClass(): string {
    const type = this.getType();
    const classes: Record<ModalType, string> = {
      'info': 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      'success': 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      'warning': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
      'error': 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
      'confirm': 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
    };
    return classes[type] || classes.info;
  }

  getConfirmButtonClass(): string {
    const type = this.getType();
    const classes: Record<ModalType, string> = {
      'info': 'bg-blue-600 hover:bg-blue-700 text-white',
      'success': 'bg-green-600 hover:bg-green-700 text-white',
      'warning': 'bg-yellow-600 hover:bg-yellow-700 text-white',
      'error': 'bg-red-600 hover:bg-red-700 text-white',
      'confirm': 'bg-purple-600 hover:bg-purple-700 text-white'
    };
    return classes[type] || classes.info;
  }

  onConfirm(): void {
    const config = this.currentConfig();
    if (config?.onConfirm) {
      config.onConfirm();
    }
    this.close();
  }

  onCancel(): void {
    const config = this.currentConfig();
    if (config?.onCancel) {
      config.onCancel();
    }
    this.close();
  }

  onBackdropClick(): void {
    // Ne pas fermer sur le backdrop pour les confirmations
    if (this.getType() !== 'confirm') {
      this.close();
    }
  }

  close(): void {
    this.modalService.close();
  }
}






