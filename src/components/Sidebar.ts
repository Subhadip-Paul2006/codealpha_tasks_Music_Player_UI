/**
 * ========================================================================
 * SIDEBAR COMPONENT
 * ========================================================================
 * 
 * This is the permanent left-hand navigation menu.
 * It is only drawn ONCE when the app loads, and it stays on the screen
 * no matter what page the user clicks to.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { Store } from '../store/Store';
import { Router } from '../utils/router';
import { animateNavLinkHover } from '../utils/animations';

// ===============================
// 2. COMPONENT CLASS
// ===============================
export class Sidebar {
  private container: HTMLElement;
  private unsubscribe: (() => void) | null = null;
  private activeView: string = 'library';

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount() {
    this.render();

    this.unsubscribe = Store.getInstance().subscribe((state) => {
      if (state.activeView && state.activeView !== this.activeView) {
        this.activeView = state.activeView;
        this.render();
      }
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  // ===============================
  // 3. UI RENDERING & TEMPLATES
  // ===============================

  /** Helper function to generate repeating navigation buttons */
  private navItem(id: string, icon: string, label: string, viewKey: string, badge?: string): string {
    const isActive = this.activeView === viewKey;
    return `
      <button class="sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-sora ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-white/50 hover:text-white hover:bg-white/5'}" id="${id}">
        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' ${isActive ? '1' : '0'}">${icon}</span>
        <span class="flex-1 text-left">${label}</span>
        ${badge ? `<span class="text-[10px] font-sora font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full">${badge}</span>` : ''}
      </button>
    `;
  }

  /** Draws the entire sidebar HTML into the container */
  private render() {
    const playlists = JSON.parse(localStorage.getItem('chillz_time_playlists') || '[]');
    const likedCount = Store.getInstance().getState().likedSongIds.length;

    this.container.innerHTML = `
      <div class="flex flex-col h-full">

        <!-- Logo -->
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-center gap-3 cursor-pointer group" id="nav-brand">
            <span class="material-symbols-outlined text-primary text-3xl" id="brand-logo-icon">equalizer</span>
            <h1 class="font-serif text-xl text-white tracking-tight">Chillz<span class="font-sora text-[10px] text-primary/60 ml-1 align-super tracking-widest uppercase">Time</span></h1>
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-4 border-b border-white/5"></div>

        <!-- Menu -->
        <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          <p class="font-sora text-[10px] uppercase text-white/30 tracking-[0.2em] px-3 mb-3">Menu</p>

          ${this.navItem('nav-library', 'home', 'Library', 'library')}
          ${this.navItem('nav-search', 'search', 'Search', 'search')}
          ${this.navItem('nav-liked', 'favorite', 'Liked Songs', 'liked', likedCount > 0 ? String(likedCount) : undefined)}

          <!-- Divider -->
          <div class="pt-4 pb-2">
            <div class="border-b border-white/5"></div>
          </div>

          <p class="font-sora text-[10px] uppercase text-white/30 tracking-[0.2em] px-3 mb-3">Explore</p>

          ${this.navItem('nav-components', 'category', 'Components', 'componentsheet')}

          <!-- Playlist Header -->
          <div class="pt-6 pb-2">
            <p class="font-sora text-[10px] uppercase text-white/30 tracking-[0.2em] px-3 flex items-center justify-between">
              Your Playlists
              <button class="text-white/30 hover:text-primary transition-colors" id="btn-new-playlist">
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
            </p>
          </div>

          ${playlists.length > 0 ? playlists.map((p: any) => `
            <button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-sora">
              <span class="material-symbols-outlined text-[18px]">queue_music</span>
              <span class="truncate">${p.name}</span>
            </button>
          `).join('') : `
            <button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/20 text-sm font-sora cursor-default">
              <span class="material-symbols-outlined text-[18px]">library_music</span>
              <span class="truncate italic">No playlists yet</span>
            </button>
          `}
        </nav>

        <!-- Bottom Avatar -->
        <div class="p-4 border-t border-white/5">
          <div class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
            <div class="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-sora font-bold text-xs">
              US
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-sora text-white/80 truncate">User</p>
              <p class="text-[10px] font-sora text-white/30">Free Plan</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // ===============================
    // 4. EVENT HANDLERS
    // ===============================

    // Click listeners to change pages
    this.container.querySelector('#nav-library')?.addEventListener('click', () => {
      Router.getInstance().navigate('library');
    });

    this.container.querySelector('#nav-search')?.addEventListener('click', () => {
      Router.getInstance().navigate('search');
    });

    this.container.querySelector('#nav-liked')?.addEventListener('click', () => {
      Router.getInstance().navigate('liked');
    });

    this.container.querySelector('#nav-components')?.addEventListener('click', () => {
      Router.getInstance().navigate('componentsheet');
    });

    this.container.querySelector('#btn-new-playlist')?.addEventListener('click', () => {
      Router.getInstance().navigate('newplaylist');
    });

    this.container.querySelector('#nav-brand')?.addEventListener('click', () => {
      Router.getInstance().navigate('library');
    });

    // ===============================
    // 5. GSAP ANIMATIONS
    // ===============================

    // ★ Use the centralized nav hover animation (smooth slide + glow)
    const navItems = this.container.querySelectorAll('.sidebar-nav-item');
    animateNavLinkHover(navItems);
  }
}
