/**
 * ========================================================================
 * NEW PLAYLIST MODAL
 * ========================================================================
 * 
 * A popup overlay for creating a new playlist. It uses GSAP to bounce
 * in when opened and scale down smoothly when closed.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { View } from '../types/View';
import { Router } from '../utils/router';
import { storage } from '../utils/storage';
import { animateModalIn, animateModalOut } from '../utils/animations';
import gsap from 'gsap';

// ===============================
// 2. COMPONENT CLASS & GSAP ENTRY
// ===============================
export class NewPlaylistModal implements View {
  private container: HTMLElement | null = null;
  private unsubscribeEvents: (() => void)[] = [];

  mount(container: HTMLElement): void {
    this.container = container;
    this.render();

    // ★ GSAP: Smooth modal entrance (fade + scale with overshoot)
    animateModalIn(this.container.children);

    this.attachEvents();
  }

  destroy(): void {
    this.unsubscribeEvents.forEach(unsub => unsub());
    this.unsubscribeEvents = [];
    if (this.container) {
      gsap.killTweensOf(this.container.children);
      this.container.innerHTML = '';
    }
  }

  // ===============================
  // 3. UI RENDERING
  // ===============================
  private render() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" id="modal-backdrop"></div>
        
        <!-- Modal Content -->
        <div class="glass w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10 font-sora flex flex-col gap-6">
          <header class="flex justify-between items-center mb-2">
            <h2 class="text-2xl font-serif text-white">Create New Playlist</h2>
            <button class="text-white/40 hover:text-white transition-colors" id="btn-close-modal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </header>

          <div class="space-y-4">
             <div>
               <label class="block text-xs uppercase tracking-widest text-primary/60 mb-2">Name</label>
               <input type="text" id="input-name" placeholder="E.g. Study Vibes" class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors" />
             </div>
             <div>
               <label class="block text-xs uppercase tracking-widest text-primary/60 mb-2">Description <span class="opacity-50">(Optional)</span></label>
               <textarea id="input-desc" placeholder="What's the mood?" class="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors h-24 resize-none"></textarea>
             </div>
          </div>

          <div class="flex justify-end gap-4 mt-4">
            <button id="btn-cancel" class="px-6 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors font-semibold">Cancel</button>
            <button id="btn-create" class="px-6 py-2.5 bg-primary text-background-dark rounded-lg font-bold hover:shadow-[0_0_15px_rgba(201,167,74,0.4)] transition-all pointer-events-none opacity-50">Create Playlist</button>
          </div>
        </div>
      </div>
    `;
  }

  // ===============================
  // 4. EVENT HANDLERS & GSAP EXIT
  // ===============================
  private attachEvents() {
    if (!this.container) return;

    const closeModal = () => {
      if (this.container) {
        // ★ GSAP: Smooth modal exit (scale down + fade out)
        animateModalOut(this.container.children, () => {
          Router.getInstance().hideOverlay();
        });
      }
    };

    const closeBtn = this.container.querySelector('#btn-close-modal');
    closeBtn?.addEventListener('click', closeModal);
    this.unsubscribeEvents.push(() => closeBtn?.removeEventListener('click', closeModal));

    const cancelBtn = this.container.querySelector('#btn-cancel');
    cancelBtn?.addEventListener('click', closeModal);
    this.unsubscribeEvents.push(() => cancelBtn?.removeEventListener('click', closeModal));

    const backdrop = this.container.querySelector('#modal-backdrop');
    backdrop?.addEventListener('click', closeModal);
    this.unsubscribeEvents.push(() => backdrop?.removeEventListener('click', closeModal));

    // Input logic
    const inputName = this.container.querySelector('#input-name') as HTMLInputElement;
    const createBtn = this.container.querySelector('#btn-create');

    const hInput = () => {
      if (inputName.value.trim().length > 0) {
        createBtn?.classList.remove('pointer-events-none', 'opacity-50');
      } else {
        createBtn?.classList.add('pointer-events-none', 'opacity-50');
      }
    };
    inputName?.addEventListener('input', hInput);
    this.unsubscribeEvents.push(() => inputName?.removeEventListener('input', hInput));

    const hCreate = () => {
      const name = inputName.value.trim();
      if (name) {
        const playlists = storage.getPlaylists();
        const pId = 'p-' + Date.now();
        playlists.push({
          id: pId,
          name,
          songIds: [],
          createdAt: Date.now()
        });
        storage.setPlaylists(playlists);

        // Re-render sidebar to show new playlist?
        // Since Sidebar doesn't subscribe to playlist changes yet, we'd need a full reload or state event.
        // For now, modal closes.
        closeModal();
      }
    };
    createBtn?.addEventListener('click', hCreate);
    this.unsubscribeEvents.push(() => createBtn?.removeEventListener('click', hCreate));
  }
}
