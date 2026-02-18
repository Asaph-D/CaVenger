import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CVData } from '../models/cv.interface';

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  layout: string;
  placeholders?: string[];
}

export interface CVTemplateDetails extends CVTemplate {
  preview: string;
}

export interface GenerateCVRequest {
  userEmail: string;
  templateId: string;
  cvData: any;
}

export interface GenerateCVResponse {
  success: boolean;
  message: string;
  submissionId: number;
}

export interface CVSubmissionStatus {
  id: number;
  user_email: string;
  template_id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CvApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/cv'; // À adapter selon votre configuration

  /**
   * Récupère la liste de tous les templates disponibles
   */
  getTemplates(): Observable<{ success: boolean; data: CVTemplate[] }> {
    return this.http.get<{ success: boolean; data: CVTemplate[] }>(`${this.apiUrl}/templates`);
  }

  /**
   * Récupère les détails d'un template spécifique
   */
  getTemplateDetails(templateId: string): Observable<{ success: boolean; data: CVTemplateDetails }> {
    return this.http.get<{ success: boolean; data: CVTemplateDetails }>(`${this.apiUrl}/templates/${templateId}`);
  }

  /**
   * Génère un CV et l'envoie par email
   */
  generateCV(request: GenerateCVRequest): Observable<GenerateCVResponse> {
    return this.http.post<GenerateCVResponse>(`${this.apiUrl}/generate`, request);
  }

  /**
   * Récupère le statut d'une soumission
   */
  getSubmissionStatus(submissionId: number): Observable<{ success: boolean; data: CVSubmissionStatus }> {
    return this.http.get<{ success: boolean; data: CVSubmissionStatus }>(`${this.apiUrl}/status/${submissionId}`);
  }

  /**
   * Récupère l'historique des CV pour un utilisateur
   */
  getCVHistory(email: string): Observable<{ success: boolean; data: CVSubmissionStatus[] }> {
    return this.http.get<{ success: boolean; data: CVSubmissionStatus[] }>(`${this.apiUrl}/history/${email}`);
  }

  /**
   * Transforme les données CV du frontend vers le format attendu par le backend
   */
  transformCVDataForBackend(cvData: CVData): any {
    return {
      personalInfo: cvData.personalInfo,
      contactInfo: cvData.contactInfo,
      experience: cvData.experience,
      education: cvData.education,
      skills: cvData.skills,
      languages: cvData.languages,
      interests: cvData.interests
    };
  }

  /**
   * Génère un CV avec les données du frontend (méthode complète)
   */
  generateCVFromFrontend(userEmail: string, templateId: string, cvData: CVData): Observable<GenerateCVResponse> {
    const transformedData = this.transformCVDataForBackend(cvData);
    return this.generateCV({
      userEmail,
      templateId,
      cvData: transformedData
    });
  }
}

