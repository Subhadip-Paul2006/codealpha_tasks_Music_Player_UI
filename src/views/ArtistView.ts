/**
 * ========================================================================
 * ARTIST VIEW (DYNAMIC PAGE)
 * ========================================================================
 * 
 * This page changes dynamically depending on WHICH artist you clicked.
 * It reads the URL parameters (or routing payload) to figure out the 
 * `artistSlug`, then grabs that artist's specific data from `artists.ts`.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { View } from '../types/View';
import { Store } from '../store/Store';
import { Song } from '../types/Song';
import { songs } from '../data/songs';
import { formatTime } from '../utils/formatTime';
import { AudioService } from '../services/AudioService';
import { artists, generateSlug } from '../data/artists';
import { Artist } from '../types/Artist';
import gsap from 'gsap';

// ===============================
// 2. COMPONENT CLASS
// ===============================
export class ArtistView implements View {
  private container: HTMLElement | null = null;
  private unsubscribeEvents: (() => void)[] = [];
  private unsubscribeStore: (() => void) | null = null;
  private artistSongs: Song[] = [];
  private artistSlug: string = '';
  private currentArtist: Artist | null = null;

  async mount(container: HTMLElement, params?: any): Promise<void> {
    this.container = container;

    // Resolve artist from params (we might be passed { artistName: 'Arijit Singh' } or { id: 'arijit-singh' })
    const inputName = params?.artistName || params?.id || '';
    this.artistSlug = generateSlug(inputName);
    this.currentArtist = artists.find(a => a.id === this.artistSlug) || null;

    if (!this.currentArtist) {
      this.render404(inputName);
      return;
    }

    // Dynamic song linking: filter songs where artist name matches exactly
    this.artistSongs = songs.filter(s => s.artist.toLowerCase() === this.currentArtist!.name.toLowerCase());

    this.render();
    this.updateActiveSongState();
    this.attachEvents();

    this.unsubscribeStore = Store.getInstance().subscribe(() => {
      this.updateActiveSongState();
    });
  }

  destroy(): void {
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.unsubscribeEvents.forEach(unsub => unsub());
    this.unsubscribeEvents = [];

    // Animation cleanup
    if (this.container) {
      gsap.killTweensOf(this.container.children);
      const allDescendants = this.container.querySelectorAll('*');
      if (allDescendants.length > 0) gsap.killTweensOf(allDescendants);
      this.container.innerHTML = '';
    }
    this.container = null;
  }

  // ===============================
  // 3. UI RENDERING & 404 FALLBACK
  // ===============================

  /** Renders an error page if the artist slug is not found in artists.ts */
  private render404(inputName: string) {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center font-sora p-8 text-center animate-fade-in">
        <span class="material-symbols-outlined text-6xl text-white/20 mb-6">person_off</span>
        <h1 class="font-serif text-4xl text-white mb-4 shadow-sm text-glow">Artist Not Found</h1>
        <p class="text-white/50 text-base max-w-md mx-auto mb-8">We couldn't find a page for "${inputName}". The artist profile might not be created yet.</p>
        <button id="btn-back-404" class="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 border border-white/5">
          Go Back
        </button>
      </div>
    `;

    const backBtn = this.container.querySelector('#btn-back-404');
    if (backBtn) {
      const h = () => history.back();
      backBtn.addEventListener('click', h);
      this.unsubscribeEvents.push(() => backBtn.removeEventListener('click', h));
    }
  }

  /** Builds the massive HTML string for the actual artist profile */
  private render() {
    if (!this.container || !this.currentArtist) return;

    const artist = this.currentArtist;
    const bannerImg = artist.bannerImage || 'https://images.unsplash.com/photo-1516280440504-7c7d420689b0?auto=format&fit=crop&w=2070&q=80';
    const profileImg = artist.profileImage || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80';

    // Popular Songs (Top 5)
    const topSongs = this.artistSongs.slice(0, 5);
    const trackRows = topSongs.map((song, i) => `
      <tr class="group hover:bg-white/5 transition-colors duration-300 cursor-pointer song-row" data-id="${song.id}">
        <td class="pl-6 py-4 w-12 text-white/40 group-hover:text-white/80 font-mono text-sm">
          <div class="relative flex items-center justify-center w-5 h-5">
            <span class="group-hover:hidden num-display">${(i + 1).toString().padStart(2, '0')}</span>
            <span class="material-symbols-outlined hidden group-hover:block text-primary text-xl absolute">play_arrow</span>
          </div>
        </td>
        <td class="px-4 py-4">
          <div class="flex items-center gap-4">
            <img src="${song.cover}" class="size-12 rounded object-cover shadow-md" alt="${song.title}" />
            <span class="font-medium text-white group-hover:text-primary transition-colors title-display">${song.title}</span>
          </div>
        </td>
        <td class="px-4 py-4 text-white/40 text-sm hidden sm:table-cell">${song.album}</td>
        <td class="pr-6 py-4 text-white/40 text-sm text-right font-mono">${formatTime(song.duration || 0)}</td>
      </tr>
    `).join('');

    // Albums (Extract unique albums from songs)
    const uniqueAlbums = Array.from(new Set(this.artistSongs.map(s => s.album)));
    const albumCards = uniqueAlbums.map(albumName => {
      const albumSongs = this.artistSongs.filter(s => s.album === albumName);
      const cover = albumSongs.length > 0 ? albumSongs[0].cover : '';
      const year = albumSongs.length > 0 ? albumSongs[0].year : 'Unknown';
      return `
        <div class="glass-strong rounded-2xl overflow-hidden group cursor-pointer border border-white/5 transition-all duration-500 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
          <div class="aspect-square overflow-hidden relative">
            <img src="${cover}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt="${albumName}" />
            <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>
          <div class="p-5">
            <h3 class="font-sora font-semibold text-white truncate group-hover:text-primary transition-colors">${albumName}</h3>
            <p class="font-sora text-sm text-white/40 mt-1">${year} • Album</p>
          </div>
        </div>
      `;
    }).join('');

    // Genres & Socials
    const genresHtml = artist.genres ? artist.genres.map(g => `<span class="px-3 py-1 rounded-full border border-white/10 text-white/60 text-xs tracking-wider uppercase">${g}</span>`).join('') : '';
    const socialsHtml = artist.socials ? Object.entries(artist.socials).map(([platform, link]) => `
        <a href="${link}" target="_blank" class="size-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all hover:-translate-y-1 shadow-lg">
            <span class="material-symbols-outlined text-xl">${platform === 'website' ? 'language' : 'link'}</span>
        </a>
    `).join('') : '';

    this.container.innerHTML = `
      <div class="pb-32 min-h-[100vh] bg-background-dark font-sora">
        
        <!-- Hero Banner (Full width container) -->
        <div class="relative h-[45vh] min-h-[400px] w-full overflow-hidden artist-hero-bg">
          <img src="${bannerImg}" class="absolute inset-0 w-full h-full object-cover scale-105" id="artist-banner" alt="Banner" />
          <div class="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/40 to-transparent"></div>
        </div>

        <!-- Main Content Envelope -->
        <div class="max-w-[1400px] mx-auto px-6 lg:px-12 -mt-32 relative z-10 artist-content" id="artist-content-wrapper">
          
          <!-- Profile & Stats Row -->
          <div class="flex flex-col md:flex-row items-end md:items-center gap-8 mb-16 relative z-20">
            <div class="relative group z-20">
                <img src="${profileImg}" class="size-48 md:size-64 rounded-full object-cover border-4 border-[#0F0F12] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.02]" id="artist-avatar" alt="${artist.name}" />
                <div class="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] pointer-events-none"></div>
            </div>
            
            <div class="flex-1 w-full" id="artist-info-block">
              <div class="flex items-center gap-3 mb-3">
                <span class="material-symbols-outlined text-blue-400 text-2xl" style="font-variation-settings: 'FILL' 1">verified</span>
                <span class="text-xs uppercase tracking-[0.2em] text-white/60 font-semibold">Verified Artist</span>
              </div>
              <h1 class="font-serif text-5xl md:text-7xl text-white font-bold mb-4 tracking-tight drop-shadow-xl text-glow">${artist.name}</h1>
              <p class="text-xl text-primary/80 font-medium mb-6">${artist.tagline || 'Artist'}</p>
              
              <div class="flex items-center gap-6 flex-wrap">
                <button id="btn-follow" class="px-8 py-3 rounded-full bg-primary text-[#0F0F12] font-bold text-sm hover:scale-105 hover:bg-primary/90 transition-all glow-primary-intense">
                  Follow
                </button>
                <div class="flex gap-6">
                  <div class="flex flex-col">
                    <span class="text-white font-semibold text-lg">${(artist.monthlyListeners || 0).toLocaleString()}</span>
                    <span class="text-white/40 text-xs uppercase tracking-wider">Monthly Listeners</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-white font-semibold text-lg">${this.artistSongs.length}</span>
                    <span class="text-white/40 text-xs uppercase tracking-wider">Total Tracks</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Grid Layout for Content -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <!-- Left Column: Popular & Albums -->
            <div class="lg:col-span-8 space-y-16">
                <!-- Popular Songs Section -->
                <div class="artist-section">
                    <h2 class="font-sora font-bold text-2xl text-white mb-6 flex items-center gap-3">
                        Popular
                    </h2>
                    ${trackRows ? `
                        <div class="glass flex flex-col rounded-2xl overflow-hidden border border-white/5">
                            <table class="w-full text-left">
                                <tbody id="popular-tracks">
                                    ${trackRows}
                                </tbody>
                            </table>
                        </div>
                    ` : `<p class="text-white/40">No tracks available.</p>`}
                </div>

                <!-- Albums Section -->
                ${albumCards ? `
                    <div class="artist-section">
                        <h2 class="font-sora font-bold text-2xl text-white mb-6 flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary">album</span> Discography
                        </h2>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            ${albumCards}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- Right Column: About -->
            <div class="lg:col-span-4 space-y-8 artist-section">
                <h2 class="font-sora font-bold text-2xl text-white mb-6">About</h2>
                
                <div class="glass-strong rounded-3xl p-8 relative overflow-hidden group border border-white/5 transition-all duration-500 hover:border-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <div class="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700"></div>
                    
                    <div class="relative z-10">
                        ${genresHtml ? `<div class="flex flex-wrap gap-2 mb-6">${genresHtml}</div>` : ''}
                        
                        <div class="font-sora text-sm text-white/70 leading-relaxed overflow-hidden relative transition-all duration-300" id="bio-container" style="max-height: 140px;">
                            <p id="artist-bio-text">${artist.bio || 'No biography available.'}</p>
                            <div class="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#141416] to-transparent pointer-events-none" id="bio-gradient"></div>
                        </div>
                        
                        ${artist.bio && artist.bio.length > 150 ? `
                            <button class="text-primary font-sora text-sm font-semibold hover:text-primary/70 transition-colors mt-4" id="btn-read-more">Read More</button>
                        ` : ''}

                        ${socialsHtml ? `
                            <div class="mt-8 pt-6 border-t border-white/10 flex gap-4">
                                ${socialsHtml}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    `;

    // ===============================
    // 4. GSAP TIMELINE ANIMATIONS
    // ===============================

    // A "Timeline" lets us chain animations together in sequence.
    // Instead of everything popping in at once, we use `delay` multipliers (0, 0.2, 0.3)
    // to make the banner fade in FIRST, then the content, then the avatar bounces in.
    const tl = gsap.timeline();
    const banner = this.container.querySelector('#artist-banner');
    const contentWrap = this.container.querySelector('#artist-content-wrapper');
    const avatar = this.container.querySelector('#artist-avatar');
    const infoBlock = this.container.querySelector('#artist-info-block');
    const sections = this.container.querySelectorAll('.artist-section');

    if (banner) {
      tl.fromTo(banner, { scale: 1.15, opacity: 0 }, { scale: 1.05, opacity: 1, duration: 1.2, ease: 'power3.out' }, 0);
    }
    if (contentWrap) {
      tl.fromTo(contentWrap, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.2);
    }
    if (avatar) {
      tl.fromTo(avatar, { scale: 0.8, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.5)' }, 0.3);
    }
    if (infoBlock) {
      tl.fromTo(infoBlock.children, { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, 0.4);
    }
    if (sections.length > 0) {
      tl.fromTo(sections, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out' }, 0.6);
    }
  }

  // ===============================
  // 5. STATE SYNC
  // ===============================
  private updateActiveSongState() {
    if (!this.container || !this.currentArtist) return;
    const state = Store.getInstance().getState();
    const rows = this.container.querySelectorAll('.song-row');

    rows.forEach(row => {
      const id = parseInt(row.getAttribute('data-id') || '0', 10);
      const isPlayingCurrent = id === state.currentSongId && state.isPlaying;

      if (id === state.currentSongId) {
        row.classList.add('bg-white/10', 'border-l-2', 'border-primary');
        const numCell = row.querySelector('.num-display') as HTMLElement;
        const playIcon = row.querySelector('.material-symbols-outlined') as HTMLElement;
        const titleSpan = row.querySelector('.title-display') as HTMLElement;

        if (titleSpan) titleSpan.classList.add('text-primary');

        if (numCell && playIcon) {
          numCell.classList.add('hidden');
          playIcon.classList.remove('hidden');
          if (isPlayingCurrent) {
            playIcon.innerText = 'pause';
            playIcon.classList.add('animate-pulse');
          } else {
            playIcon.innerText = 'play_arrow';
            playIcon.classList.remove('animate-pulse');
          }
        }
      } else {
        row.classList.remove('bg-white/10', 'border-l-2', 'border-primary');
        const numCell = row.querySelector('.num-display') as HTMLElement;
        const playIcon = row.querySelector('.material-symbols-outlined') as HTMLElement;
        const titleSpan = row.querySelector('.title-display') as HTMLElement;

        if (titleSpan) titleSpan.classList.remove('text-primary');

        if (numCell && playIcon) {
          numCell.classList.remove('hidden');
          if (!row.matches(':hover')) {
            playIcon.classList.add('hidden');
          }
          playIcon.innerText = 'play_arrow';
          playIcon.classList.remove('animate-pulse');
        }
      }
    });
  }

  // ===============================
  // 6. EVENT HANDLERS
  // ===============================
  private attachEvents() {
    if (!this.container || !this.currentArtist) return;

    // Track clicks
    const rows = this.container.querySelectorAll('.song-row');
    rows.forEach(row => {
      const h = () => {
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
      row.addEventListener('click', h);
      this.unsubscribeEvents.push(() => row.removeEventListener('click', h));
    });

    // Follow Button interaction
    const followBtn = this.container.querySelector('#btn-follow');
    if (followBtn) {
      let isFollowing = false;
      const h = () => {
        isFollowing = !isFollowing;
        if (isFollowing) {
          followBtn.classList.replace('bg-primary', 'bg-white/10');
          followBtn.classList.replace('text-[#0F0F12]', 'text-white');
          followBtn.classList.remove('glow-primary-intense');
          followBtn.innerHTML = 'Following';
        } else {
          followBtn.classList.replace('bg-white/10', 'bg-primary');
          followBtn.classList.replace('text-white', 'text-[#0F0F12]');
          followBtn.classList.add('glow-primary-intense');
          followBtn.innerHTML = 'Follow';
        }
        // Micro-pop animation
        gsap.fromTo(followBtn, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      };
      followBtn.addEventListener('click', h);
      this.unsubscribeEvents.push(() => followBtn.removeEventListener('click', h));
    }

    // Read More toggle
    const readMoreBtn = this.container.querySelector('#btn-read-more');
    const bioContainer = this.container.querySelector('#bio-container') as HTMLElement;
    const bioGradient = this.container.querySelector('#bio-gradient') as HTMLElement;

    if (readMoreBtn && bioContainer && bioGradient) {
      let isExpanded = false;
      const h = () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
          bioContainer.style.maxHeight = '1000px';
          bioGradient.style.opacity = '0';
          readMoreBtn.textContent = 'Show Less';
        } else {
          bioContainer.style.maxHeight = '140px';
          bioGradient.style.opacity = '1';
          readMoreBtn.textContent = 'Read More';
        }
      };
      readMoreBtn.addEventListener('click', h);
      this.unsubscribeEvents.push(() => readMoreBtn.removeEventListener('click', h));
    }
  }
}
