/**
 * ========================================================================
 * LIBRARY VIEW
 * ========================================================================
 * 
 * This is the main "Home" page of the application. It shows featured 
 * songs, artist circles, and a list of all available tracks.
 * 
 * HOW IT WORKS:
 * - It gathers all songs from the `songs.ts` database.
 * - It figures out unique artists to draw the artist circles.
 * - It listens to the `Store` so it knows which track row to highlight as "Now Playing".
 */

// ===============================
// 1. IMPORTS
// ===============================
import { View } from '../types/View';
import { Store } from '../store/Store';
import { songs } from '../data/songs';
import { Router } from '../utils/router';
import { AudioService } from '../services/AudioService';
import { formatTime } from '../utils/formatTime';
import { groupByArtist } from '../utils/groupByArtist';
import { getArtistByName } from '../data/artists';
import { animateCards, animateCardsOnScroll, animateCardHoverGlow, animateHeroText, cleanupAnimations } from '../utils/animations';
import gsap from 'gsap';

// ===============================
// 2. COMPONENT CLASS
// ===============================

export class LibraryView implements View {
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
    if (this.container) {
      cleanupAnimations(this.container);
      this.container.innerHTML = '';
    }
  }

  // ===============================
  // 3. UI RENDERING
  // ===============================

  /** Builds the massive HTML string for the library page and inserts it */
  private render() {
    if (!this.container) return;
    const trackRows = songs.map((song, i) => `
      <tr class="group hover:bg-white/[0.04] transition-all duration-200 cursor-pointer song-row" data-id="${song.id}">
        <td class="pl-6 pr-2 py-3 w-12 text-white/30 group-hover:text-white/70 text-sm font-mono">
          <div class="relative flex items-center justify-center">
            <span class="group-hover:hidden">${(i + 1).toString().padStart(2, '0')}</span>
            <span class="material-symbols-outlined hidden group-hover:block text-primary text-lg">play_arrow</span>
          </div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center gap-3">
            <img src="${song.cover}" class="size-10 rounded object-cover flex-shrink-0 bg-surface-light shadow" alt="${song.title}" />
            <div class="flex flex-col min-w-0">
              <span class="font-medium text-white text-sm truncate group-hover:text-primary transition-colors">${song.title}</span>
              <span class="text-xs text-white/35 truncate">${song.album}</span>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-white/40 text-sm hidden lg:table-cell">
          <span class="artist-link cursor-pointer hover:underline hover:text-primary transition-colors" data-artist="${song.artist}">${song.artist}</span>
        </td>
        <td class="px-4 py-3 text-white/30 text-sm text-right font-mono">${formatTime(song.duration || 0)}</td>
        <td class="px-2 py-3 w-12">
          <button class="btn-like text-white/20 hover:text-primary transition-colors p-1 opacity-0 group-hover:opacity-100" data-like-id="${song.id}" title="${Store.getInstance().isLiked(song.id) ? 'Unlike' : 'Like'}">
            <span class="material-symbols-outlined text-[18px] ${Store.getInstance().isLiked(song.id) ? 'text-primary' : ''}" style="font-variation-settings: 'FILL' ${Store.getInstance().isLiked(song.id) ? '1' : '0'}">favorite</span>
          </button>
        </td>
      </tr>
    `).join('');

    // Pick featured songs (first 4 songs with different artists)
    const featured = this.getFeaturedSongs();

    this.container.innerHTML = `
      <div class="p-8 lg:p-12 max-w-[1200px] mx-auto pb-32">

        <!-- Header -->
        <header class="mb-8">
          <p class="font-sora text-[10px] text-primary/60 tracking-[0.2em] uppercase mb-2">Welcome back</p>
          <h1 class="font-serif text-4xl lg:text-5xl text-white mb-1">Library</h1>
          <p class="font-sora text-xs text-white/40">${songs.length} tracks in your collection</p>
        </header>

        <!-- Featured / Hero Section -->
        <section class="mb-12" id="featured-section">
          <h2 class="font-sora font-semibold text-lg text-white mb-5 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            Featured
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="featured-grid">
            ${featured.map(song => `
              <div class="featured-card premium-card p-4 cursor-pointer group" data-id="${song.id}">
                <div class="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-lg">
                  <img src="${song.cover}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="${song.title}" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div class="flex items-center gap-2 w-full">
                      <button class="size-10 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-lg glow-primary hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1">play_arrow</span>
                      </button>
                    </div>
                  </div>
                </div>
                <h3 class="font-sora font-semibold text-sm text-white truncate group-hover:text-primary transition-colors">${song.title}</h3>
                <p class="font-sora text-xs text-white/35 truncate mt-0.5">${song.artist}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Artists Section -->
        <section class="mb-12" id="artists-section">
          <h2 class="font-sora font-semibold text-lg text-white mb-5 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">groups</span>
            Artists
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5" id="artist-grid">
            ${this.renderArtistCards()}
          </div>
        </section>

        <!-- All Tracks -->
        <section id="tracks-section">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-sora font-semibold text-lg text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">library_music</span>
              All Tracks
            </h2>
            <button class="text-sm font-sora text-primary hover:text-white transition-colors flex items-center gap-1" id="btn-play-all">
              <span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1">play_arrow</span>
              Play All
            </button>
          </div>
          <div class="bg-surface rounded-xl border border-white/5 overflow-hidden">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="pl-6 pr-2 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25 w-12">#</th>
                  <th class="px-4 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25">Title</th>
                  <th class="px-4 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25 hidden lg:table-cell">Artist</th>
                  <th class="px-4 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25 text-right">Duration</th>
                  <th class="w-12"></th>
                </tr>
              </thead>
              <tbody id="track-list">
                ${trackRows}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    `;

    this.updateActiveSongState();

    // ===============================
    // 4. GSAP ANIMATIONS
    // ===============================

    // 1. The main header fades in with staggered children (title, subtitle, etc.)
    const header = this.container.querySelector('header');
    if (header) animateHeroText(header as HTMLElement);

    // 2. Featured cards animate in immediately
    const featuredCards = this.container.querySelectorAll('.featured-card');
    animateCards(featuredCards);

    // 3. Artist cards use ScrollTrigger — they animate when scrolled into view
    const artistCards = this.container.querySelectorAll('.artist-card');
    const mainContent = document.getElementById('main-content');
    animateCardsOnScroll(artistCards, mainContent || undefined);

    // 4. Track rows slide in from left with a slight delay
    const trackRowEls = this.container.querySelectorAll('.song-row');
    gsap.fromTo(trackRowEls,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.02, ease: 'power2.out', delay: 0.4 }
    );

    // 5. Setup hover glow effect on featured cards
    this.unsubscribeEvents.push(...animateCardHoverGlow(featuredCards));
  }

  // ===============================
  // 5. HELPER METHODS
  // ===============================

  private getFeaturedSongs() {
    // Pick diverse featured songs — one per unique artist, max 4
    const seen = new Set<string>();
    const featured = [];
    for (const song of songs) {
      if (!seen.has(song.artist)) {
        seen.add(song.artist);
        featured.push(song);
        if (featured.length >= 4) break;
      }
    }
    return featured;
  }

  private renderArtistCards(): string {
    const grouped = groupByArtist(songs);
    const artistNames = Object.keys(grouped);

    return artistNames.map(name => {
      const artistSongs = grouped[name];
      const artistData = getArtistByName(name);
      const cover = artistData?.profileImage || (artistSongs.length > 0 ? artistSongs[0].cover : '');

      return `
        <div class="artist-card group cursor-pointer" data-artist="${name}">
          <div class="premium-card p-4">
            <div class="aspect-square rounded-full overflow-hidden mb-4 border-2 border-white/5 group-hover:border-primary/30 transition-colors shadow-lg relative">
              <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                <span class="material-symbols-outlined text-3xl text-white drop-shadow-md" style="font-variation-settings: 'FILL' 1">play_circle</span>
              </div>
              <img src="${cover}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${name}" />
            </div>
            <h3 class="font-sora font-semibold text-sm text-white text-center truncate">${name}</h3>
            <p class="font-sora text-[10px] text-white/30 text-center mt-1 uppercase tracking-wider">${artistSongs.length} Tracks</p>
          </div>
        </div>
      `;
    }).join('');
  }

  private updateActiveSongState() {
    if (!this.container) return;
    const state = Store.getInstance().getState();
    const rows = this.container.querySelectorAll('.song-row');

    rows.forEach(row => {
      const id = parseInt(row.getAttribute('data-id') || '0', 10);
      const numCell = row.querySelector('td:first-child') as HTMLElement;
      const titleSpan = row.querySelector('.font-medium');

      if (id === state.currentSongId) {
        row.classList.add('!bg-primary/5');
        if (titleSpan) titleSpan.classList.add('!text-primary');
        if (numCell) {
          numCell.innerHTML = `
            <div class="flex items-end gap-[2px] h-3.5 justify-center">
              <div class="w-[3px] bg-primary rounded-full sound-bar" style="height: 100%"></div>
              <div class="w-[3px] bg-primary rounded-full sound-bar" style="height: 50%"></div>
              <div class="w-[3px] bg-primary rounded-full sound-bar" style="height: 75%"></div>
            </div>
          `;
        }
      } else {
        row.classList.remove('!bg-primary/5');
        if (titleSpan) titleSpan.classList.remove('!text-primary');
      }
    });

    // Update like button states
    const likeBtns = this.container.querySelectorAll('.btn-like');
    likeBtns.forEach(btn => {
      const id = parseInt((btn as HTMLElement).dataset.likeId || '0', 10);
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        const isLiked = Store.getInstance().isLiked(id);
        (icon as HTMLElement).style.fontVariationSettings = `'FILL' ${isLiked ? '1' : '0'}`;
        icon.classList.toggle('text-primary', isLiked);
      }
    });
  }

  // ===============================
  // 6. EVENT HANDLERS
  // ===============================

  /** Attach click listeners to all the buttons and rows we just drew */
  private attachEvents() {
    if (!this.container) return;

    // Track clicks
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

    // Like buttons
    const likeBtns = this.container.querySelectorAll('.btn-like');
    likeBtns.forEach(btn => {
      const handler = (e: Event) => {
        e.stopPropagation();
        const id = parseInt((btn as HTMLElement).dataset.likeId || '0', 10);
        if (id) {
          const isNowLiked = Store.getInstance().toggleLike(id);
          const icon = btn.querySelector('.material-symbols-outlined') as HTMLElement;
          if (icon) {
            // GSAP heart animation
            gsap.fromTo(icon, { scale: 1 }, {
              scale: isNowLiked ? 1.4 : 0.8,
              duration: 0.15,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to(icon, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.5)' });
              }
            });
          }
        }
      };
      btn.addEventListener('click', handler);
      this.unsubscribeEvents.push(() => btn.removeEventListener('click', handler));
    });

    // Featured card clicks
    const featuredCards = this.container.querySelectorAll('.featured-card');
    featuredCards.forEach(card => {
      const h = () => {
        const id = parseInt(card.getAttribute('data-id') || '0', 10);
        const song = songs.find(s => s.id === id);
        if (song) {
          Store.getInstance().setState({ currentSongId: id, isPlaying: true });
          AudioService.getInstance().loadTrack(song.src);
          AudioService.getInstance().play();
        }
      };
      card.addEventListener('click', h);
      this.unsubscribeEvents.push(() => card.removeEventListener('click', h));
    });

    // Play all
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

    // Artist card clicks
    const artistCards = this.container.querySelectorAll('.artist-card');
    artistCards.forEach(card => {
      const h = () => {
        const artistName = card.getAttribute('data-artist');
        if (artistName) {
          Router.getInstance().navigate('artist', { artistName });
        }
      };
      card.addEventListener('click', h);
      this.unsubscribeEvents.push(() => card.removeEventListener('click', h));
    });

    // Artist links in track rows
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
