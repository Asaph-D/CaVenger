import { Injectable } from '@angular/core';
import { CVData } from '../models/cv.interface';

export interface ExternalTemplate {
  id: string;
  name: string;
  description: string;
  htmlStructure: string;
  cssStyles: string;
  thumbnail?: string;
  // Propriétés visuelles pour le rendu
  visualConfig: {
    headerStyle: 'gradient' | 'solid' | 'image' | 'minimal' | 'arch' | 'diagonal' | 'geometric' | 'asymmetric';
    headerColors: {
      primary: string;
      secondary: string;
    };
    layoutType: 'two-column' | 'single-column' | 'sidebar' | 'timeline' | 'arch' | 'diagonal' | 'circle' | 'geometric' | 'asymmetric' | 'header-top';
    columnStyles: {
      left: {
        background: string;
        border?: string;
      };
      right: {
        background: string;
        border?: string;
      };
    };
    fontFamily: {
      heading: string;
      body: string;
    };
  };
}

export interface WatermarkStyle {
  id: string;
  name: string;
  description: string;
  backgroundStyle: string;
  designPattern: string;
  preview: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExternalTemplateService {
  private externalTemplates: ExternalTemplate[] = [
    {
      id: 'cv-classic',
      name: 'Classique',
      description: 'Une colonne - Layout simple et épuré',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'gradient',
        headerColors: {
          primary: '#1e3a8a',
          secondary: '#3b82f6'
        },
        layoutType: 'single-column',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Georgia',
          body: 'Roboto'
        }
      }
    },
    {
      id: 'cv-modern',
      name: 'Moderne',
      description: 'Sidebar - Colonne latérale avec profil',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'gradient',
        headerColors: {
          primary: '#ec4899',
          secondary: '#db2777'
        },
        layoutType: 'sidebar',
        columnStyles: {
          left: {
            background: 'linear-gradient(135deg, #ec4899, #db2777)',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Montserrat',
          body: 'Roboto'
        }
      }
    },
    {
      id: 'cv-two-col',
      name: 'Deux Colonnes',
      description: 'Équilibré - Deux colonnes côte à côte',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'gradient',
        headerColors: {
          primary: '#2d5016',
          secondary: '#4a7c2c'
        },
        layoutType: 'two-column',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'linear-gradient(to bottom, #f5f3ed 0%, #e8e6dc 100%)',
            border: '3px solid #4a7c2c'
          }
        },
        fontFamily: {
          heading: 'Georgia',
          body: 'Georgia'
        }
      }
    },
    {
      id: 'cv-timeline',
      name: 'Timeline',
      description: 'Chrono - Timeline verticale avec points',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'gradient',
        headerColors: {
          primary: '#1e3a8a',
          secondary: '#3b82f6'
        },
        layoutType: 'timeline',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Poppins',
          body: 'Lato'
        }
      }
    },
    {
      id: 'cv-arch',
      name: 'Arche',
      description: 'Arc - Header avec forme arquée',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'arch',
        headerColors: {
          primary: '#3b82f6',
          secondary: '#60a5fa'
        },
        layoutType: 'arch',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Playfair Display',
          body: 'Roboto'
        }
      }
    },
    {
      id: 'cv-diagonal',
      name: 'Diagonal',
      description: 'Biais - Formes diagonales modernes',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'diagonal',
        headerColors: {
          primary: '#8b5cf6',
          secondary: '#a78bfa'
        },
        layoutType: 'diagonal',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Montserrat',
          body: 'Lato'
        }
      }
    },
    {
      id: 'cv-circle',
      name: 'Cercle',
      description: 'Rond - Points circulaires élégants',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'minimal',
        headerColors: {
          primary: '#10b981',
          secondary: '#34d399'
        },
        layoutType: 'circle',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Poppins',
          body: 'Roboto'
        }
      }
    },
    {
      id: 'cv-geometric',
      name: 'Géométrique',
      description: 'Formes - Design géométrique moderne',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'geometric',
        headerColors: {
          primary: '#f59e0b',
          secondary: '#fbbf24'
        },
        layoutType: 'geometric',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Montserrat',
          body: 'Roboto'
        }
      }
    },
    {
      id: 'cv-asymmetric',
      name: 'Asymétrique',
      description: 'Décalé - Layout asymétrique créatif',
      htmlStructure: '',
      cssStyles: '',
      thumbnail: '',
      visualConfig: {
        headerStyle: 'asymmetric',
        headerColors: {
          primary: '#ef4444',
          secondary: '#f87171'
        },
        layoutType: 'asymmetric',
        columnStyles: {
          left: {
            background: 'white',
            border: undefined
          },
          right: {
            background: 'white',
            border: undefined
          }
        },
        fontFamily: {
          heading: 'Poppins',
          body: 'Lato'
        }
      }
    }
  ];

  private watermarkStyles: WatermarkStyle[] = [
    {
      id: 'watermark-none',
      name: 'Aucun filigrane',
      description: 'Aucun filigrane ou pattern de fond',
      backgroundStyle: 'none',
      designPattern: 'none',
      preview: 'bg-white'
    },
    {
      id: 'watermark-dots',
      name: 'Points',
      description: 'Pattern de points subtils',
      backgroundStyle: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px)',
      designPattern: 'dots',
      preview: 'bg-gradient-to-br from-gray-50 to-gray-100'
    },
    {
      id: 'watermark-grid',
      name: 'Grille',
      description: 'Pattern de grille subtil',
      backgroundStyle: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px)',
      designPattern: 'grid',
      preview: 'bg-gradient-to-br from-blue-50 to-blue-100'
    },
    {
      id: 'watermark-diagonal',
      name: 'Diagonales',
      description: 'Lignes diagonales subtiles',
      backgroundStyle: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px)',
      designPattern: 'diagonal',
      preview: 'bg-gradient-to-br from-purple-50 to-purple-100'
    },
    {
      id: 'watermark-waves',
      name: 'Vagues',
      description: 'Pattern de vagues subtiles',
      backgroundStyle: 'radial-gradient(circle at 20% 50%, rgba(0,0,0,0.02) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,0,0,0.02) 0%, transparent 50%)',
      designPattern: 'waves',
      preview: 'bg-gradient-to-br from-green-50 to-green-100'
    },
    {
      id: 'watermark-geometric',
      name: 'Géométrique',
      description: 'Formes géométriques subtiles',
      backgroundStyle: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px), repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 4px)',
      designPattern: 'geometric',
      preview: 'bg-gradient-to-br from-indigo-50 to-indigo-100'
    }
  ];

  getExternalTemplates(): ExternalTemplate[] {
    return this.externalTemplates;
  }

  getExternalTemplate(id: string): ExternalTemplate | undefined {
    return this.externalTemplates.find(t => t.id === id);
  }

  getWatermarkStyles(): WatermarkStyle[] {
    return this.watermarkStyles;
  }

  getWatermarkStyle(id: string): WatermarkStyle | undefined {
    return this.watermarkStyles.find(w => w.id === id);
  }

  applyExternalTemplate(cvData: CVData, templateId: string): CVData {
    const template = this.getExternalTemplate(templateId);
    if (!template) return cvData;

    const updatedCV = { ...cvData };
    
    // Stocker le template externe dans CVData
    updatedCV.externalTemplate = {
      id: template.id,
      htmlStructure: template.htmlStructure,
      cssStyles: template.cssStyles
    };

    // Appliquer la configuration visuelle au thème
    if (updatedCV.theme && template.visualConfig) {
      updatedCV.theme = {
        ...updatedCV.theme,
        primaryColor: template.visualConfig.headerColors.primary,
        secondaryColor: template.visualConfig.headerColors.secondary,
        fontFamily: template.visualConfig.fontFamily
      };
    }

    return updatedCV;
  }

  applyWatermarkStyle(cvData: CVData, watermarkId: string): CVData {
    const watermark = this.getWatermarkStyle(watermarkId);
    if (!watermark) return cvData;

    const updatedCV = { ...cvData };
    
    // Stocker le filigrane dans CVData
    updatedCV.watermarkStyle = {
      id: watermark.id,
      backgroundStyle: watermark.backgroundStyle,
      designPattern: watermark.designPattern
    };

    return updatedCV;
  }

  getTemplateVisualConfig(templateId: string) {
    const template = this.getExternalTemplate(templateId);
    return template?.visualConfig;
  }

  // Méthodes pour générer les structures HTML des templates
  private getGreenClassicHTML(): string {
    return `
      <div class="container">
        <div class="header">
          <div class="logo">{{initials}}</div>
          <div class="name">{{firstName}} {{lastName}}</div>
          <div class="title">{{title}}</div>
        </div>
        <div class="main-content">
          <div class="left-column">
            <!-- Sections dynamiques -->
          </div>
          <div class="right-column">
            <!-- Sections dynamiques -->
          </div>
        </div>
      </div>
    `;
  }

  private getGreenClassicCSS(): string {
    return `
      body {
        font-family: 'Georgia', 'Times New Roman', serif;
        margin: 0;
        padding: 0;
        background: #f8f6f0;
      }
      .container {
        background: white;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      .header {
        color: white;
        text-align: center;
        background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%);
        padding: 40px 30px;
        position: relative;
        overflow: hidden;
      }
      .main-content {
        display: flex;
      }
      .left-column {
        flex: 2;
        padding: 40px;
        background: white;
      }
      .right-column {
        flex: 1;
        background: linear-gradient(to bottom, #f5f3ed 0%, #e8e6dc 100%);
        padding: 40px 30px;
        border-left: 3px solid #4a7c2c;
      }
    `;
  }

  private getBlueModernHTML(): string {
    return `
      <div class="container">
        <div class="header">
          <div class="logo">{{initials}}</div>
          <div class="name">{{firstName}} {{lastName}}</div>
          <div class="title">{{title}}</div>
        </div>
        <div class="main-content">
          <div class="left-column">
            <!-- Sections dynamiques -->
          </div>
          <div class="right-column">
            <!-- Sections dynamiques -->
          </div>
        </div>
      </div>
    `;
  }

  private getBlueModernCSS(): string {
    return `
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background: #f0f2f5;
      }
      .container {
        margin: 30px auto;
        max-width: 1000px;
        background: white;
        box-shadow: 0 0 25px rgba(0,0,0,0.15);
      }
      .header {
        color: white;
        text-align: center;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 40px 30px;
        position: relative;
        overflow: hidden;
      }
      .main-content {
        display: flex;
      }
      .left-column {
        flex: 2;
        padding: 40px;
        background: white;
      }
      .right-column {
        flex: 1;
        background: linear-gradient(to bottom, #eff6ff 0%, #dbeafe 100%);
        padding: 40px 30px;
        border-left: 3px solid #3b82f6;
      }
    `;
  }

  private getWilfriedHTML(): string {
    return `
      <div class="all">
        <div class="entete">
          <div class="image">
            <img class="img" src="{{profilePicture}}" alt="">
          </div>
          <div class="infos">
            <h2><b>{{firstName}} {{lastName}}</b> <br><sub>{{title}}</sub></h2>
          </div>
        </div>
        <div class="CV">
          <div class="colonne1">
            <!-- Sections dynamiques -->
          </div>
          <div class="colonne2">
            <!-- Sections dynamiques -->
          </div>
        </div>
      </div>
    `;
  }

  private getWilfriedCSS(): string {
    return `
      .all {
        font-family: Arial, sans-serif;
      }
      .entete {
        display: flex;
        align-items: center;
        padding: 20px;
        background: #f5f5f5;
      }
      .image {
        margin-right: 20px;
      }
      .img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
      }
      .CV {
        display: flex;
      }
      .colonne1 {
        flex: 1;
        background: #f9f9f9;
        padding: 20px;
      }
      .colonne2 {
        flex: 2;
        padding: 20px;
      }
    `;
  }
}


