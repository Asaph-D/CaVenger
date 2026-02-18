import { computed, Injectable, signal } from '@angular/core';
import { ContactInfo, CVData, CVSection, CVState, CVTemplate, CVTheme, DragDropData, EducationItem, ExperienceItem, Interest, Language, PersonalInfo, ResizeData, Skill } from '../models/cv.interface';

@Injectable({
  providedIn: 'root'
})
export class CVStateService {
  private readonly state = signal<CVState>({
    currentCV: null,
    savedCVs: [],
    availableThemes: this.getDefaultThemes(),
    availableTemplates: this.getDefaultTemplates(),
    isEditing: false,
    selectedSection: null,
    selectedElement: null,
    isDirty: false,
    dragMode: false,
    resizeMode: false,
    showHelp: false
  });

  // Computed signals for reactive state access
  currentCV = computed(() => this.state().currentCV);
  savedCVs = computed(() => this.state().savedCVs);
  availableThemes = computed(() => this.state().availableThemes);
  isEditing = computed(() => this.state().isEditing);
  selectedSection = computed(() => this.state().selectedSection);
  selectedElement = computed(() => this.state().selectedElement);
  isDirty = computed(() => this.state().isDirty);
  dragMode = computed(() => this.state().dragMode);
  resizeMode = computed(() => this.state().resizeMode);
  showHelp = computed(() => this.state().showHelp);

  constructor() {
    this.loadFromStorage();
  }

  // State management methods
  createNewCV(): void {
    const newCV: CVData = {
      id: this.generateId(),
      personalInfo: this.getDefaultPersonalInfo(),
      contactInfo: this.getDefaultContactInfo(),
      skills: this.getDefaultSkills(),
      languages: this.getDefaultLanguages(),
      interests: this.getDefaultInterests(),
      experience: this.getDefaultExperience(),
      education: this.getDefaultEducation(),
      sections: this.getDefaultSections(),
      theme: this.getDefaultThemes()[0],
      template: this.getDefaultTemplates()[0],
      layout: {
        leftColumnWidth: 33,
        rightColumnWidth: 67,
        pageHeight: 297,
        fontSize: {
          heading: 24,
          body: 14,
          small: 12
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.updateState({
      currentCV: newCV,
      isEditing: true,
      isDirty: false
    });
  }

  loadCV(cvId: string): void {
    const cv = this.state().savedCVs.find(cv => cv.id === cvId);
    if (cv) {
      this.updateState({
        currentCV: cv,
        isEditing: false,
        isDirty: false
      });
    }
  }

  saveCV(): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.updatedAt = new Date();
    const savedCVs = this.state().savedCVs;
    const existingIndex = savedCVs.findIndex(cv => cv.id === currentCV.id);

    if (existingIndex >= 0) {
      savedCVs[existingIndex] = { ...currentCV };
    } else {
      savedCVs.push({ ...currentCV });
    }

    this.updateState({
      savedCVs: [...savedCVs],
      isDirty: false
    });

    this.saveToStorage();
  }


  // Section management
  addSection(sectionType: string, position: 'left' | 'right' = 'right', options?: { title?: string; data?: any }): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const newSection: CVSection = {
      id: this.generateId(),
      type: sectionType as any,
      title: options?.title ?? this.getSectionTitle(sectionType),
      visible: true,
      order: currentCV.sections.length,
      position,
      resizable: true,
      draggable: true,
      ...(options?.data ? { data: options.data } : {})
    };

    currentCV.sections.push(newSection);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  removeSection(sectionId: string): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.sections = currentCV.sections.filter(s => s.id !== sectionId);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  moveSection(dragData: DragDropData): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const sections = [...currentCV.sections];
    const draggedSection = sections.find(s => s.id === dragData.elementId);
    if (!draggedSection) return;

    // Remove from current position
    const currentIndex = sections.findIndex(s => s.id === dragData.elementId);
    sections.splice(currentIndex, 1);

    // Insert at new position
    sections.splice(dragData.position, 0, draggedSection);

    // Update order
    sections.forEach((section, index) => {
      section.order = index;
    });

    currentCV.sections = sections;
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  /**
   * Déplace une section dans une colonne ou à une position donnée.
   * @param dragSectionId L'ID de la section à déplacer
   * @param targetSectionId L'ID de la section cible (ou null pour déplacer en fin de colonne)
   * @param column La colonne cible ('left' ou 'right')
   */
  moveSectionAdvanced(dragSectionId: string, targetSectionId: string | null, column: 'left' | 'right') {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;
    const sections = [...currentCV.sections];
    const draggedSection = sections.find(s => s.id === dragSectionId);
    if (!draggedSection) return;
    // Retirer la section de sa position actuelle
    const currentIndex = sections.findIndex(s => s.id === dragSectionId);
    sections.splice(currentIndex, 1);
    // Déterminer la nouvelle position
    let insertIndex = sections.length;
    if (targetSectionId) {
      insertIndex = sections.findIndex(s => s.id === targetSectionId);
      if (insertIndex === -1) insertIndex = sections.length;
    }
    // Mettre à jour la colonne
    draggedSection.position = column;
    // Insérer à la nouvelle position
    sections.splice(insertIndex, 0, draggedSection);
    // Réordonner
    sections.forEach((section, idx) => section.order = idx);
    currentCV.sections = sections;
    this.updateState({ currentCV: { ...currentCV }, isDirty: true });
  }

  /**
   * Déplace une section dans une colonne (en fin de colonne)
   */
  moveSectionToColumn(sectionId: string, column: 'left' | 'right') {
    this.moveSectionAdvanced(sectionId, null, column);
  }

  moveSectionWithinColumn(sectionId: string, newIndex: number, column: 'left' | 'right'): void {
    const cv = this.currentCV();
    if (!cv) return;
    const sections = cv.sections.filter(s => s.position === column && s.visible);
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;
    const [section] = sections.splice(sectionIndex, 1);
    sections.splice(newIndex, 0, section);
    sections.forEach((s, index) => { s.order = index; });
    this.updateState({ currentCV: { ...cv }, isDirty: true });
  }

  updateSectionSize(sectionId: string, width: number, height: number): void {
    const cv = this.currentCV();
    if (!cv) return;
    const section = cv.sections.find(s => s.id === sectionId);
    if (section) {
      section.width = width;
      section.height = height;
      this.updateState({ currentCV: { ...cv }, isDirty: true });
    }
  }

  /**
   * Change la position de la photo de profil (haut ou gauche)
   */
  setProfilePicturePosition(position: 'center-top' | 'left') {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;
    currentCV.layout.profilePicturePosition = position;
    this.updateState({ currentCV: { ...currentCV }, isDirty: true });
  }

  /**
   * Inverse les colonnes gauche et droite
   */
  swapColumns() {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;
    const left = currentCV.layout.leftColumnWidth;
    const right = currentCV.layout.rightColumnWidth;
    currentCV.layout.leftColumnWidth = right;
    currentCV.layout.rightColumnWidth = left;
    // Inverser la position des sections
    currentCV.sections.forEach(section => {
      section.position = section.position === 'left' ? 'right' : 'left';
    });
    this.updateState({ currentCV: { ...currentCV }, isDirty: true });
  }

  resizeElement(resizeData: ResizeData): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    if (resizeData.elementId === 'layout') {
      currentCV.layout.leftColumnWidth = resizeData.width;
      currentCV.layout.rightColumnWidth = 100 - resizeData.width;
    }
    else if (resizeData.elementId === 'fontSize') {
      if (resizeData.fontSize) {
        // Mise à jour des tailles de police avec les valeurs fournies
        currentCV.layout.fontSize = {
          ...currentCV.layout.fontSize,
          ...resizeData.fontSize,
        };
      }
    }

    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  // Personal info management
  updatePersonalInfo(personalInfo: Partial<PersonalInfo>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.personalInfo = { ...currentCV.personalInfo, ...personalInfo };
    
    // Update contact info automatically
    this.updateContactInfoFromPersonal(currentCV.personalInfo);
    
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  private updateContactInfoFromPersonal(personalInfo: PersonalInfo): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    // Helper to update or add a contact info entry
    const updateOrAddContact = (
      type: string,
      value: string | undefined,
      icon: string,
      label: string
    ) => {
      if (!value) return;
      let contact = currentCV.contactInfo.find(c => c.type === type);
      if (!contact) {
        const newContact: ContactInfo = {
          id: this.generateId(),
          icon,
          label,
          value,
          type: type as ContactInfo['type'],
          visible: true
        };
        currentCV.contactInfo.push(newContact);
      } else {
        contact.value = value;
      }
    };

    // Update birthday, marital status, nationality (optional)
    updateOrAddContact('birthday', personalInfo.dateOfBirth, 'fas fa-birthday-cake', 'Date de naissance');
    updateOrAddContact('marital', personalInfo.maritalStatus, 'fas fa-heart', 'Situation matrimoniale');
    updateOrAddContact('nationality', personalInfo.nationality, 'fas fa-flag', 'Nationalité');
  }

  // Contact info management
  updateContactInfo(contactInfo: ContactInfo[]): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.contactInfo = contactInfo;
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  addContactInfo(contact: Omit<ContactInfo, 'id'>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const newContact: ContactInfo = { ...contact, id: this.generateId() };
    currentCV.contactInfo.push(newContact);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  removeContactInfo(contactId: string): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.contactInfo = currentCV.contactInfo.filter(c => c.id !== contactId);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  // Skills management
  addSkill(skill: Omit<Skill, 'id'>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const newSkill: Skill = { ...skill, id: this.generateId(), visible: true };
    currentCV.skills.push(newSkill);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  updateSkill(skillId: string, updates: Partial<Skill>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const skillIndex = currentCV.skills.findIndex(s => s.id === skillId);
    if (skillIndex >= 0) {
      currentCV.skills[skillIndex] = { ...currentCV.skills[skillIndex], ...updates };
      this.updateState({
        currentCV: { ...currentCV },
        isDirty: true
      });
    }
  }

  removeSkill(skillId: string): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.skills = currentCV.skills.filter(s => s.id !== skillId);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  // Languages management
  addLanguage(language: Omit<Language, 'id'>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const newLanguage: Language = { ...language, id: this.generateId(), visible: true };
    currentCV.languages.push(newLanguage);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  updateLanguage(languageId: string, updates: Partial<Language>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const languageIndex = currentCV.languages.findIndex(l => l.id === languageId);
    if (languageIndex >= 0) {
      currentCV.languages[languageIndex] = { ...currentCV.languages[languageIndex], ...updates };
      this.updateState({
        currentCV: { ...currentCV },
        isDirty: true
      });
    }
  }

  removeLanguage(languageId: string): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.languages = currentCV.languages.filter(l => l.id !== languageId);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  // Interests management
  addInterest(interest: Omit<Interest, 'id'>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const newInterest: Interest = { ...interest, id: this.generateId(), visible: true };
    currentCV.interests.push(newInterest);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  updateInterest(interestId: string, updates: Partial<Interest>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const interestIndex = currentCV.interests.findIndex(i => i.id === interestId);
    if (interestIndex >= 0) {
      currentCV.interests[interestIndex] = { ...currentCV.interests[interestIndex], ...updates };
      this.updateState({
        currentCV: { ...currentCV },
        isDirty: true
      });
    }
  }

  removeInterest(interestId: string): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.interests = currentCV.interests.filter(i => i.id !== interestId);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  // Experience management
  addExperience(experience: Omit<ExperienceItem, 'id'>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const newExperience: ExperienceItem = { ...experience, id: this.generateId(), visible: true };
    currentCV.experience.push(newExperience);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  updateExperience(experienceId: string, updates: Partial<ExperienceItem>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const expIndex = currentCV.experience.findIndex(e => e.id === experienceId);
    if (expIndex >= 0) {
      currentCV.experience[expIndex] = { ...currentCV.experience[expIndex], ...updates };
      this.updateState({
        currentCV: { ...currentCV },
        isDirty: true
      });
    }
  }

  removeExperience(experienceId: string): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.experience = currentCV.experience.filter(e => e.id !== experienceId);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  // Education management
  addEducation(education: Omit<EducationItem, 'id'>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const newEducation: EducationItem = { ...education, id: this.generateId(), visible: true };
    currentCV.education.push(newEducation);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  updateEducation(educationId: string, updates: Partial<EducationItem>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const eduIndex = currentCV.education.findIndex(e => e.id === educationId);
    if (eduIndex >= 0) {
      currentCV.education[eduIndex] = { ...currentCV.education[eduIndex], ...updates };
      this.updateState({
        currentCV: { ...currentCV },
        isDirty: true
      });
    }
  }

  removeEducation(educationId: string): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.education = currentCV.education.filter(e => e.id !== educationId);
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  // Theme and template management
  applyTheme(theme: CVTheme): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.theme = theme;
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  updateCVData(updates: Partial<CVData>): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    const updatedCV = { ...currentCV, ...updates };
    this.updateState({
      currentCV: updatedCV,
      isDirty: true
    });
  }

  applyTemplate(template: CVTemplate): void {
    const currentCV = this.state().currentCV;
    if (!currentCV) return;

    currentCV.template = template;
    currentCV.sections = template.sections;
    currentCV.theme = template.theme;
    this.updateState({
      currentCV: { ...currentCV },
      isDirty: true
    });
  }

  /**
   * Convertit un CVTemplateSelector en CVTemplate pour l'application
   */
  convertTemplateSelectorToCVTemplate(templateSelector: { id: string; name: string; description: string; layout: string }): CVTemplate {
    const defaultTemplates = this.getDefaultTemplates();
    const baseTemplate = defaultTemplates[0] || this.getDefaultCVTemplate();
    
    // Adapter le layout selon le template sélectionné
    let layout: 'two-column' | 'single-column' | 'modern' | 'classic' = 'two-column';
    if (templateSelector.layout === 'single-column') {
      layout = 'single-column';
    } else if (templateSelector.layout === 'timeline' || templateSelector.layout === 'sidebar') {
      layout = 'modern';
    }

    return {
      ...baseTemplate,
      id: templateSelector.id,
      name: templateSelector.name,
      description: templateSelector.description,
      layout: layout,
      thumbnail: ''
    };
  }

  private getDefaultCVTemplate(): CVTemplate {
    return {
      id: 'default',
      name: 'Default',
      description: 'Template par défaut',
      thumbnail: '',
      layout: 'two-column',
      sections: [],
      theme: {
        id: 'default',
        name: 'Default',
        primaryColor: '#3b82f6',
        secondaryColor: '#2563eb',
        accentColor: '#60a5fa',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: { heading: 'Arial', body: 'Arial' },
        layout: 'two-column'
      },
      preview: ''
    };
  }

  // UI state management
  setEditing(isEditing: boolean): void {
    this.updateState({ isEditing });
  }

  setHelp(state: boolean): void {
    this.updateState({ showHelp: state });
  }

  setSelectedSection(sectionId: string | null): void {
    this.updateState({ selectedSection: sectionId });
  }

  setSelectedElement(elementId: string | null): void {
    this.updateState({ selectedElement: elementId });
  }

  setDragMode(dragMode: boolean): void {
    this.updateState({ dragMode });
  }

  setResizeMode(resizeMode: boolean): void {
    this.updateState({ resizeMode });
  }

  toggleHelp(): boolean {
    this.state.update(s => ({ ...s, showHelp: !s.showHelp }));
    return this.state().showHelp;
  }

  // Private helper methods
  private updateState(updates: Partial<CVState>): void {
    this.state.update(current => ({ ...current, ...updates }));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private getSectionTitle(sectionType: string): string {
    const titles: Record<string, string> = {
      'profile': 'Profil Professionnel',
      'personal-info': 'Informations Personnelles',
      'experience': 'Expérience Professionnelle',
      'education': 'Formation Académique',
      'skills': 'Compétences',
      'languages': 'Langues',
      'interests': 'Loisirs',
      'contact': 'Contact',
      'custom': 'Section Personnalisée'
    };
    return titles[sectionType] || 'Nouvelle Section';
  }

  private getDefaultPersonalInfo(): PersonalInfo {
    return {
      firstName: 'Prénom',
      lastName: 'Nom',
      title: 'Titre Professionnel',
      dateOfBirth: '',
      placeOfBirth: '',
      maritalStatus: '',
      nationality: '',
      profileType: 'initials',
      initials: 'PN',
      summary: 'Résumé professionnel personnalisé décrivant vos compétences et expériences principales.'
    };
  }

  private getDefaultContactInfo(): ContactInfo[] {
    return [
      { id: '1', icon: 'fas fa-envelope', label: 'Email', value: 'email@domain.com', type: 'email', visible: true },
      { id: '2', icon: 'fas fa-phone', label: 'Téléphone', value: '+33 6 12 34 56 78', type: 'phone', visible: true },
      { id: '3', icon: 'fas fa-map-marker-alt', label: 'Adresse', value: 'Ville, Pays', type: 'address', visible: true }
    ];
  }

  private getDefaultSkills(): Skill[] {
    return [
      { id: '1', name: 'JavaScript', level: 85, category: 'Technique', visible: true },
      { id: '2', name: 'Angular', level: 90, category: 'Framework', visible: true },
      { id: '3', name: 'Communication', level: 95, category: 'Soft Skills', visible: true }
    ];
  }

  private getDefaultLanguages(): Language[] {
    return [
      { id: '1', name: 'Français', level: 100, levelDescription: 'Langue maternelle', visible: true },
      { id: '2', name: 'Anglais', level: 85, levelDescription: 'Avancé (C1)', visible: true }
    ];
  }

  private getDefaultInterests(): Interest[] {
    return [
      { id: '1', name: 'Lecture', icon: 'fas fa-book', visible: true },
      { id: '2', name: 'Voyage', icon: 'fas fa-plane', visible: true },
      { id: '3', name: 'Technologie', icon: 'fas fa-laptop', visible: true }
    ];
  }

  private getDefaultExperience(): ExperienceItem[] {
    return [
      {
        id: '1',
        title: 'Développeur Full Stack',
        company: 'Entreprise Tech',
        location: 'Paris, France',
        startDate: '2022-01',
        endDate: '',
        current: true,
        description: [
          'Développement d\'applications web avec Angular et Node.js',
          'Collaboration avec l\'équipe design pour l\'UX/UI',
          'Optimisation des performances et maintenance'
        ],
        visible: true,
        bulletStyle: 'dot'
      }
    ];
  }

  private getDefaultEducation(): EducationItem[] {
    return [
      {
        id: '1',
        degree: 'Master en Informatique',
        institution: 'Université de Technologie',
        location: 'Paris, France',
        startDate: '2020-09',
        endDate: '2022-06',
        current: false,
        description: 'Spécialisation en développement web et intelligence artificielle',
        grade: 'Mention Bien',
        visible: true
      }
    ];
  }

  private getDefaultSections(): CVSection[] {
    return [
      { id: '1', type: 'contact', title: 'Contact', visible: true, order: 1, position: 'left', resizable: true, draggable: true },
      { id: '2', type: 'skills', title: 'Compétences', visible: true, order: 2, position: 'left', resizable: true, draggable: true },
      { id: '3', type: 'languages', title: 'Langues', visible: true, order: 3, position: 'left', resizable: true, draggable: true },
      { id: '4', type: 'interests', title: 'Loisirs', visible: true, order: 4, position: 'left', resizable: true, draggable: true },
      { id: '5', type: 'profile', title: 'Profil Professionnel', visible: true, order: 1, position: 'right', resizable: true, draggable: true },
      { id: '6', type: 'experience', title: 'Expérience Professionnelle', visible: true, order: 2, position: 'right', resizable: true, draggable: true },
      { id: '7', type: 'education', title: 'Formation Académique', visible: true, order: 3, position: 'right', resizable: true, draggable: true }
    ];
  }  

  private getDefaultThemes(): CVTheme[] {
    return [
      {
        id: 'pink',
        name: 'Rose Élégant',
        primaryColor: '#ec4899',
        secondaryColor: '#db2777',
        accentColor: '#f472b6',
        backgroundColor: '#fdf2f8',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      },
      {
        id: 'blue',
        name: 'Bleu Professionnel',
        primaryColor: '#3b82f6',
        secondaryColor: '#1d4ed8',
        accentColor: '#60a5fa',
        backgroundColor: '#eff6ff',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      },
      {
        id: 'green',
        name: 'Vert Nature',
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        accentColor: '#34d399',
        backgroundColor: '#ecfdf5',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      },
      {
        id: 'gold',
        name: 'Doré Chaleureux',
        primaryColor: '#f59e0b',
        secondaryColor: '#b45309',
        accentColor: '#fbbf24',
        backgroundColor: '#fffbeb',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      },
      {
        id: 'purple',
        name: 'Violet Créatif',
        primaryColor: '#8b5cf6',
        secondaryColor: '#6d28d9',
        accentColor: '#a78bfa',
        backgroundColor: '#f5f3ff',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      },
      {
        id: 'teal',
        name: 'Turquoise Moderne',
        primaryColor: '#14b8a6',
        secondaryColor: '#0f766e',
        accentColor: '#5eead4',
        backgroundColor: '#f0fdfa',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      },
      {
        id: 'orange',
        name: 'Orange Dynamique',
        primaryColor: '#f97316',
        secondaryColor: '#ea580c',
        accentColor: '#fb923c',
        backgroundColor: '#fff7ed',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      },
      {
        id: 'indigo',
        name: 'Indigo Sophistiqué',
        primaryColor: '#6366f1',
        secondaryColor: '#4f46e5',
        accentColor: '#a5b4fc',
        backgroundColor: '#f8faff',
        textColor: '#374151',
        fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
        layout: 'two-column'
      }
    ];
  }

  private getDefaultTemplates(): CVTemplate[] {
    return [
      // Template 1: Moderne Rose (Two-column with photo)
      {
        id: 'modern-pink',
        name: 'Moderne Rose',
        description: 'Design moderne avec couleurs roses élégantes et photo de profil',
        thumbnail: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[0],
        preview: 'Template moderne avec disposition en deux colonnes et thème rose élégant'
      },
      
      // Template 2: Professionnel Bleu (Two-column clean)
      {
        id: 'professional-blue',
        name: 'Professionnel Bleu',
        description: 'Style professionnel avec thème bleu corporate',
        thumbnail: 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[1],
        preview: 'Template professionnel avec couleurs bleues et mise en page structurée'
      },

      // Template 3: Créatif Vert (Two-column with accent)
      {
        id: 'creative-green',
        name: 'Créatif Vert',
        description: 'Design créatif avec thème vert nature',
        thumbnail: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[2],
        preview: 'Template créatif avec couleurs vertes et style moderne'
      },

      // Template 4: Élégant Doré (Two-column luxury)
      {
        id: 'elegant-gold',
        name: 'Élégant Doré',
        description: 'Style élégant avec accents dorés',
        thumbnail: 'https://images.pexels.com/photos/590024/pexels-photo-590024.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[3],
        preview: 'Template élégant avec couleurs dorées et finitions premium'
      },

      // Template 5: Artistique Violet (Two-column creative)
      {
        id: 'artistic-purple',
        name: 'Artistique Violet',
        description: 'Design artistique avec thème violet créatif',
        thumbnail: 'https://images.pexels.com/photos/590026/pexels-photo-590026.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[4],
        preview: 'Template artistique avec couleurs violettes et style innovant'
      },

      // Template 6: Minimaliste Gris (Single-column)
      {
        id: 'minimalist-gray',
        name: 'Minimaliste Gris',
        description: 'Style minimaliste avec palette neutre',
        thumbnail: 'https://images.pexels.com/photos/590028/pexels-photo-590028.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'single-column',
        sections: this.getDefaultSections().map(s => ({ ...s, position: 'right' as const })),
        theme: {
          id: 'gray',
          name: 'Gris Minimaliste',
          primaryColor: '#6b7280',
          secondaryColor: '#4b5563',
          accentColor: '#9ca3af',
          backgroundColor: '#f9fafb',
          textColor: '#374151',
          fontFamily: { heading: 'Montserrat', body: 'Roboto' },
          layout: 'single-column'
        },
        preview: 'Template minimaliste avec une colonne et couleurs neutres'
      },

      // Template 7: Executive Noir (Two-column dark)
      {
        id: 'executive-black',
        name: 'Executive Noir',
        description: 'Style exécutif avec thème sombre et élégant',
        thumbnail: 'https://images.pexels.com/photos/590030/pexels-photo-590030.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: {
          id: 'black',
          name: 'Noir Executive',
          primaryColor: '#1f2937',
          secondaryColor: '#111827',
          accentColor: '#6b7280',
          backgroundColor: '#f9fafb',
          textColor: '#374151',
          fontFamily: { heading: 'Playfair Display', body: 'Roboto' },
          layout: 'two-column'
        },
        preview: 'Template exécutif avec couleurs sombres et style professionnel'
      },

      // Template 8: Moderne Turquoise (Two-column fresh)
      {
        id: 'modern-teal',
        name: 'Moderne Turquoise',
        description: 'Design moderne avec couleurs turquoise fraîches',
        thumbnail: 'https://images.pexels.com/photos/590032/pexels-photo-590032.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[5],
        preview: 'Template moderne avec couleurs turquoise et style frais'
      },

      // Template 9: Dynamique Orange (Two-column energetic)
      {
        id: 'dynamic-orange',
        name: 'Dynamique Orange',
        description: 'Style dynamique avec couleurs orange énergiques',
        thumbnail: 'https://images.pexels.com/photos/590034/pexels-photo-590034.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[6],
        preview: 'Template dynamique avec couleurs orange et style énergique'
      },

      // Template 10: Sophistiqué Indigo (Two-column elegant)
      {
        id: 'sophisticated-indigo',
        name: 'Sophistiqué Indigo',
        description: 'Design sophistiqué avec couleurs indigo élégantes',
        thumbnail: 'https://images.pexels.com/photos/590036/pexels-photo-590036.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: this.getDefaultSections(),
        theme: this.getDefaultThemes()[7],
        preview: 'Template sophistiqué avec couleurs indigo et style élégant'
      },

      // Template 11: Timeline Vertical (Modern timeline)
      {
        id: 'timeline-vertical',
        name: 'Timeline Vertical',
        description: 'CV avec timeline verticale pour l\'expérience',
        thumbnail: 'https://images.pexels.com/photos/590038/pexels-photo-590038.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'modern',
        sections: [
          { id: '1', type: 'profile', title: 'Profil', visible: true, order: 1, position: 'right', resizable: true, draggable: true },
          { id: '2', type: 'experience', title: 'Parcours', visible: true, order: 2, position: 'right', resizable: true, draggable: true },
          { id: '3', type: 'education', title: 'Formation', visible: true, order: 3, position: 'right', resizable: true, draggable: true },
          { id: '4', type: 'skills', title: 'Expertise', visible: true, order: 1, position: 'left', resizable: true, draggable: true },
          { id: '5', type: 'contact', title: 'Contact', visible: true, order: 2, position: 'left', resizable: true, draggable: true }
        ],
        theme: this.getDefaultThemes()[0],
        preview: 'Template avec timeline verticale et mise en page moderne'
      },

      // Template 12: Compact Moderne (Single-column compact)
      {
        id: 'compact-modern',
        name: 'Compact Moderne',
        description: 'Design compact et moderne pour CV d\'une page',
        thumbnail: 'https://images.pexels.com/photos/590040/pexels-photo-590040.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'single-column',
        sections: [
          { id: '1', type: 'profile', title: 'À Propos', visible: true, order: 1, position: 'right', resizable: true, draggable: true },
          { id: '2', type: 'skills', title: 'Compétences Clés', visible: true, order: 2, position: 'right', resizable: true, draggable: true },
          { id: '3', type: 'experience', title: 'Expérience', visible: true, order: 3, position: 'right', resizable: true, draggable: true },
          { id: '4', type: 'education', title: 'Formation', visible: true, order: 4, position: 'right', resizable: true, draggable: true },
          { id: '5', type: 'contact', title: 'Contact', visible: true, order: 5, position: 'right', resizable: true, draggable: true }
        ],
        theme: this.getDefaultThemes()[1],
        preview: 'Template compact pour CV d\'une page avec toutes les informations essentielles'
      },

      // Template 13: Créatif Asymétrique (Creative layout)
      {
        id: 'creative-asymmetric',
        name: 'Créatif Asymétrique',
        description: 'Layout créatif avec disposition asymétrique',
        thumbnail: 'https://images.pexels.com/photos/590042/pexels-photo-590042.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'modern',
        sections: this.getDefaultSections().map(s => ({ 
          ...s, 
          position: Math.random() > 0.6 ? 'left' : 'right' as const 
        })),
        theme: this.getDefaultThemes()[4],
        preview: 'Template créatif avec disposition asymétrique et style unique'
      },

      // Template 14: Portfolio Style (For creative professionals)
      {
        id: 'portfolio-style',
        name: 'Style Portfolio',
        description: 'CV style portfolio pour créatifs et designers',
        thumbnail: 'https://images.pexels.com/photos/590044/pexels-photo-590044.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'modern',
        sections: [
          { id: '1', type: 'profile', title: 'Vision Créative', visible: true, order: 1, position: 'right', resizable: true, draggable: true },
          { id: '2', type: 'skills', title: 'Expertise Technique', visible: true, order: 1, position: 'left', resizable: true, draggable: true },
          { id: '3', type: 'experience', title: 'Projets & Expérience', visible: true, order: 2, position: 'right', resizable: true, draggable: true },
          { id: '4', type: 'education', title: 'Formation Artistique', visible: true, order: 3, position: 'right', resizable: true, draggable: true },
          { id: '5', type: 'interests', title: 'Inspirations', visible: true, order: 2, position: 'left', resizable: true, draggable: true }
        ],
        theme: this.getDefaultThemes()[2],
        preview: 'Template style portfolio pour professionnels créatifs'
      },

      // Template 15: Tech Moderne (For tech professionals)
      {
        id: 'tech-modern',
        name: 'Tech Moderne',
        description: 'CV moderne pour professionnels de la tech',
        thumbnail: 'https://images.pexels.com/photos/590046/pexels-photo-590046.jpeg?auto=compress&cs=tinysrgb&w=300&h=400',
        layout: 'two-column',
        sections: [
          { id: '1', type: 'contact', title: 'Contact & Liens', visible: true, order: 1, position: 'left', resizable: true, draggable: true },
          { id: '2', type: 'skills', title: 'Stack Technique', visible: true, order: 2, position: 'left', resizable: true, draggable: true },
          { id: '3', type: 'languages', title: 'Langages', visible: true, order: 3, position: 'left', resizable: true, draggable: true },
          { id: '4', type: 'profile', title: 'Profil Développeur', visible: true, order: 1, position: 'right', resizable: true, draggable: true },
          { id: '5', type: 'experience', title: 'Expérience Tech', visible: true, order: 2, position: 'right', resizable: true, draggable: true },
          { id: '6', type: 'education', title: 'Formation & Certifications', visible: true, order: 3, position: 'right', resizable: true, draggable: true }
        ],
        theme: this.getDefaultThemes()[7],
        preview: 'Template spécialement conçu pour les professionnels de la technologie'
      }
    ];
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('cv-builder-state', JSON.stringify(this.state()));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('cv-builder-state');
      if (saved) {
        const parsedState = JSON.parse(saved);
        this.state.set({
          ...this.state(),
          ...parsedState,
          availableThemes: this.getDefaultThemes(),
          availableTemplates: this.getDefaultTemplates() // Conservé pour compatibilité interne
        });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }
}