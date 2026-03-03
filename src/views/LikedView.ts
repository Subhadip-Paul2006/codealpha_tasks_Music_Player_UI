import { View } from '../types/View';
import { Store } from '../store/Store';
import { songs } from '../data/songs';
import { AudioService } from '../services/AudioService';
import { formatTime } from '../utils/formatTime';
import { Router } from '../utils/router';
import { animateTableRows, hoverScale, cleanupAnimations } from '../utils/animations';
import gsap from 'gsap';

export class LikedView implements View {
    private container: HTMLElement | null = null;
    private unsubscribe: (() => void) | null = null;
    private unsubscribeEvents: (() => void)[] = [];

    mount(container: HTMLElement): void {
        this.container = container;
        this.render();

        this.unsubscribe = Store.getInstance().subscribe(() => {
            this.render();
        });
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

    private render() {
        if (!this.container) return;

        // Clean up previous event listeners
        this.unsubscribeEvents.forEach(unsub => unsub());
        this.unsubscribeEvents = [];

        const store = Store.getInstance();
        const likedIds = store.getState().likedSongIds;
        const likedSongs = songs.filter(s => likedIds.includes(s.id));
        const state = store.getState();

        if (likedSongs.length === 0) {
            this.container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-8">
                    <div class="size-28 rounded-full bg-surface-light flex items-center justify-center mb-8">
                        <span class="material-symbols-outlined text-5xl text-white/15" style="font-variation-settings: 'FILL' 1">favorite</span>
                    </div>
                    <h2 class="font-serif text-3xl text-white mb-3">No Liked Songs Yet</h2>
                    <p class="font-sora text-sm text-white/40 max-w-sm leading-relaxed">
                        Songs you like will appear here. Click the heart icon on any track to start building your collection.
                    </p>
                </div>
            `;
            // Animate empty state
            const emptyState = this.container.querySelector('div');
            if (emptyState) {
                gsap.fromTo(emptyState, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
            }
            return;
        }

        const totalDuration = likedSongs.reduce((acc, s) => acc + (s.duration || 0), 0);

        const trackRows = likedSongs.map((song, i) => `
            <tr class="group hover:bg-white/[0.04] transition-all duration-200 cursor-pointer song-row" data-id="${song.id}">
                <td class="pl-6 pr-2 py-3 w-12 text-white/30 group-hover:text-white/70 text-sm font-mono">
                    <div class="relative flex items-center justify-center">
                        ${state.currentSongId === song.id ? `
                            <div class="flex items-end gap-[2px] h-3.5 justify-center">
                                <div class="w-[3px] bg-primary rounded-full sound-bar" style="height: 100%"></div>
                                <div class="w-[3px] bg-primary rounded-full sound-bar" style="height: 50%"></div>
                                <div class="w-[3px] bg-primary rounded-full sound-bar" style="height: 75%"></div>
                            </div>
                        ` : `
                            <span class="group-hover:hidden">${(i + 1).toString().padStart(2, '0')}</span>
                            <span class="material-symbols-outlined hidden group-hover:block text-primary text-lg">play_arrow</span>
                        `}
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <img src="${song.cover}" class="size-10 rounded object-cover flex-shrink-0 bg-surface-light shadow" alt="${song.title}" />
                        <div class="flex flex-col min-w-0">
                            <span class="font-medium text-sm truncate ${state.currentSongId === song.id ? 'text-primary' : 'text-white'} group-hover:text-primary transition-colors">${song.title}</span>
                            <span class="text-xs text-white/35 truncate">${song.album}</span>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 text-white/40 text-sm hidden lg:table-cell">
                  <span class="artist-link cursor-pointer hover:underline hover:text-primary transition-colors" data-artist="${song.artist}">${song.artist}</span>
                </td>
                <td class="px-4 py-3 text-white/30 text-sm text-right font-mono">${formatTime(song.duration || 0)}</td>
                <td class="px-2 py-3 w-12">
                    <button class="btn-unlike text-primary/60 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100" data-unlike-id="${song.id}" title="Remove from Liked">
                        <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1">heart_minus</span>
                    </button>
                </td>
            </tr>
        `).join('');

        this.container.innerHTML = `
            <div class="p-8 lg:p-12 max-w-[1200px] mx-auto pb-32">
                <!-- Header -->
                <header class="mb-10 flex items-end gap-6">
                    <div class="size-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center shadow-lg glow-primary">
                        <span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1">favorite</span>
                    </div>
                    <div>
                        <p class="font-sora text-[10px] text-primary/60 tracking-[0.2em] uppercase mb-1">Collection</p>
                        <h1 class="font-serif text-4xl lg:text-5xl text-white mb-1">Liked Songs</h1>
                        <p class="font-sora text-xs text-white/40">${likedSongs.length} songs • ${formatTime(totalDuration)} total</p>
                    </div>
                </header>

                <!-- Actions -->
                <div class="flex items-center gap-3 mb-8">
                    <button class="h-12 px-7 rounded-full bg-primary text-background-dark font-sora font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform glow-primary" id="btn-play-liked">
                        <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1">play_arrow</span> Play All
                    </button>
                    <button class="h-12 px-7 rounded-full border border-white/15 text-white font-sora font-semibold text-sm flex items-center gap-2 hover:border-white/30 hover:bg-white/5 transition-all" id="btn-shuffle-liked">
                        <span class="material-symbols-outlined text-lg">shuffle</span> Shuffle
                    </button>
                </div>

                <!-- Track List -->
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
                        <tbody id="liked-track-list">
                            ${trackRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.attachEvents();

        // Animate track rows
        const rows = this.container.querySelectorAll('.song-row');
        animateTableRows(rows);
    }

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

        // Unlike buttons
        const unlikeBtns = this.container.querySelectorAll('.btn-unlike');
        unlikeBtns.forEach(btn => {
            const handler = (e: Event) => {
                e.stopPropagation();
                const id = parseInt((btn as HTMLElement).dataset.unlikeId || '0', 10);
                if (id) {
                    const row = btn.closest('.song-row') as HTMLElement;
                    if (row) {
                        gsap.to(row, {
                            opacity: 0, x: -20, height: 0, paddingTop: 0, paddingBottom: 0,
                            duration: 0.3, ease: 'power2.in',
                            onComplete: () => { Store.getInstance().toggleLike(id); }
                        });
                    } else {
                        Store.getInstance().toggleLike(id);
                    }
                }
            };
            btn.addEventListener('click', handler);
            this.unsubscribeEvents.push(() => btn.removeEventListener('click', handler));
        });

        // Play all
        const playAll = this.container.querySelector('#btn-play-liked');
        if (playAll) {
            const store = Store.getInstance();
            const likedIds = store.getState().likedSongIds;
            const likedSongs = songs.filter(s => likedIds.includes(s.id));
            const h = () => {
                if (likedSongs.length > 0) {
                    store.setState({ currentSongId: likedSongs[0].id, isPlaying: true });
                    AudioService.getInstance().loadTrack(likedSongs[0].src);
                    AudioService.getInstance().play();
                }
            };
            playAll.addEventListener('click', h);
            this.unsubscribeEvents.push(() => playAll.removeEventListener('click', h));
        }

        // Shuffle
        const shuffleBtn = this.container.querySelector('#btn-shuffle-liked');
        if (shuffleBtn) {
            const store = Store.getInstance();
            const likedIds = store.getState().likedSongIds;
            const likedSongs = songs.filter(s => likedIds.includes(s.id));
            const h = () => {
                if (likedSongs.length > 0) {
                    const rand = likedSongs[Math.floor(Math.random() * likedSongs.length)];
                    store.setState({ currentSongId: rand.id, isPlaying: true });
                    AudioService.getInstance().loadTrack(rand.src);
                    AudioService.getInstance().play();
                }
            };
            shuffleBtn.addEventListener('click', h);
            this.unsubscribeEvents.push(() => shuffleBtn.removeEventListener('click', h));
        }

        // Hover scale on action buttons
        const actionBtns = this.container.querySelectorAll('#btn-play-liked, #btn-shuffle-liked');
        this.unsubscribeEvents.push(...hoverScale(actionBtns, 1.05));

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
