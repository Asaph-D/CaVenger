// src/app/services/theme.service.ts
import { Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeKey = 'app-theme';
  theme = signal<Theme>('light');

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = (localStorage.getItem(this.themeKey) as Theme) || this.getSystemPreference();
    this.setTheme(savedTheme);
  }

  private getSystemPreference(): Theme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private setTheme(theme: Theme): void {
    this.theme.set(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(this.themeKey, theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDarkMode(): boolean {
    return this.theme() === 'dark';
  }
}
