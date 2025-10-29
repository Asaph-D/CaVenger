import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';
import { ThemeService } from '../../../services/theme.service';
import { ContactInfo } from '../../../models/cv.interface';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <div class="flex items-center justify-between mb-6">
        <h4 class="text-lg font-semibold">Contact</h4>
        <button
          (click)="addContact()"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-plus mr-2"></i>
          Ajouter
        </button>
      </div>

      <div class="space-y-4">
        <div *ngFor="let contact of contactInfo; trackBy: trackByContactId"
             class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">

          <div class="flex items-center justify-between mb-3">
            <input
              [(ngModel)]="contact.label"
              (ngModelChange)="updateContact(contact.id, {label: contact.label})"
              class="font-medium bg-transparent border-none outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 text-gray-900 dark:text-gray-100"
              placeholder="Label (ex: Email, Téléphone)">
            <button
              (click)="removeContact(contact.id)"
              class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
              <i class="fas fa-trash"></i>
            </button>
          </div>

          <div class="mb-3">
            <input
              [(ngModel)]="contact.value"
              (ngModelChange)="updateContact(contact.id, {value: contact.value})"
              class="w-full text-sm bg-transparent border-none outline-none focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 text-gray-900 dark:text-gray-100"
              placeholder="Valeur (ex: example@email.com)">
          </div>

          <div class="mb-3">
            <select
              [(ngModel)]="contact.type"
              (ngModelChange)="updateContact(contact.id, {type: contact.type})"
              class="w-full text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent px-2 py-1 text-gray-900 dark:text-gray-100">
              <option value="email">Email</option>
              <option value="phone">Téléphone</option>
              <option value="address">Adresse</option>
              <option value="website">Site web</option>
              <option value="linkedin">LinkedIn</option>
              <option value="birthday">Date de naissance</option>
              <option value="marital">Situation matrimoniale</option>
              <option value="nationality">Nationalité</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="contact.visible"
                (ngModelChange)="updateContact(contact.id, {visible: contact.visible})"
                class="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded">
              <span class="text-sm text-gray-700 dark:text-gray-300">Visible</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContactComponent {
  private readonly cvService = inject(CVStateService);
  private readonly themeService = inject(ThemeService);

  currentCV = this.cvService.currentCV;

  get contactInfo(): ContactInfo[] {
    return this.currentCV()?.contactInfo || [];
  }

  updateContact(contactId: string, updates: Partial<ContactInfo>) {
    const cv = this.currentCV();
    if (!cv) return;
    const contact = cv.contactInfo.find(c => c.id === contactId);
    if (contact) {
      Object.assign(contact, updates);
      (this.cvService as any).updateState({ currentCV: { ...cv }, isDirty: true });
    }
  }

  addContact() {
    this.cvService.addContactInfo({
      icon: 'fas fa-envelope',
      label: 'Email',
      value: '',
      type: 'email',
      visible: true
    });
  }

  removeContact(contactId: string) {
    this.cvService.removeContactInfo(contactId);
  }

  trackByContactId(index: number, item: ContactInfo) {
    return item.id;
  }
}
