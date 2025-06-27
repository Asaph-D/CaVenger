import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CVStateService } from '../../../services/cv-state.service';
import { ContactInfo } from '../../../models/cv.interface';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
    <div class="flex items-center justify-between mb-6">
        <h4 class="text-lg font-semibold text-gray-900">Contact</h4>
        <button
        (click)="addContact()"
        class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
        <i class="fas fa-plus mr-2"></i>
        Ajouter
        </button>
    </div>

    <div class="space-y-4">
        <div *ngFor="let contact of contactInfo; trackBy: trackByContactId" class="bg-gray-50 p-4 rounded-lg">
        <div class="flex items-center justify-between mb-3">
            <input
            [(ngModel)]="contact.label"
            (ngModelChange)="updateContact(contact.id, {label: contact.label})"
            class="font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-purple-300 focus:rounded px-2 py-1"
            placeholder="Label (ex: Email, Téléphone)">
            <button
            (click)="removeContact(contact.id)"
            class="text-red-600 hover:text-red-800 transition-colors">
            <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="mb-3">
            <input
            [(ngModel)]="contact.value"
            (ngModelChange)="updateContact(contact.id, {value: contact.value})"
            class="w-full text-sm text-gray-600 bg-transparent border-none outline-none focus:bg-white focus:border focus:border-purple-300 focus:rounded px-2 py-1"
            placeholder="Valeur (ex: example@email.com)">
        </div>
        <div class="mb-3">
            <select
            [(ngModel)]="contact.type"
            (ngModelChange)="updateContact(contact.id, {type: contact.type})"
            class="w-full text-sm bg-transparent border-none outline-none focus:bg-white focus:border focus:border-purple-300 focus:rounded px-2 py-1">
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
            <label>
            <input type="checkbox" [(ngModel)]="contact.visible" (ngModelChange)="updateContact(contact.id, {visible: contact.visible})">
            Visible
            </label>
        </div>
        </div>
    </div>
</div>`
})
export class ContactComponent {
  private readonly cvService = inject(CVStateService);

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