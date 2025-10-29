import { Component, EventEmitter, Output, OnInit, OnDestroy, signal, Input, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Mesh,
  Vector3,
  Vector2,
  SphereGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
  CanvasTexture,
  AmbientLight,
  DirectionalLight,
  Raycaster,
  Color,
  TextureLoader
} from 'three';

interface Country {
  name: string;
  lat: number;
  lng: number;
  code: string;
}

@Component({
  selector: 'app-globe-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="close()">
      <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full mx-4" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900">
            {{ mode === 'country' ? 'Sélectionnez votre pays' : 'Sélectionnez votre lieu de naissance' }}
          </h3>
          <button (click)="close()" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="mb-4">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="filterCountries()"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Rechercher un pays...">
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Globe Container -->
          <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
            <div #globeContainer class="w-full h-96 cursor-pointer"></div>
            <div *ngIf="selectedCountry()" class="p-4 bg-white border-t">
              <p class="text-sm text-gray-600">Pays sélectionné:</p>
              <p class="text-lg font-semibold text-purple-600">{{ selectedCountry() }}</p>
            </div>
          </div>

          <!-- Country List -->
          <div class="overflow-y-auto h-96 border border-gray-200 rounded-lg">
            <div class="divide-y">
              <button
                *ngFor="let country of filteredCountries()"
                (click)="selectCountryFromList(country)"
                class="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors flex items-center justify-between group">
                <span class="font-medium text-gray-700 group-hover:text-purple-600">
                  {{ country.name }}
                </span>
                <i class="fas fa-chevron-right text-gray-400 group-hover:text-purple-600"></i>
              </button>
              <div *ngIf="filteredCountries().length === 0" class="p-8 text-center text-gray-500">
                <i class="fas fa-search text-3xl mb-2"></i>
                <p>Aucun pays trouvé</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button 
            (click)="close()"
            class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button 
            (click)="confirm()"
            [disabled]="!selectedCountry()"
            class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
            Confirmer
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
export class GlobeSelectorComponent implements OnInit, OnDestroy {
  @Input() mode: 'country' | 'birthplace' = 'country';
  @Output() countrySelected = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();
  searchQuery = '';
  selectedCountry = signal<string>('');
  filteredCountries = signal<Country[]>([]);

  private scene!: InstanceType<typeof Scene>;
  private camera!: InstanceType<typeof PerspectiveCamera>;
  private renderer!: InstanceType<typeof WebGLRenderer>;
  private globe!: InstanceType<typeof Mesh>;
  private animationId?: number;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  @ViewChild('globeContainer', { static: true }) globeContainer!: ElementRef<HTMLDivElement>;

  // Liste des pays avec leurs coordonnées
  private countries: Country[] = [
    { name: 'France', lat: 46.2276, lng: 2.2137, code: 'FR' },
    { name: 'Cameroun', lat: 7.3697, lng: 12.3547, code: 'CM' },
    { name: 'États-Unis', lat: 37.0902, lng: -95.7129, code: 'US' },
    { name: 'Canada', lat: 56.1304, lng: -106.3468, code: 'CA' },
    { name: 'Royaume-Uni', lat: 55.3781, lng: -3.4360, code: 'GB' },
    { name: 'Allemagne', lat: 51.1657, lng: 10.4515, code: 'DE' },
    { name: 'Italie', lat: 41.8719, lng: 12.5674, code: 'IT' },
    { name: 'Espagne', lat: 40.4637, lng: -3.7492, code: 'ES' },
    { name: 'Belgique', lat: 50.5039, lng: 4.4699, code: 'BE' },
    { name: 'Suisse', lat: 46.8182, lng: 8.2275, code: 'CH' },
    { name: 'Maroc', lat: 31.7917, lng: -7.0926, code: 'MA' },
    { name: 'Algérie', lat: 28.0339, lng: 1.6596, code: 'DZ' },
    { name: 'Tunisie', lat: 33.8869, lng: 9.5375, code: 'TN' },
    { name: 'Sénégal', lat: 14.4974, lng: -14.4524, code: 'SN' },
    { name: 'Côte d\'Ivoire', lat: 7.5400, lng: -5.5471, code: 'CI' },
    { name: 'Chine', lat: 35.8617, lng: 104.1954, code: 'CN' },
    { name: 'Japon', lat: 36.2048, lng: 138.2529, code: 'JP' },
    { name: 'Inde', lat: 20.5937, lng: 78.9629, code: 'IN' },
    { name: 'Brésil', lat: -14.2350, lng: -51.9253, code: 'BR' },
    { name: 'Mexique', lat: 23.6345, lng: -102.5528, code: 'MX' },
    { name: 'Argentine', lat: -38.4161, lng: -63.6167, code: 'AR' },
    { name: 'Australie', lat: -25.2744, lng: 133.7751, code: 'AU' },
    { name: 'Russie', lat: 61.5240, lng: 105.3188, code: 'RU' },
    { name: 'Afrique du Sud', lat: -30.5595, lng: 22.9375, code: 'ZA' },
    { name: 'Égypte', lat: 26.8206, lng: 30.8025, code: 'EG' },
    { name: 'Turquie', lat: 38.9637, lng: 35.2433, code: 'TR' },
    { name: 'Arabie Saoudite', lat: 23.8859, lng: 45.0792, code: 'SA' },
    { name: 'Émirats Arabes Unis', lat: 23.4241, lng: 53.8478, code: 'AE' },
    { name: 'Corée du Sud', lat: 35.9078, lng: 127.7669, code: 'KR' },
    { name: 'Thaïlande', lat: 15.8700, lng: 100.9925, code: 'TH' },
    { name: 'Vietnam', lat: 14.0583, lng: 108.2772, code: 'VN' },
    { name: 'Indonésie', lat: -0.7893, lng: 113.9213, code: 'ID' },
    { name: 'Philippines', lat: 12.8797, lng: 121.7740, code: 'PH' },
    { name: 'Pakistan', lat: 30.3753, lng: 69.3451, code: 'PK' },
    { name: 'Bangladesh', lat: 23.6850, lng: 90.3563, code: 'BD' },
    { name: 'Nigeria', lat: 9.0820, lng: 8.6753, code: 'NG' },
    { name: 'Kenya', lat: -0.0236, lng: 37.9062, code: 'KE' },
    { name: 'Ghana', lat: 7.9465, lng: -1.0232, code: 'GH' },
    { name: 'Éthiopie', lat: 9.1450, lng: 40.4897, code: 'ET' },
    { name: 'Madagascar', lat: -18.7669, lng: 46.8691, code: 'MG' },
  ];

  ngOnInit() {
    this.filteredCountries.set(this.countries);
  }

  ngAfterViewInit() {
    this.initGlobe();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initGlobe() {
    const container = this.globeContainer.nativeElement;
    if (!container) return;

    // Scene
    this.scene = new Scene();
    this.scene.background = new Color(0xf0f4ff);

    // Camera
    this.camera = new PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 3;

    // Renderer
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Globe
    const geometry = new SphereGeometry(1, 64, 64);
    const textureLoader = new TextureLoader();
    
    // Créer une texture simple pour le globe
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Fond océan
    ctx.fillStyle = '#4a90e2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Continents simplifiés (vert)
    ctx.fillStyle = '#52c41a';
    ctx.globalAlpha = 0.8;
    
    // Dessiner des formes approximatives de continents
    this.drawContinents(ctx, canvas.width, canvas.height);
    
    const texture = new CanvasTexture(canvas);
    const material = new MeshPhongMaterial({ 
      map: texture,
      shininess: 20
    });
    
    this.globe = new Mesh(geometry, material);
    this.scene.add(this.globe);

    // Ajouter des points pour les pays
    this.addCountryMarkers();

    // Lights
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);

    // Mouse events
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.renderer.domElement.addEventListener('click', this.onGlobeClick.bind(this));

    // Animation
    this.animate();
  }

  private drawContinents(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Afrique
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.55, width * 0.08, height * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Europe
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.35, width * 0.06, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Asie
    ctx.beginPath();
    ctx.ellipse(width * 0.7, height * 0.35, width * 0.15, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Amérique du Nord
    ctx.beginPath();
    ctx.ellipse(width * 0.15, height * 0.3, width * 0.08, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Amérique du Sud
    ctx.beginPath();
    ctx.ellipse(width * 0.2, height * 0.65, width * 0.05, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Australie
    ctx.beginPath();
    ctx.ellipse(width * 0.82, height * 0.75, width * 0.05, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private addCountryMarkers() {
    const markerGeometry = new SphereGeometry(0.015, 16, 16);
    const markerMaterial = new MeshBasicMaterial({ color: 0xff6b6b });

    this.countries.forEach(country => {
      const marker = new Mesh(markerGeometry, markerMaterial);
      const position = this.latLngToVector3(country.lat, country.lng, 1.01);
      marker.position.copy(position);
      marker.userData = { country: country.name };
      this.scene.add(marker);
    });
  }

  private latLngToVector3(lat: number, lng: number, radius: number): InstanceType<typeof Vector3> {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new Vector3(x, y, z);
  }

  private onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX = event.clientX - this.previousMousePosition.x;
      const deltaY = event.clientY - this.previousMousePosition.y;

      this.globe.rotation.y += deltaX * 0.005;
      this.globe.rotation.x += deltaY * 0.005;

      this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  }

  private onMouseUp() {
    this.isDragging = false;
  }

  private onGlobeClick(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const mouse = new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.scene.children);
    
    for (const intersect of intersects) {
      if (intersect.object.userData['country']) {
        this.selectCountry(intersect.object.userData['country']);
        break;
      }
    }
  }

  private animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (!this.isDragging) {
      this.globe.rotation.y += 0.001;
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  filterCountries() {
    const query = this.searchQuery.toLowerCase();
    this.filteredCountries.set(
      this.countries.filter(c => c.name.toLowerCase().includes(query))
    );
  }

  selectCountryFromList(country: Country) {
    this.selectCountry(country.name);
  }

  selectCountry(countryName: string) {
    this.selectedCountry.set(countryName);
  }

  confirm() {
    if (this.selectedCountry()) {
      this.countrySelected.emit(this.selectedCountry());
      this.close();
    }
  }

  close() {
    this.closed.emit();
  }
}