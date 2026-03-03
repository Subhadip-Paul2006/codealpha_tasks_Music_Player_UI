import { View } from '../types/View';
import { Store } from '../store/Store';
import { songs } from '../data/songs';
import { formatTime } from '../utils/formatTime';
import { AudioService } from '../services/AudioService';
import { Router } from '../utils/router';

export class AlbumView implements View {
  private container: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;
  private unsubscribeEvents: (() => void)[] = [];

  mount(container: HTMLElement): void {
    this.container = container;
    this.render();

    this.unsubscribe = Store.getInstance().subscribe(() => {
      this.updateActiveSongState();
    });

    this.attachEvents();
  }

  destroy(): void {
    if (this.unsubscribe) this.unsubscribe();
    this.unsubscribeEvents.forEach(unsub => unsub());
    this.unsubscribeEvents = [];
    if (this.container) this.container.innerHTML = '';
  }

  private render() {
    if (!this.container) return;

    // Using first song as a mock album reference
    const albumCover = songs.length > 0 ? songs[0].cover : '';

    const trackRows = songs.map((song, i) => `
      <tr class="group hover:bg-white/5 transition-colors cursor-pointer text-white/80 song-row" data-id="${song.id}">
        <td class="px-6 py-5 opacity-40 group-hover:opacity-100 transition-opacity w-16">
          <div class="relative w-full h-full flex items-center">
            <span class="absolute inset-x-0 group-hover:opacity-0">${(i + 1).toString().padStart(2, '0')}</span>
            <span class="material-symbols-outlined absolute inset-x-0 opacity-0 group-hover:opacity-100 text-primary">play_arrow</span>
          </div>
        </td>
        <td class="px-6 py-5 font-medium text-white group-hover:text-primary transition-colors">${song.title}</td>
        <td class="px-6 py-5 opacity-60"><span class="artist-link cursor-pointer hover:underline hover:text-primary transition-colors" data-artist="${song.artist}">${song.artist}</span></td>
        <td class="px-6 py-5 text-right opacity-40 group-hover:opacity-100">${formatTime(song.duration || 0)}</td>
      </tr>
    `).join('');

    this.container.innerHTML = `
      <div class="px-20 py-12 flex-1 w-full max-w-[1440px] mx-auto text-primary animate-fade-in pb-32">
        <header class="mb-14 flex items-end gap-8 border-b border-white/5 pb-12">
           <img src="${albumCover}" class="w-64 h-64 bg-neutral-800 rounded-xl shadow-2xl object-cover border border-white/5" />
           <div>
             <p class="font-sora text-sm text-primary tracking-widest uppercase mb-2">Album</p>
             <h1 class="font-serif text-6xl text-white mb-4">Vesper Variations</h1>
             <p class="font-sora text-sm text-white/60 mb-6">Eleanor Vance • 2024 • ${songs.length} songs</p>
             <div class="flex gap-4">
               <button class="size-14 rounded-full bg-primary flex items-center justify-center text-background-dark hover:scale-110 transition-transform shadow-[0_0_20px_rgba(201,167,74,0.4)]" id="btn-play-all">
                  <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1">play_arrow</span>
               </button>
               <button class="size-14 rounded-full border border-white/10 flex items-center justify-center hover:border-primary text-white/60 hover:text-primary transition-colors"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0">favorite</span></button>
               <button class="size-14 rounded-full border border-white/10 flex items-center justify-center hover:border-white text-white/60 hover:text-white transition-colors"><span class="material-symbols-outlined">more_horiz</span></button>
             </div>
           </div>
        </header>

        <section class="grid grid-cols-12 gap-12">
          <div class="col-span-12 lg:col-span-8 bg-transparent overflow-hidden">
            <table class="w-full text-left font-sora text-sm">
              <thead class="border-b border-white/5 text-[10px] uppercase tracking-widest text-primary/60">
                <tr>
                  <th class="px-6 py-4 w-16">#</th>
                  <th class="px-6 py-4">Title</th>
                  <th class="px-6 py-4">Artist</th>
                  <th class="px-6 py-4 text-right">Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5" id="track-list">
                ${trackRows}
              </tbody>
            </table>
          </div>
          <div class="col-span-12 lg:col-span-4 space-y-8 hidden lg:block">
            <div class="glass p-6 rounded-xl">
               <h3 class="font-serif text-2xl text-white mb-4">About the Artist</h3>
               <p class="font-sora text-sm text-white/60 leading-relaxed mb-4">Eleanor Vance weaves intricate sonic tapestries combining classical instrumentation with modern electronic undercurrents...</p>
               <button class="text-primary font-sora text-sm font-semibold hover:underline">Read more</button>
            </div>
          </div>
        </section>
      </div>
    `;
    this.updateActiveSongState();
  }

  private updateActiveSongState() {
    if (!this.container) return;
    const state = Store.getInstance().getState();
    const rows = this.container.querySelectorAll('.song-row');

    rows.forEach(row => {
      const id = parseInt(row.getAttribute('data-id') || '0', 10);
      if (id === state.currentSongId) {
        row.classList.add('bg-white/5', 'text-primary');
        row.classList.remove('text-white/80');
        // Update first cell
        const numCell = row.querySelector('td:first-child') as HTMLElement;
        if (numCell) {
          numCell.innerHTML = `
             <div class="flex items-end gap-0.5 h-4 w-4">
               <div class="w-0.5 bg-primary h-full animate-pulse opacity-${state.isPlaying ? '100' : '50'}"></div>
               <div class="w-0.5 bg-primary h-1/2 animate-pulse opacity-${state.isPlaying ? '100' : '50'}" style="animation-delay: 0.1s"></div>
               <div class="w-0.5 bg-primary h-3/4 animate-pulse opacity-${state.isPlaying ? '100' : '50'}" style="animation-delay: 0.2s"></div>
             </div>
           `;
        }
      } else {
        row.classList.remove('bg-white/5', 'text-primary');
        row.classList.add('text-white/80');
      }
    });
  }

  private attachEvents() {
    if (!this.container) return;

    const rows = this.container.querySelectorAll('.song-row');
    rows.forEach(row => {
      const handler = () => {
        const id = parseInt(row.getAttribute('data-id') || '0', 10);
        const song = songs.find(s => s.id === id);
        if (song) {
          const store = Store.getInstance();
          if (store.getState().currentSongId === id) {
            AudioService.getInstance().togglePlay();
          } else {
            store.setState({ currentSongId: id, isPlaying: true });
            AudioService.getInstance().loadTrack(song.src);
            AudioService.getInstance().play();
          }
        }
      };
      row.addEventListener('click', handler);
      this.unsubscribeEvents.push(() => row.removeEventListener('click', handler));
    });

    const playAll = this.container.querySelector('#btn-play-all');
    if (playAll) {
      const h = () => {
        if (songs.length > 0) {
          Store.getInstance().setState({ currentSongId: songs[0].id, isPlaying: true });
          AudioService.getInstance().loadTrack(songs[0].src);
          AudioService.getInstance().play();
        }
      };
      playAll.addEventListener('click', h);
      this.unsubscribeEvents.push(() => playAll.removeEventListener('click', h));
    }

    // Artist links
    const artistLinks = this.container.querySelectorAll('.artist-link');
    artistLinks.forEach(link => {
      const h = (e: Event) => {
        e.stopPropagation();
        const artistName = (link as HTMLElement).dataset.artist;
        if (artistName) {
          Router.getInstance().navigate('artist', { artistName });
        }
      };
      link.addEventListener('click', h);
      this.unsubscribeEvents.push(() => link.removeEventListener('click', h));
    });
  }
}
