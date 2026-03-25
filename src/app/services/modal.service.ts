import { Injectable, inject, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ModalType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface ModalConfig {
  title?: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  icon?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new Subject<ModalConfig | null>();
  public isVisible = signal(false);
  public currentConfig = signal<ModalConfig | null>(null);

  /**
   * Affiche une modal d'information
   */
  showInfo(message: string, title: string = 'Information'): void {
    this.show({
      title,
      message,
      type: 'info',
      showCancel: false,
      icon: 'fas fa-info-circle'
    });
  }

  /**
   * Affiche une modal de succès
   */
  showSuccess(message: string, title: string = 'Succès'): void {
    this.show({
      title,
      message,
      type: 'success',
      showCancel: false,
      icon: 'fas fa-check-circle'
    });
  }

  /**
   * Affiche une modal d'avertissement
   */
  showWarning(message: string, title: string = 'Avertissement'): void {
    this.show({
      title,
      message,
      type: 'warning',
      showCancel: false,
      icon: 'fas fa-exclamation-triangle'
    });
  }

  /**
   * Affiche une modal d'erreur
   */
  showError(message: string, title: string = 'Erreur'): void {
    this.show({
      title,
      message,
      type: 'error',
      showCancel: false,
      icon: 'fas fa-times-circle'
    });
  }

  /**
   * Affiche une modal de confirmation
   */
  showConfirm(
    message: string,
    title: string = 'Confirmation',
    onConfirm?: () => void,
    onCancel?: () => void
  ): void {
    this.show({
      title,
      message,
      type: 'confirm',
      showCancel: true,
      confirmText: 'Oui',
      cancelText: 'Non',
      icon: 'fas fa-question-circle',
      onConfirm,
      onCancel
    });
  }

  /**
   * Affiche une modal personnalisée
   */
  show(config: ModalConfig): void {
    const defaultConfig: ModalConfig = {
      type: 'info',
      showCancel: false,
      confirmText: 'OK',
      cancelText: 'Annuler',
      icon: 'fas fa-info-circle',
      ...config
    };
    
    this.currentConfig.set(defaultConfig);
    this.isVisible.set(true);
    this.modalSubject.next(defaultConfig);
  }

  /**
   * Ferme la modal
   */
  close(): void {
    this.isVisible.set(false);
    this.currentConfig.set(null);
    this.modalSubject.next(null);
  }

  /**
   * Observable pour écouter les changements de modal
   */
  getModal$(): Observable<ModalConfig | null> {
    return this.modalSubject.asObservable();
  }
}














