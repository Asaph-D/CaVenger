import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { CVSection } from '../../models/cv.interface';
import { CVStateService } from '../../services/cv-state.service';
import { IconPickerComponent } from '../shared/icon-picker/icon-picker.component';

@Component({
  selector: 'app-cv-preview',
  standalone: true,
  imports: [CommonModule, IconPickerComponent],
  template: `
    <div #cvContainer 
         class="cv-preview-container bg-white shadow-2xl rounded-lg overflow-hidden print-optimize relative" 
         [style.font-family]="currentCV()?.theme?.fontFamily?.body"
         [style.font-size.px]="currentCV()?.layout?.fontSize?.body"
         (mouseenter)="showResizeHandles = true"
         (mouseleave)="showResizeHandles = false">
      
      <!-- Resize handles -->
      <div *ngIf="showResizeHandles && !isPrinting" class="resize-handles">
        <!-- Column resize handle -->
        <div class="column-resize-handle"
             [style.left.%]="currentCV()?.layout?.leftColumnWidth"
             (mousedown)="startColumnResize($event)"
             title="Redimensionner les colonnes">
          <div class="resize-line"></div>
        </div>
        
        <!-- Font size controls -->
        <div class="font-size-controls">
          <button (click)="adjustFontSize(-1)" title="Diminuer la taille">
            <i class="fas fa-minus"></i>
          </button>
          <span>{{ currentCV()?.layout?.fontSize?.body }}px</span>
          <button (click)="adjustFontSize(1)" title="Augmenter la taille">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="flex flex-row min-h-[297mm] relative">
        
        <!-- Left Column -->
        <div class="left-column transition-all duration-300"
             [style.width.%]="currentCV()?.layout?.leftColumnWidth"
             [style.background]="getGradientBackground()"
             [class.dragging]="isDragging">
          
          <!-- Profile Section -->
          <div class="profile-section p-8 text-white text-center"
               [ngClass]="{'dragging': isDragging && dragType === 'profile-picture'}"
               [style.justifyContent]="currentCV()?.layout?.profilePicturePosition === 'center-top' ? 'flex-start' : 'center'"
               [style.alignItems]="currentCV()?.layout?.profilePicturePosition === 'center-top' ? 'center' : 'flex-start'">
            <!-- Profile Picture -->
            <div class="profile-picture-container mb-6 relative group"
                 [ngClass]="getProfileDragClass('left')"
                 draggable="true"
                 (dragstart)="onProfileDragStart($event)"
                 (dragend)="onProfileDragEnd()"
                 (touchstart)="isMobileDragging = true"
                 (touchend)="isMobileDragging = false">
              <div class="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg relative cursor-pointer"
                   (click)="toggleProfilePictureType()">
                
                <div *ngIf="currentCV()?.personalInfo?.profileType === 'initials'" 
                     class="w-full h-full bg-white flex items-center justify-center text-4xl font-bold"
                     [style.color]="currentCV()?.theme?.primaryColor">
                  {{ getInitials() }}
                </div>
                
                <img *ngIf="currentCV()?.personalInfo?.profileType === 'image' && currentCV()?.personalInfo?.profilePicture" 
                     [src]="currentCV()?.personalInfo?.profilePicture"
                     alt="Profile Picture"
                     class="w-full h-full object-cover">
                
                <div *ngIf="currentCV()?.personalInfo?.profileType === 'image' && !currentCV()?.personalInfo?.profilePicture"
                     class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <i class="fas fa-camera text-2xl"></i>
                </div>
              </div>

              <!-- Profile options overlay -->
              <div *ngIf="showProfileOptions" 
                   class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div class="text-white text-center">
                  <button (click)="changeProfilePicture()" class="block mb-2 text-sm hover:text-yellow-300">
                    <i class="fas fa-camera mr-1"></i>
                    {{ currentCV()?.personalInfo?.profileType === 'image' ? 'Changer' : 'Ajouter' }}
                  </button>
                  <button (click)="toggleProfilePictureType()" class="block text-sm hover:text-yellow-300">
                    <i class="fas fa-user mr-1"></i>
                    {{ currentCV()?.personalInfo?.profileType === 'image' ? 'Initiales' : 'Image' }}
                  </button>
                </div>
              </div>
            </div>

            <h1 class="text-2xl font-bold mb-2" [style.font-family]="currentCV()?.theme?.fontFamily?.heading" [style.font-size.px]="(currentCV()?.layout?.fontSize?.heading ?? 0) * 1.1">
              {{ currentCV()?.personalInfo?.firstName }} {{ currentCV()?.personalInfo?.lastName }}
            </h1>
            <h2 class="text-lg opacity-90 mb-4" [style.font-size.px]="currentCV()?.layout?.fontSize?.heading">
              {{ currentCV()?.personalInfo?.title }}
            </h2>
          </div>

          <!-- Left Column Sections -->
          <div class="px-8 pb-8">
            <div *ngFor="let section of getLeftSections(); trackBy: trackBySection" 
                class="section-container mb-8 relative group cursor-pointer hover:bg-white hover:bg-opacity-10 rounded-lg transition-all p-2 -m-2"
                [attr.data-section-id]="section.id"
                [class.ring-2]="cvService.selectedSection() === section.id"
                [class.ring-yellow-400]="cvService.selectedSection() === section.id"
                (click)="selectSection(section.id)"
                (mouseenter)="hoveredSection = section.id"
                (mouseleave)="hoveredSection = null"
                [class.dragging]="isDragging && draggedSection?.id === section.id"
                [class.drag-over-valid]="dragOverIndex === getSectionIndex(section.id, 'left') && dragValid"
                [class.drag-over-invalid]="dragOverIndex === getSectionIndex(section.id, 'left') && !dragValid"
                draggable="true"
                (dragstart)="onDragStart($event, section, 'left')"
                (dragover)="onDragOver($event, section.id, 'left')"
                (drop)="onDrop($event, section.id, 'left')"
                (dragend)="onDragEnd()">
              
              <!-- Section controls -->
              <div *ngIf="hoveredSection === section.id && !isPrinting" 
                  class="section-controls absolute -top-2 -right-2 z-10">
                <button (click)="editSection(section.id); $event.stopPropagation()" 
                        class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 mr-1"
                        title="Éditer la section">
                  <i class="fas fa-edit"></i>
                </button>
                <button (click)="removeSection(section.id); $event.stopPropagation()" 
                        class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        title="Supprimer la section">
                  <i class="fas fa-trash"></i>
                </button>
              </div>

              <ng-container [ngSwitch]="section.type">
                
                <!-- Contact Section -->
                <div *ngSwitchCase="'contact'">
                  <h3 class="text-xl font-bold mb-4 section-divider text-white" [style.font-size.px]="currentCV()?.layout?.fontSize?.heading">CONTACT</h3>
                  <div class="space-y-3">
                    <div *ngFor="let contact of getVisibleContactInfo()" class="flex items-start text-white group">
                      <i [class]="contact.icon + ' mt-1 mr-3 opacity-80 cursor-pointer hover:opacity-100'"
                         (click)="openIconPicker('contact', contact.id)"
                         title="Changer l'icône"></i>
                      <div class="flex-1">
                        <p class="font-medium">{{ contact.label }}</p>
                        <p class="opacity-80 text-sm break-all">{{ contact.value }}</p>
                      </div>
                      <button *ngIf="hoveredSection === section.id" 
                              (click)="removeContactInfo(contact.id)"
                              class="ml-2 text-red-300 hover:text-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fas fa-times text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Skills Section -->
                <div *ngSwitchCase="'skills'">
                  <h3 class="text-xl font-bold mb-4 section-divider text-white" [style.font-size.px]="currentCV()?.layout?.fontSize?.heading">COMPÉTENCES</h3>
                  <div class="space-y-3">
                    <div *ngFor="let skill of getVisibleSkills()" class="skill-item group">
                      <div class="flex items-center justify-between mb-1">
                        <p class="font-medium text-white">{{ skill.name }}</p>
                        <button *ngIf="hoveredSection === section.id" 
                                (click)="removeSkill(skill.id)"
                                class="text-red-300 hover:text-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i class="fas fa-times text-xs"></i>
                        </button>
                      </div>
                      <div class="skill-bar bg-white bg-opacity-30 rounded-full h-2">
                        <div class="skill-progress bg-white rounded-full h-full transition-all duration-300"
                             [style.width.%]="skill.level"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Languages Section -->
                <div *ngSwitchCase="'languages'">
                  <h3 class="text-xl font-bold mb-4 section-divider text-white" [style.font-size.px]="currentCV()?.layout?.fontSize?.heading">LANGUES</h3>
                  <div class="space-y-3">
                    <div *ngFor="let language of getVisibleLanguages()" class="language-item group">
                      <div class="flex items-center justify-between mb-1">
                        <p class="font-medium text-white">{{ language.name }}</p>
                        <button *ngIf="hoveredSection === section.id" 
                                (click)="removeLanguage(language.id)"
                                class="text-red-300 hover:text-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
                          <i class="fas fa-times text-xs"></i>
                        </button>
                      </div>
                      <div class="skill-bar bg-white bg-opacity-30 rounded-full h-2">
                        <div class="skill-progress bg-white rounded-full h-full transition-all duration-300"
                             [style.width.%]="language.level"></div>
                      </div>
                      <p class="text-sm opacity-80 mt-1 text-white">{{ language.levelDescription }}</p>
                    </div>
                  </div>
                </div>

                <!-- Interests Section -->
                <div *ngSwitchCase="'interests'">
                  <h3 class="text-xl font-bold mb-4 section-divider text-white" [style.font-size.px]="currentCV()?.layout?.fontSize?.heading">LOISIRS</h3>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let interest of getVisibleInterests()" 
                          class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center text-white group">
                      <i [class]="interest.icon + ' mr-1 cursor-pointer hover:text-yellow-300'"
                         (click)="openIconPicker('interest', interest.id)"
                         title="Changer l'icône"></i>
                      {{ interest.name }}
                      <button *ngIf="hoveredSection === section.id" 
                              (click)="removeInterest(interest.id)"
                              class="ml-2 text-red-300 hover:text-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fas fa-times text-xs"></i>
                      </button>
                    </span>
                  </div>
                </div>

                <!-- Custom Section -->
                <div *ngSwitchCase="'custom'">
                  <h3 class="text-xl font-bold mb-4 section-divider text-white" [style.font-size.px]="currentCV()?.layout?.fontSize?.heading">{{ section.title || 'Section personnalisée' }}</h3>
                  <div class="bg-white bg-opacity-20 rounded p-4 text-white flex items-center justify-center min-h-[60px]">
                    <ng-container *ngIf="section.data?.content; else customPlaceholder">
                      <div [innerHTML]="section.data.content"></div>
                    </ng-container>
                    <ng-template #customPlaceholder>
                      <span class="italic opacity-70">Ajoutez du contenu personnalisé à cette section…</span>
                    </ng-template>
                  </div>
                </div>

              </ng-container>
              <div *ngIf="hoveredSection === section.id && !isPrinting"
                  class="resize-handle-height"
                  (mousedown)="startResizeSection($event, section.id, 'height')"></div>

              <!-- Poignée de redimensionnement (largeur) -->
              <div *ngIf="hoveredSection === section.id && !isPrinting"
                  class="resize-handle-width"
                  (mousedown)="startResizeSection($event, section.id, 'width')"></div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column flex-1 p-8 transition-all duration-300"
             [class.dragging]="isDragging">
          
          <div *ngFor="let section of getRightSections(); trackBy: trackBySection"
              class="section-container mb-8 relative group cursor-pointer hover:bg-gray-50 rounded-lg transition-all p-2 -m-2"
              [attr.data-section-id]="section.id"
              [class.ring-2]="cvService.selectedSection() === section.id"
              [class.ring-purple-500]="cvService.selectedSection() === section.id"
              [class.dragging]="isDragging && draggedSection?.id === section.id"
              [class.drag-over-valid]="dragOverIndex === getSectionIndex(section.id, 'right') && dragValid"
              [class.drag-over-invalid]="dragOverIndex === getSectionIndex(section.id, 'right') && !dragValid"
              (click)="selectSection(section.id)"
              (mouseenter)="hoveredSection = section.id"
              (mouseleave)="hoveredSection = null"
              draggable="true"
              (dragstart)="onDragStart($event, section, 'right')"
              (dragover)="onDragOver($event, section.id, 'right')"
              (drop)="onDrop($event, section.id, 'right')"
              (dragend)="onDragEnd()">
            
            <!-- Section controls -->
            <div *ngIf="hoveredSection === section.id && !isPrinting" 
                class="section-controls absolute -top-2 -right-2 z-10">
              <button (click)="editSection(section.id); $event.stopPropagation()" 
                      class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 mr-1"
                      title="Éditer la section">
                <i class="fas fa-edit"></i>
              </button>
              <button (click)="removeSection(section.id); $event.stopPropagation()" 
                      class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Supprimer la section">
                <i class="fas fa-trash"></i>
              </button>
            </div>

            <ng-container [ngSwitch]="section.type">
              
              <!-- Profile Section -->
              <div *ngSwitchCase="'profile'">
                <h2 class="text-3xl font-bold mb-4 section-divider" 
                    [style.color]="currentCV()?.theme?.primaryColor"
                    [style.font-family]="currentCV()?.theme?.fontFamily?.heading"
                    [style.font-size.px]="(currentCV()?.layout?.fontSize?.heading ?? 0) * 1.1">
                  PROFIL PROFESSIONNEL
                </h2>
                <p class="text-gray-700 leading-relaxed">
                  {{ currentCV()?.personalInfo?.summary }}
                </p>
              </div>

              <!-- Experience Section -->
              <div *ngSwitchCase="'experience'">
                <h3 class="text-2xl font-bold mb-6 section-divider" 
                    [style.color]="currentCV()?.theme?.primaryColor"
                    [style.font-family]="currentCV()?.theme?.fontFamily?.heading"
                    [style.font-size.px]="(currentCV()?.layout?.fontSize?.heading ?? 0) * 1.1">
                  EXPÉRIENCE PROFESSIONNELLE
                </h3>
                <div class="space-y-6">
                  <div *ngFor="let exp of getVisibleExperience()" class="timeline-item group">
                    <button *ngIf="hoveredSection === section.id" 
                            (click)="removeExperience(exp.id)"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <i class="fas fa-trash"></i>
                    </button>
                    <div class="p-4 rounded-lg" [style.background-color]="currentCV()?.theme?.backgroundColor">
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-lg" [style.color]="currentCV()?.theme?.primaryColor" [style.font-size.px]="(currentCV()?.layout?.fontSize?.heading ?? 0) * 0.9">
                          {{ exp.title }}
                        </h4>
                        <span class="px-3 py-1 rounded-full text-sm font-medium"
                              [style.background-color]="currentCV()?.theme?.accentColor + '40'"
                              [style.color]="currentCV()?.theme?.secondaryColor">
                          {{ formatDateRange(exp.startDate, exp.endDate, exp.current) }}
                        </span>
                      </div>
                      <p class="font-semibold text-gray-700 mb-2">{{ exp.company }} - {{ exp.location }}</p>
                      <ul class="pl-5 text-gray-700  space-y-1"
                          [class.list-disc]="exp.bulletStyle === 'disc'"
                          [class.list-circle]="exp.bulletStyle === 'circle'"
                          [class.list-square]="exp.bulletStyle === 'square'"
                          [class.list-none]="!exp.bulletStyle || exp.bulletStyle === 'none'">
                        <li *ngFor="let desc of exp.description" class="relative">
                          <!-- Affichage personnalisé pour les styles non-CSS (arrow, dash) -->
                          <span *ngIf="exp.bulletStyle === 'arrow'" class="absolute left-0 -ml-5">→</span>
                          <span *ngIf="exp.bulletStyle === 'dash'" class="absolute left-0 -ml-5">-</span>
                          <span *ngIf="exp.bulletStyle === 'square'" class="absolute left-0 -ml-5">■</span>
                          <span *ngIf="exp.bulletStyle === 'smallcircle'" class="absolute left-0 -ml-5">○</span>
                          <span *ngIf="exp.bulletStyle === 'circle'" class="absolute left-0 -ml-5">◯</span>
                          <span *ngIf="exp.bulletStyle === 'check'" class="absolute left-0 -ml-5">✔</span>
                          <span *ngIf="exp.bulletStyle === 'star'" class="absolute left-0 -ml-5">★</span>
                          <span *ngIf="exp.bulletStyle === 'dot'" class="absolute left-0 -ml-5">•</span>
                          
                          {{ desc }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Education Section -->
              <div *ngSwitchCase="'education'">
                <h3 class="text-2xl font-bold mb-6 section-divider" 
                    [style.color]="currentCV()?.theme?.primaryColor"
                    [style.font-family]="currentCV()?.theme?.fontFamily?.heading"
                    [style.font-size.px]="(currentCV()?.layout?.fontSize?.heading ?? 0) * 1.1">
                  FORMATION ACADÉMIQUE
                </h3>
                <div class="space-y-6">
                  <div *ngFor="let edu of getVisibleEducation()" class="timeline-item group">
                    <button *ngIf="hoveredSection === section.id" 
                            (click)="removeEducation(edu.id)"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <i class="fas fa-trash"></i>
                    </button>
                    <div class="p-4 rounded-lg" [style.background-color]="currentCV()?.theme?.backgroundColor">
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-lg" [style.color]="currentCV()?.theme?.primaryColor" [style.font-size.px]="(currentCV()?.layout?.fontSize?.heading ?? 0) * 0.9">
                          {{ edu.degree }}
                        </h4>
                        <span class="px-3 py-1 rounded-full text-sm font-medium"
                              [style.background-color]="currentCV()?.theme?.accentColor + '40'"
                              [style.color]="currentCV()?.theme?.secondaryColor">
                          {{ formatDateRange(edu.startDate, edu.endDate, edu.current) }}
                        </span>
                      </div>
                      <p class="font-semibold text-gray-700 mb-2">{{ edu.institution }} - {{ edu.location }}</p>
                      <p *ngIf="edu.description" class="text-gray-700">{{ edu.description }}</p>
                      <p *ngIf="edu.grade" class="text-gray-600 text-sm mt-1">{{ edu.grade }}</p>
                    </div>
                  </div>
                </div>
              </div>

            </ng-container>
            
            <!-- Poignée de redimensionnement (hauteur) -->
            <div *ngIf="hoveredSection === section.id && !isPrinting"
                class="resize-handle-height"
                (mousedown)="startResizeSection($event, section.id, 'height')"></div>

            <!-- Poignée de redimensionnement (largeur) -->
            <div *ngIf="hoveredSection === section.id && !isPrinting"
                class="resize-handle-width"
                (mousedown)="startResizeSection($event, section.id, 'width')"></div>
          </div>
        </div>
      </div>

      <!-- Drag overlay -->
      <div *ngIf="isDragging" class="drag-overlay absolute inset-0 bg-blue-500 bg-opacity-20 pointer-events-none">
        <div class="absolute inset-0 border-2 border-dashed border-blue-500"></div>
      </div>
    </div>

    <!-- Icon Picker Modal -->
    <app-icon-picker 
      [isVisible]="showIconPicker"
      (iconSelected)="onIconSelected($event)"
      (closed)="closeIconPicker()">
    </app-icon-picker>

    <!-- Help tooltips (legacy, hidden if using queue) -->
    <div *ngIf="showHelp() && !currentHelpTip" class="help-tooltips" style="display:none"></div>

    <!-- Guided Help Modal (one at a time) -->  
    <div *ngIf="currentHelpTip" class="help-tooltips">
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity animate-fade-in"></div>
      <div class="help-tooltip fade-in z-50"
           [style.top.px]="currentHelpTip.position.top"
           [style.left.px]="currentHelpTip.position.left">
        <div class="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs animate-fade-in relative">
          <button (click)="stopHelpTips()" title="Fermer l'aide" class="absolute top-2 right-2 text-gray-400 hover:text-white text-lg font-bold">×</button>
          <h4 class="font-bold mb-1">{{ currentHelpTip.title }}</h4>
          <p class="text-sm">{{ currentHelpTip.description }}</p>
          <button *ngIf="currentHelpTip.action"
                  (click)="onHelpTipAction()"
                  class="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
            {{ currentHelpTip.actionLabel }}
          </button>
          <button *ngIf="!currentHelpTip.action"
                  (click)="closeHelpTip()"
                  class="mt-2 ml-2 bg-gray-700 text-white px-2 py-1 rounded text-xs">
            OK
          </button>
          <button (click)="skipHelpTip()"
                  class="mt-2 ml-2 bg-gray-500 text-white px-2 py-1 rounded text-xs">
            Passer
          </button>
        </div>
      </div>
    </div>
    <!-- End Guided Help Modal -->
  `,
  styles: [`
    .cv-preview-container {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      position: relative;
    }

    @media print {
      .cv-preview-container {
        width: 100%;
        margin: 0;
        box-shadow: none;
      }
      .resize-handles, .section-controls, .help-tooltips {
        display: none !important;
      }
    }

    .section-divider {
      position: relative;
      padding-left: 1.5rem;
    }

    .section-divider::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 50%;
      width: 4px;
      background: currentColor;
      border-radius: 2px;
    }

    .timeline-item {
      position: relative;
      padding-left: 2rem;
      margin-bottom: 1.5rem;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: 0.5rem;
      top: 0.5rem;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: currentColor;
    }

    .timeline-item::after {
      content: '';
      position: absolute;
      left: 0.5rem;
      top: 1.2rem;
      bottom: -1.5rem;
      width: 2px;
      background: linear-gradient(to bottom, currentColor, transparent);
    }

    .timeline-item:last-child::after {
      display: none;
    }

    .resize-handles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 10;
    }

    .column-resize-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 4px;
      cursor: col-resize;
      pointer-events: all;
      z-index: 20;
    }

    .column-resize-handle:hover .resize-line {
      background-color: #3b82f6;
    }

    .resize-line {
      width: 100%;
      height: 100%;
      background-color: transparent;
      transition: background-color 0.2s;
    }

    .font-size-controls {
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border-radius: 6px;
      padding: 4px 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: all;
    }

    .font-size-controls button {
      background: #f3f4f6;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .font-size-controls button:hover {
      background: #e5e7eb;
    }

    .font-size-controls span {
      font-size: 12px;
      font-weight: 500;
      color: #374151;
      min-width: 30px;
      text-align: center;
    }

    .section-controls {
      opacity: 0;
      transition: opacity 0.2s;
    }

    .group:hover .section-controls {
      opacity: 1;
    }

    .dragging {
      transition: none !important;
    }

    .drag-overlay {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.4; }
    }

    .help-tooltips {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 1000;
    }

    .help-tooltip {
      position: absolute;
      pointer-events: all;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .profile-picture-container {
      transition: transform 0.2s;
    }

    .profile-picture-container:hover {
      transform: scale(1.05);
    }

    .help-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .help-modal-content {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .help-modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      color: #666;
    }

    .help-modal-title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .help-modal-description {
      font-size: 1rem;
      margin-bottom: 1.5rem;
      color: #555;
    }

    .help-modal-action {
      background: #007bff;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .help-modal-action:hover {
      background: #0056b3;
    }

    .profile-dropzone-center-top,
    .profile-dropzone-left,
    .column-dropzone {
      position: absolute;
      width: calc(100% - 2rem);
      max-width: 400px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0.5rem;
      border-radius: 0.375rem;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border: 2px dashed transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s, border-color 0.3s;
    }

    .profile-dropzone-center-top {
      top: -2.5rem;
    }

    .profile-dropzone-left {
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .column-dropzone {
      height: 100%;
      top: 0;
    }

    .drag-over-valid {
      border-color: #3b82f6;
      opacity: 1;
    }

    .drag-over-invalid {
      border-color: #ef4444;
      opacity: 1;
    }

    .swap-columns-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #3b82f6;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
      z-index: 20;
    }

    .swap-columns-btn:hover {
      background: #2563eb;
    }

    .section-container {
      position: relative;
      transition: all 0.2s ease;
    }

    .section-container:hover {
      transform: translateX(2px);
    }

    .section-container.cursor-pointer:active {
      transform: scale(0.98);
    }

    .section-controls {
      display: flex;
      gap: 0.25rem;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .group:hover .section-controls {
      opacity: 1;
    }

    .section-controls button {
      transition: all 0.2s;
    }

    .section-controls button:hover {
      transform: scale(1.1);
    }
    
    .section-container.dragging {
      opacity: 0.7;
      border: 2px dashed #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
    }

    .drag-over-valid {
      border: 2px dashed #10b981 !important;
      background-color: rgba(16, 185, 129, 0.1) !important;
    }

    .drag-over-invalid {
      border: 2px dashed #ef4444 !important;
      background-color: rgba(239, 68, 68, 0.1) !important;
    }

    .drag-invalid-overlay {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.1; }
      50% { opacity: 0.3; }
    }

    .drag-ghost {
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transform: rotate(-5deg);
      pointer-events: none;
    }

    .resize-handle-height {
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 12px;
      cursor: row-resize;
      background: #3b82f6;
      opacity: 0.7;
      border-radius: 0 0 4px 4px;
    }

    .resize-handle-width {
      position: absolute;
      top: 0;
      right: -8px;
      bottom: 0;
      width: 12px;
      cursor: col-resize;
      background: #3b82f6;
      opacity: 0.7;
      border-radius: 0 4px 4px 0;
    }
    
    @media (max-width: 768px) {
      .resize-handle-width {
        display: none;
      }
    }
    
    /* Dans la section @media (max-width: 768px) */
    @media (max-width: 768px) {
      .cv-preview-container {
        width: 100%;
        min-height: auto;
        margin: 0;
      }

      /* Affichage en colonnes côte à côte */
      .flex {
        display: flex;
        flex-direction: row;
      }

      /* Largeur des colonnes */
      .left-column {
        width: 40% !important;
        padding-right: 1rem;
      }

      .right-column {
        width: 60% !important;
        padding-left: 1rem;
      }

      /* Ajustement des marges et tailles */
      .profile-section {
        padding: 1rem !important;
      }

      .section-container {
        margin-bottom: 1rem !important;
      }
    }
  `]
})
export class CVPreviewComponent implements AfterViewInit {
  @ViewChild('cvContainer') cvContainer!: ElementRef;

  public readonly cvService = inject(CVStateService);
  
  currentCV = this.cvService.currentCV;
  showHelp = this.cvService.showHelp;

  showResizeHandles = false;
  showProfileOptions = false;
  hoveredSection: string | null = null;
  isPrinting = false;
  showIconPicker = false;
  currentIconContext: { type: string; id: string } | null = null;
  
  private isResizing = false;
  private startX = 0;
  private startWidth = 0;

  // --- Guided Help Modals ---
  helpTips: any[] = [];
  helpTipQueue: any[] = [];
  currentHelpTip: any = null;
  helpTipTimeout: any = null;

  // --- Drag & Drop State ---
  dragType: 'section' | 'profile-picture' | 'column' | null = null;
  dragSectionId: string | null = null;
  dragOverSectionId: string | null = null;
  dragOverColumn: 'left' | 'right' | null = null;
  dragProfilePosition: 'center-top' | 'left' | null = null;
  dragStartPos: { x: number; y: number } | null = null;
  isMobileDragging: boolean = false;
  mobileDragTimeout: any = null;
  showAddSectionMenu = false;

  // États pour le drag & drop
  isDragging = false;
  draggedSection: CVSection | null = null;
  dragStartIndex: number | null = null;
  dragOverIndex: number | null = null;
  dragColumn: 'left' | 'right' | null = null;
  dragValid: boolean = true;

  // États pour le redimensionnement
  isResizingSection = false;
  resizedSectionId: string | null = null;
  resizeStartY = 0;
  resizeStartHeight = 0;
  resizeStartX = 0;
  resizeStartWidth = 0;
  resizeDirection: 'height' | 'width' | null = null;

  // Variables pour gérer le redimensionnement tactile
  private isResizingTouch = false;
  private startXTouch = 0;
  private startWidthTouch = 0;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.setupPrintListener();
    this.generateHelpTips();
    this.cdr.detectChanges();
    // Mobile drag support
    this.setupTouchEvents();
    this.setupMobileDrag();
  }

  @HostListener('window:beforeprint')
  onBeforePrint(): void {
    this.isPrinting = true;
  }

  @HostListener('window:afterprint')
  onAfterPrint(): void {
    this.isPrinting = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isResizing) {
      const deltaX = event.clientX - this.startX;
      const containerWidth = this.cvContainer.nativeElement.offsetWidth;
      const newLeftWidth = Math.max(20, Math.min(80, this.startWidth + (deltaX / containerWidth) * 100));
      
      this.cvService.resizeElement({
        elementId: 'layout',
        width: newLeftWidth,
        height: 0
      });
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isResizing = false;
    this.isDragging = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (this.isResizingSection) {
      this.onResizeSection(event);
    }
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    if (this.isResizingSection) {
      this.endResizeSection();
    }
  }

  private setupTouchEvents(): void {
    const resizeHandle = document.querySelector('.column-resize-handle') as HTMLElement;
    if (resizeHandle) {
      resizeHandle.addEventListener('touchstart', (event) => this.startColumnResizeTouch(event));
    }
  }

  // Méthode pour démarrer le redimensionnement avec un événement tactile
  startColumnResizeTouch(event: TouchEvent): void {
    event.preventDefault();
    this.isResizingTouch = true;
    this.startXTouch = event.touches[0].clientX;
    this.startWidthTouch = this.currentCV()?.layout.leftColumnWidth ?? 33;

    // Ajoutez des écouteurs pour les événements tactiles
    document.addEventListener('touchmove', this.onTouchMove.bind(this));
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  // Méthode pour gérer le mouvement tactile
  onTouchMove(event: TouchEvent): void {
    if (!this.isResizingTouch) return;

    const deltaX = event.touches[0].clientX - this.startXTouch;
    const containerWidth = this.cvContainer.nativeElement.offsetWidth;
    const newLeftWidth = Math.max(20, Math.min(80, this.startWidthTouch + (deltaX / containerWidth) * 100));

    this.cvService.resizeElement({
      elementId: 'layout',
      width: newLeftWidth,
      height: 0
    });
  }

  // Méthode pour terminer le redimensionnement tactile
  onTouchEnd(): void {
    this.isResizingTouch = false;
    document.removeEventListener('touchmove', this.onTouchMove.bind(this));
    document.removeEventListener('touchend', this.onTouchEnd.bind(this));
  }

  startColumnResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.currentCV()?.layout.leftColumnWidth ?? 33;
  }

  adjustFontSize(delta: number): void {
    const currentCV = this.currentCV();
    if (!currentCV) return;

    const currentBodySize = currentCV.layout.fontSize.body;
    const currentHeadingSize = currentCV.layout.fontSize.heading;

    // Ajustez les tailles avec des limites raisonnables
    const newBodySize = Math.max(10, Math.min(20, currentBodySize + delta));
    const newHeadingSize = Math.max(14, Math.min(28, currentHeadingSize + delta));

    // Mettez à jour le state
    this.cvService.resizeElement({
      elementId: 'fontSize',
      width: 0,
      height: 0,
      fontSize: {
        body: newBodySize,
        heading: newHeadingSize,
        small: Math.max(8, Math.min(16, currentCV.layout.fontSize.small + delta)),
      },
    });
  }

  toggleProfilePictureType(): void {
    const currentType = this.currentCV()?.personalInfo.profileType;
    const newType = currentType === 'image' ? 'initials' : 'image';
    
    this.cvService.updatePersonalInfo({
      profileType: newType
    });
  }

  changeProfilePicture(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.cvService.updatePersonalInfo({
            profilePicture: e.target.result,
            profileType: 'image'
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  openIconPicker(type: string, id: string): void {
    this.currentIconContext = { type, id };
    this.showIconPicker = true;
  }

  onIconSelected(iconClass: string): void {
    if (!this.currentIconContext) return;

    const { type, id } = this.currentIconContext;
    const cv = this.currentCV();
    if (!cv) return;

    let contact;
    let interest;
    switch (type) {
      case 'contact':
        contact = cv.contactInfo.find(c => c.id === id);
        if (contact) {
          contact.icon = iconClass;
          this.cvService.updateContactInfo(cv.contactInfo);
        }
        break;
      case 'interest':
        interest = cv.interests.find(i => i.id === id);
        if (interest) {
          interest.icon = iconClass;
          this.cvService.updateInterest(id, { icon: iconClass });
        }
        break;
    }
  }

  closeIconPicker(): void {
    this.showIconPicker = false;
    this.currentIconContext = null;
  }

  removeSection(sectionId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
      this.cvService.removeSection(sectionId);
    }
  }

  removeContactInfo(contactId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette information de contact ?')) {
      this.cvService.removeContactInfo(contactId);
    }
  }

  removeSkill(skillId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
      this.cvService.removeSkill(skillId);
    }
  }

  removeLanguage(languageId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette langue ?')) {
      this.cvService.removeLanguage(languageId);
    }
  }

  removeInterest(interestId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce loisir ?')) {
      this.cvService.removeInterest(interestId);
    }
  }

  removeExperience(experienceId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) {
      this.cvService.removeExperience(experienceId);
    }
  }

  removeEducation(educationId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      this.cvService.removeEducation(educationId);
    }
  }

  getInitials(): string {
    const cv = this.currentCV();
    if (!cv) return 'CV';
    
    const first = cv.personalInfo.firstName?.charAt(0) || '';
    const last = cv.personalInfo.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'CV';
  }

  getGradientBackground(): string {
    const cv = this.currentCV();
    if (!cv) return 'linear-gradient(135deg, #ec4899, #db2777)';
    
    return `linear-gradient(135deg, ${cv.theme.primaryColor}, ${cv.theme.secondaryColor})`;
  }

  getLeftSections(): CVSection[] {
    return this.currentCV()?.sections.filter(s => s.position === 'left' && s.visible).sort((a, b) => a.order - b.order) || [];
  }

  getRightSections(): CVSection[] {
    return this.currentCV()?.sections.filter(s => s.position === 'right' && s.visible).sort((a, b) => a.order - b.order) || [];
  }

  getVisibleContactInfo() {
    return this.currentCV()?.contactInfo.filter(c => c.visible) || [];
  }

  getVisibleSkills() {
    return this.currentCV()?.skills.filter(s => s.visible) || [];
  }

  getVisibleLanguages() {
    return this.currentCV()?.languages.filter(l => l.visible) || [];
  }

  getVisibleInterests() {
    return this.currentCV()?.interests.filter(i => i.visible) || [];
  }

  getVisibleExperience() {
    return this.currentCV()?.experience.filter(e => e.visible) || [];
  }

  getVisibleEducation() {
    return this.currentCV()?.education.filter(e => e.visible) || [];
  }

  formatDateRange(startDate: string, endDate: string, current: boolean): string {
    if (current) {
      return `${startDate} - Présent`;
    }
    return `${startDate} - ${endDate}`;
  }

  trackBySection(index: number, section: CVSection): string {
    return section.id;
  }

  private setupPrintListener(): void {
    window.addEventListener('beforeprint', () => {
      this.isPrinting = true;
    });
    
    window.addEventListener('afterprint', () => {
      this.isPrinting = false;
    });
  }

  private generateHelpTips(): void {
    this.helpTips = [
      {
        title: 'Photo de profil',
        description: 'Cliquez ou déplacez la photo pour la placer en haut ou à gauche. Survolez pour voir les options.',
        position: { top: 100, left: 150 },
        action: 'profile-picture',
        actionLabel: 'Modifier'
      },
      {
        title: 'Déplacer une section',
        description: 'Faites glisser une section pour la réorganiser ou la déplacer entre les colonnes. Les zones interdites sont signalées.',
        position: { top: 220, left: 200 },
        action: 'section-drag',
        actionLabel: 'Essayer'
      },
      {
        title: 'Redimensionner les colonnes',
        description: 'Faites glisser la ligne de séparation pour ajuster la largeur des colonnes (20% à 80%).',
        position: { top: 200, left: 300 },
        action: 'column-resize',
        actionLabel: 'Essayer'
      },
      {
        title: 'Inverser les colonnes',
        description: 'Cliquez sur le bouton d’inversion pour échanger la colonne de gauche et de droite.',
        position: { top: 60, left: 600 },
        action: 'swap-columns',
        actionLabel: 'Inverser'
      },
      {
        title: 'Taille de police',
        description: 'Utilisez les boutons + et - pour ajuster la taille du texte.',
        position: { top: 50, left: 500 },
        action: 'font-size',
        actionLabel: 'Ajuster'
      },
      {
        title: 'Changer les icônes',
        description: 'Cliquez sur une icône pour la changer. Plus de 200 icônes disponibles !',
        position: { top: 250, left: 100 },
        action: 'icon-change',
        actionLabel: 'Essayer'
      },
      {
        title: 'Supprimer une section',
        description: 'Survolez une section et cliquez sur l’icône de suppression.',
        position: { top: 300, left: 200 },
        action: 'section-delete',
        actionLabel: 'Comprendre'
      },
      {
        title: 'Astuce mobile',
        description: 'Sur mobile, faites un appui long pour déplacer une section ou la photo.',
        position: { top: 400, left: 100 },
        action: null,
        actionLabel: null
      }
    ];
  }

  /**
   * Lance la file d'attente des aides guidées (helpTips)
   */
  startHelpTips(): void {
    this.helpTipQueue = [...this.helpTips];
    this.showNextHelpTip();
  }

  selectSection(sectionId: string): void {
    console.log('[CVPreview] Section clicked:', sectionId);
    this.cvService.setSelectedSection(sectionId);
  }

  editSection(sectionId: string): void {
    this.selectSection(sectionId);
    // Optionnel : scroll vers l'éditeur si nécessaire
    // ou émettre un événement pour que le parent ouvre l'éditeur
  }

  // --- Drag & Drop Handlers ---
  onSectionDragStart(event: DragEvent | MouseEvent, sectionId: string) {
    this.dragType = 'section';
    this.dragSectionId = sectionId;
    this.isDragging = true;
    this.dragValid = true;
    if (event instanceof DragEvent) {
      event.dataTransfer!.effectAllowed = 'move';
    }
  }

  onSectionDragOver(event: DragEvent, sectionId: string, column: 'left' | 'right') {
    event.preventDefault();
    if (this.dragType === 'section' && this.dragSectionId !== sectionId) {
      this.dragOverSectionId = sectionId;
      this.dragOverColumn = column;
      this.dragValid = true;
    } else {
      this.dragValid = false;
    }
  }

  // Correction: utiliser moveSectionAdvanced au lieu de moveSection
  onSectionDrop(event: DragEvent, sectionId: string, column: 'left' | 'right') {
    event.preventDefault();
    if (this.dragType === 'section' && this.dragSectionId && this.dragValid) {
      this.cvService.moveSectionAdvanced(this.dragSectionId, sectionId, column);
    }
    this.resetDragState();
  }

  onSectionDragEnd() {
    this.resetDragState();
  }

  onColumnDragOver(event: DragEvent, column: 'left' | 'right') {
    event.preventDefault();
    if (this.dragType === 'section') {
      this.dragOverSectionId = null;
      this.dragOverColumn = column;
      this.dragValid = true;
    } else {
      this.dragValid = false;
    }
  }

  onColumnDrop(event: DragEvent, column: 'left' | 'right') {
    event.preventDefault();
    if (this.dragType === 'section' && this.dragSectionId && this.dragValid) {
      this.cvService.moveSectionToColumn(this.dragSectionId, column);
    }
    this.resetDragState();
  }

  onDragStart(event: DragEvent, section: CVSection, column: 'left' | 'right'): void {
    event.dataTransfer?.setData('text/plain', section.id); // Pour Firefox
    this.draggedSection = section;
    this.dragStartIndex = this.getSectionIndex(section.id, column);
    this.dragColumn = column;
    this.isDragging = true;
    this.dragValid = true;
    this.createDragGhost(event, section.title || 'Section');
    event.stopPropagation();
  }


  onDragOver(event: DragEvent, sectionId: string, column: 'left' | 'right'): void {
    event.preventDefault();
    // Interdit le déplacement entre colonnes
    if (this.dragColumn !== column) {
      this.dragValid = false;
      return;
    }
    this.dragValid = true;
    this.dragOverIndex = this.getSectionIndex(sectionId, column);
  }

  onDrop(event: DragEvent, sectionId: string, column: 'left' | 'right'): void {
    event.preventDefault();
    if (!this.draggedSection || this.dragStartIndex === null || this.dragOverIndex === null || !this.dragColumn || !this.dragValid) {
      this.resetDragState();
      return;
    }
    // Déplace la section dans la même colonne
    this.cvService.moveSectionWithinColumn(this.draggedSection.id, this.dragOverIndex, this.dragColumn);
    this.resetDragState();
  }

  onDragEnd(): void {
    this.resetDragState();
  }

  private resetDragState(): void {
    this.draggedSection = null;
    this.dragStartIndex = null;
    this.dragOverIndex = null;
    this.dragColumn = null;
    this.isDragging = false;
    this.dragValid = true;
    this.cdr.detectChanges();
  }

  public getSectionIndex(sectionId: string, column: 'left' | 'right'): number {
    const sections = column === 'left' ? this.getLeftSections() : this.getRightSections();
    return sections.findIndex(section => section.id === sectionId);
  }

  private createDragGhost(event: DragEvent, title: string): void {
    const ghostElement = document.createElement('div');
    ghostElement.className = 'drag-ghost';
    ghostElement.textContent = title;
    ghostElement.style.position = 'absolute';
    ghostElement.style.backgroundColor = '#3b82f6';
    ghostElement.style.color = 'white';
    ghostElement.style.padding = '8px 12px';
    ghostElement.style.borderRadius = '4px';
    ghostElement.style.zIndex = '1000';
    ghostElement.style.pointerEvents = 'none';
    ghostElement.style.opacity = '0.8';
    ghostElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    ghostElement.style.transform = 'rotate(-5deg)';
    document.body.appendChild(ghostElement);
    event.dataTransfer?.setDragImage(ghostElement, 0, 0);
    setTimeout(() => document.body.removeChild(ghostElement), 0);
  }

  startResizeSection(event: MouseEvent, sectionId: string, direction: 'height' | 'width'): void {
    event.stopPropagation();
    this.isResizingSection = true;
    this.resizedSectionId = sectionId;
    this.resizeDirection = direction;
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement;
    if (direction === 'height') {
      this.resizeStartY = event.clientY;
      this.resizeStartHeight = sectionElement.offsetHeight;
    } else {
      this.resizeStartX = event.clientX;
      this.resizeStartWidth = sectionElement.offsetWidth;
    }
  }

  onResizeSection(event: MouseEvent): void {
    if (!this.isResizingSection || !this.resizedSectionId || !this.resizeDirection) return;
    const sectionElement = document.querySelector(`[data-section-id="${this.resizedSectionId}"]`) as HTMLElement;
    if (this.resizeDirection === 'height') {
      const newHeight = Math.max(100, Math.min(800, this.resizeStartHeight + (event.clientY - this.resizeStartY)));
      sectionElement.style.height = `${newHeight}px`;
      this.cvService.updateSectionSize(this.resizedSectionId, sectionElement.offsetWidth, newHeight);
    } else {
      const newWidth = Math.max(200, Math.min(1000, this.resizeStartWidth + (event.clientX - this.resizeStartX)));
      sectionElement.style.width = `${newWidth}px`;
      this.cvService.updateSectionSize(this.resizedSectionId, newWidth, sectionElement.offsetHeight);
    }
  }

  endResizeSection(): void {
    this.isResizingSection = false;
    this.resizedSectionId = null;
    this.resizeDirection = null;
  }

  // --- Profile Picture Drag ---
  onProfileDragStart(event: DragEvent | MouseEvent) {
    this.dragType = 'profile-picture';
    this.isDragging = true;
    this.dragStartPos = { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
    if (event instanceof DragEvent) {
      event.dataTransfer!.effectAllowed = 'move';
    }
  }

  onProfileDragOver(event: DragEvent, position: 'center-top' | 'left') {
    event.preventDefault();
    if (this.dragType === 'profile-picture') {
      this.dragProfilePosition = position;
      this.dragValid = true;
    } else {
      this.dragValid = false;
    }
  }

  onProfileDrop(event: DragEvent, position: 'center-top' | 'left') {
    event.preventDefault();
    if (this.dragType === 'profile-picture' && this.dragValid) {
      this.cvService.setProfilePicturePosition(position);
    }
    this.resetDragState();
  }

  onProfileDragEnd() {
    this.resetDragState();
  }

  // --- Column Swap ---
  swapColumns() {
    this.cvService.swapColumns();
  }

  addNewSection(type: string, position: 'left' | 'right' = 'right'): void {
    // Vérifie si une section du même type existe déjà
    if (!this.canAddSection(type)) {
      alert(`Une section de type "${type}" existe déjà.`);
      return;
    }

    // Gestion des sections personnalisées
    if (type === 'custom') {
      const customTitle = prompt('Titre de la section personnalisée :', 'Section personnalisée') ?? 'Section personnalisée';
      const customContent = prompt('Contenu initial (optionnel) :', '') ?? '';
      this.cvService.addSection(type, position, {
        title: customTitle,
        data: { content: customContent }
      });
    } else {
      // Ajout d'une section standard
      this.cvService.addSection(type, position);
    }

    // Sélectionne la nouvelle section ajoutée
    const cv = this.currentCV();
    if (cv && cv.sections.length > 0) {
      const newSection = cv.sections[cv.sections.length - 1];
      this.selectSection(newSection.id);
    }

    // Ferme le menu après l'ajout
    this.showAddSectionMenu = false;
  }

  canAddSection(type: string): boolean {
    const cv = this.currentCV();
    if (!cv) return false;
    // Vérifie si une section du même type existe déjà
    return !cv.sections.some(section => section.type === type);
  }

  // --- Drag Feedback ---
  getSectionDragClass(sectionId: string, column: 'left' | 'right') {
    if (this.isDragging && this.dragType === 'section') {
      if (this.dragOverSectionId === sectionId && this.dragOverColumn === column && this.dragValid) {
        return 'drag-over-valid';
      } else if (!this.dragValid) {
        return 'drag-over-invalid';
      }
    }
    return '';
  }

  getColumnDragClass(column: 'left' | 'right') {
    if (this.isDragging && this.dragType === 'section') {
      if (this.dragOverColumn === column && this.dragValid) {
        return 'drag-over-valid';
      } else if (!this.dragValid) {
        return 'drag-over-invalid';
      }
    }
    return '';
  }

  getProfileDragClass(position: 'center-top' | 'left') {
    if (this.isDragging && this.dragType === 'profile-picture') {
      if (this.dragProfilePosition === position && this.dragValid) {
        return 'drag-over-valid';
      } else if (!this.dragValid) {
        return 'drag-over-invalid';
      }
    }
    return '';
  }

  // resetDragState() {
  //   this.dragType = null;
  //   this.dragSectionId = null;
  //   this.dragOverSectionId = null;
  //   this.dragOverColumn = null;
  //   this.dragProfilePosition = null;
  //   this.isDragging = false;
  //   this.dragValid = true;
  //   this.isMobileDragging = false;
  //   if (this.mobileDragTimeout) clearTimeout(this.mobileDragTimeout);
  // }

  // --- Mobile Drag Support ---
  setupMobileDrag() {
    // Could add listeners for long press, etc.
  }

  // --- Guided Help Tips ---
  executeHelpAction(action: string): void {
    let firstContact;
    switch (action) {
      case 'profile-picture':
        this.toggleProfilePictureType();
        break;
      case 'section-drag':
        // Simuler un drag visuel ou highlight
        break;
      case 'column-resize':
        // Animate column resize demonstration
        break;
      case 'swap-columns':
        this.swapColumns();
        break;
      case 'font-size':
        this.adjustFontSize(1);
        setTimeout(() => this.adjustFontSize(-1), 1000);
        break;
      case 'icon-change':
        firstContact = this.getVisibleContactInfo()[0];
        if (firstContact) {
          this.openIconPicker('contact', firstContact.id);
        }
        break;
      case 'section-delete':
        // Highlight section controls
        break;
    }
  }

  stopHelpTips() {
    this.helpTipQueue = [];
    this.currentHelpTip = null;
    if (this.helpTipTimeout) clearTimeout(this.helpTipTimeout);
  }

  skipHelpTip() {
    if (this.helpTipTimeout) clearTimeout(this.helpTipTimeout);
    this.showNextHelpTip();
  }

  onHelpTipAction(): void {
    if (this.currentHelpTip?.action) {
      this.executeHelpAction(this.currentHelpTip.action);
    }
    this.showNextHelpTip();
  }

  closeHelpTip(): void {
    if (this.helpTipTimeout) clearTimeout(this.helpTipTimeout);
    this.showNextHelpTip();
  }

  showNextHelpTip(): void {
    if (this.helpTipQueue && this.helpTipQueue.length > 0) {
      this.currentHelpTip = this.helpTipQueue.shift();
      if (!this.currentHelpTip.action) {
        this.helpTipTimeout = setTimeout(() => this.showNextHelpTip(), 3000);
      }
    } else {
      this.currentHelpTip = null;
    }
  }
}