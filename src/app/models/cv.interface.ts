export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  maritalStatus?: string;
  nationality?: string;
  profilePicture?: string;
  profileType: 'image' | 'initials';
  initials?: string;
  summary: string;
}

export interface ContactInfo {
  id: string;
  icon: string;
  label: string;
  value: string;
  type: 'email' | 'phone' | 'address' | 'website' | 'linkedin' | 'birthday' | 'marital' | 'nationality' | 'other';
  visible: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  category?: string;
  visible: boolean;
}

export interface Language {
  id: string;
  name: string;
  level: number; // 0-100
  levelDescription: string; // e.g., "Avancé (C1)"
  visible: boolean;
}

export interface Interest {
  id: string;
  name: string;
  icon: string;
  visible: boolean;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bulletStyle: string |'dot' | 'dash' | 'arrow' | 'check' | 'star';
  current: boolean;
  description: string[];
  visible: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
  grade?: string;
  visible: boolean;
}

export interface CVSection {
  id: string;
  type: 'personal-info' | 'profile' | 'experience' | 'education' | 'skills' | 'languages' | 'interests' | 'contact' | 'custom';
  title: string;
  visible: boolean;
  order: number;
  position: 'left' | 'right';
  width?: number;
  height?: number;
  data?: any;
  resizable: boolean;
  draggable: boolean;
}

export interface CVTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: {
    heading: string;
    body: string;
  };
  layout: 'two-column' | 'single-column' | 'modern' | 'classic';
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layout: 'two-column' | 'single-column' | 'modern' | 'classic';
  sections: CVSection[];
  theme: CVTheme;
  preview: string;
}

export interface CVData {
  id: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo[];
  skills: Skill[];
  languages: Language[];
  interests: Interest[];
  experience: ExperienceItem[];
  education: EducationItem[];
  sections: CVSection[];
  theme: CVTheme;
  template: CVTemplate;
  layout: {
    leftColumnWidth: number;
    rightColumnWidth: number;
    pageHeight: number;
    fontSize: {
      heading: number;
      body: number;
      small: number;
    };
    /**
     * Position de la photo de profil ('center-top' ou 'left')
     */
    profilePicturePosition?: 'center-top' | 'left';
  };
  externalTemplate?: {
    id: string;
    htmlStructure: string;
    cssStyles: string;
  };
  watermarkStyle?: {
    id: string;
    backgroundStyle: string;
    designPattern: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CVState {
  currentCV: CVData | null;
  savedCVs: CVData[];
  availableThemes: CVTheme[];
  availableTemplates: CVTemplate[];
  isEditing: boolean;
  selectedSection: string | null;
  selectedElement: string | null;
  isDirty: boolean;
  dragMode: boolean;
  resizeMode: boolean;
  showHelp: boolean;
}

export interface DragDropData {
  elementId: string;
  elementType: 'section' | 'item';
  sourceContainer: string;
  targetContainer: string;
  position: number;
}

export interface ResizeData {
  elementId: string;
  width: number;
  height: number;
  fontSize?: {
    body: number;
    heading: number;
    small: number;
  };
}


export interface HelpTip {
  id: string;
  element: string;
  title: string;
  description: string;
  action?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}