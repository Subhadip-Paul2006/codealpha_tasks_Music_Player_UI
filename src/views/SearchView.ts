/**
 * ========================================================================
 * SEARCH VIEW
 * ========================================================================
 * 
 * The page where users can look for specific songs, artists, or genres.
 * It features a "debounced" search bar so it doesn't freeze the app
 * while typing fast.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { View } from '../types/View';
import { Store } from '../store/Store';
import { songs } from '../data/songs';
import { Song } from '../types/Song';
import { AudioService } from '../services/AudioService';
import { formatTime } from '../utils/formatTime';
import { Router } from '../utils/router';
import { animateTableRows, cleanupAnimations } from '../utils/animations';
import gsap from 'gsap';

// ===============================
// 2. COMPONENT CLASS
// ===============================

export class SearchView implements View {
    private container: HTMLElement | null = null;
    private unsubscribe: (() => void) | null = null;
    private unsubscribeEvents: (() => void)[] = [];
    private searchQuery: string = '';
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;

    mount(container: HTMLElement): void {
        this.container = container;
        this.render();
        this.attachEvents();

        this.unsubscribe = Store.getInstance().subscribe(() => {
            this.updateActiveSongState();
        });

        // Focus the search input automatically when page opens
        setTimeout(() => {
            const input = this.container?.querySelector('#search-input') as HTMLInputElement;
            if (input) input.focus();
        }, 100);

        // ===============================
        // 3. GSAP ANIMATIONS
        // ===============================
        // Animate the whole page sliding up into view
        if (this.container) {
            gsap.fromTo(this.container.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
            );
        }
    }

    destroy(): void {
        if (this.unsubscribe) this.unsubscribe();
        this.unsubscribeEvents.forEach(unsub => unsub());
        this.unsubscribeEvents = [];
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        if (this.container) {
            cleanupAnimations(this.container);
            this.container.innerHTML = '';
        }
    }

    // ===============================
    // 4. UI RENDERING & SEARCH LOGIC
    // ===============================

    /** Checks which songs match the text in the search box */
    private getFilteredSongs(): Song[] {
        if (!this.searchQuery.trim()) return [];
        const q = this.searchQuery.toLowerCase().trim();
        return songs.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.artist.toLowerCase().includes(q) ||
            s.album.toLowerCase().includes(q) ||
            (s.genre && s.genre.toLowerCase().includes(q))
        );
    }

    private render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="p-8 lg:p-12 max-w-[1200px] mx-auto pb-32">
                <!-- Header -->
                <header class="mb-8">
                    <h1 class="font-serif text-4xl lg:text-5xl text-white mb-1">Search</h1>
                    <p class="font-sora text-xs text-white/40 tracking-[0.2em] uppercase">Find your favorite tracks</p>
                </header>

                <!-- Search Input -->
                <div class="relative mb-10">
                    <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-white/30 text-xl pointer-events-none">search</span>
                    <input
                        type="text"
                        id="search-input"
                        placeholder="Search by song, artist, album, or genre..."
                        value="${this.escapeHtml(this.searchQuery)}"
                        class="w-full bg-surface border border-white/10 rounded-2xl pl-14 pr-14 py-4 text-white font-sora text-sm
                               placeholder:text-white/25 focus:outline-none focus:border-primary/40 focus:shadow-[0_0_20px_rgba(201,167,74,0.1)]
                               transition-all duration-300"
                        autocomplete="off"
                    />
                    ${this.searchQuery ? `
                        <button id="btn-clear-search" class="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                            <span class="material-symbols-outlined text-xl">close</span>
                        </button>
                    ` : ''}
                </div>

                <!-- Results -->
                <div id="search-results">
                    ${this.renderResults()}
                </div>
            </div>
        `;
    }

    private renderResults(): string {
        if (!this.searchQuery.trim()) {
            // Show browse categories / popular suggestions
            const genres = [...new Set(songs.map(s => s.genre).filter(Boolean))];
            return `
                <div class="mb-8">
                    <h2 class="font-sora font-semibold text-lg text-white mb-5">Browse by Genre</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" id="genre-grid">
                        ${genres.map((genre, i) => {
                const colors = ['from-amber-600/40 to-amber-900/20', 'from-violet-600/40 to-violet-900/20', 'from-emerald-600/40 to-emerald-900/20', 'from-rose-600/40 to-rose-900/20', 'from-sky-600/40 to-sky-900/20'];
                return `
                                <button class="genre-btn bg-gradient-to-br ${colors[i % colors.length]} rounded-xl p-6 text-left hover:scale-[1.03] active:scale-[0.98] transition-transform border border-white/5 cursor-pointer" data-genre="${genre}">
                                    <span class="font-sora font-bold text-white text-lg">${genre}</span>
                                    <p class="font-sora text-xs text-white/40 mt-1">${songs.filter(s => s.genre === genre).length} tracks</p>
                                </button>
                            `;
            }).join('')}
                    </div>
                </div>

                <div>
                    <h2 class="font-sora font-semibold text-lg text-white mb-5">All Tracks</h2>
                    <p class="font-sora text-sm text-white/30">Start typing to search across ${songs.length} tracks...</p>
                </div>
            `;
        }

        const results = this.getFilteredSongs();

        if (results.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center py-20 text-center">
                    <span class="material-symbols-outlined text-6xl text-white/10 mb-4">search_off</span>
                    <h3 class="font-sora text-lg text-white/50 mb-2">No results found</h3>
                    <p class="font-sora text-sm text-white/30">Try searching for a different song, artist, or album</p>
                </div>
            `;
        }

        const state = Store.getInstance().getState();

        const trackRows = results.map((song, i) => `
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
                            <span class="font-medium text-sm truncate ${state.currentSongId === song.id ? 'text-primary' : 'text-white'} group-hover:text-primary transition-colors">${this.highlightMatch(song.title)}</span>
                            <span class="text-xs text-white/35 truncate">${song.album}</span>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 text-white/40 text-sm hidden lg:table-cell">
                    <span class="artist-link cursor-pointer hover:underline hover:text-primary transition-colors" data-artist="${song.artist}">${this.highlightMatch(song.artist)}</span>
                </td>
                <td class="px-4 py-3 text-white/30 text-sm text-right pr-6 font-mono">${formatTime(song.duration || 0)}</td>
            </tr>
        `).join('');

        return `
            <p class="font-sora text-xs text-white/30 mb-4">${results.length} result${results.length !== 1 ? 's' : ''} for "${this.escapeHtml(this.searchQuery)}"</p>
            <div class="bg-surface rounded-xl border border-white/5 overflow-hidden">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-white/5">
                            <th class="pl-6 pr-2 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25 w-12">#</th>
                            <th class="px-4 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25">Title</th>
                            <th class="px-4 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25 hidden lg:table-cell">Artist</th>
                            <th class="px-4 py-3 text-[10px] font-sora uppercase tracking-widest text-white/25 text-right pr-6">Duration</th>
                        </tr>
                    </thead>
                    <tbody id="search-track-list">
                        ${trackRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    private highlightMatch(text: string): string {
        if (!this.searchQuery.trim()) return text;
        const q = this.searchQuery.trim();
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="text-primary font-semibold">$1</span>');
    }

    private escapeHtml(text: string): string {
        return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    private updateActiveSongState() {
        if (!this.container) return;
        const state = Store.getInstance().getState();
        const rows = this.container.querySelectorAll('.song-row');

        rows.forEach(row => {
            const id = parseInt(row.getAttribute('data-id') || '0', 10);
            const titleSpan = row.querySelector('.font-medium');
            if (id === state.currentSongId) {
                row.classList.add('!bg-primary/5');
                if (titleSpan) titleSpan.classList.add('text-primary');
            } else {
                row.classList.remove('!bg-primary/5');
                if (titleSpan) titleSpan.classList.remove('text-primary');
            }
        });
    }

    private updateResults() {
        if (!this.container) return;
        const resultsDiv = this.container.querySelector('#search-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = this.renderResults();
            this.attachResultEvents();

            // Animate new results
            const rows = resultsDiv.querySelectorAll('.song-row');
            if (rows.length > 0) {
                animateTableRows(rows);
            }
        }
    }

    // ===============================
    // 5. EVENT HANDLERS
    // ===============================

    private attachEvents() {
        if (!this.container) return;

        // Search input
        const input = this.container.querySelector('#search-input') as HTMLInputElement;
        if (input) {
            const handler = () => {
                this.searchQuery = input.value;
                // Debounce
                if (this.debounceTimer) clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.updateResults();
                    // Update clear button visibility
                    const clearBtn = this.container?.querySelector('#btn-clear-search');
                    if (this.searchQuery && !clearBtn) {
                        // Inject clear button
                        const inputWrapper = input.parentElement;
                        if (inputWrapper) {
                            const btn = document.createElement('button');
                            btn.id = 'btn-clear-search';
                            btn.className = 'absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors';
                            btn.innerHTML = '<span class="material-symbols-outlined text-xl">close</span>';
                            btn.addEventListener('click', () => {
                                this.searchQuery = '';
                                input.value = '';
                                this.updateResults();
                                btn.remove();
                                input.focus();
                            });
                            inputWrapper.appendChild(btn);
                        }
                    } else if (!this.searchQuery && clearBtn) {
                        clearBtn.remove();
                    }
                }, 200);
            };
            input.addEventListener('input', handler);
            this.unsubscribeEvents.push(() => input.removeEventListener('input', handler));
        }

        // Clear button (if query exists on mount)
        const clearBtn = this.container.querySelector('#btn-clear-search');
        if (clearBtn) {
            const handler = () => {
                this.searchQuery = '';
                if (input) input.value = '';
                this.updateResults();
                clearBtn.remove();
                input?.focus();
            };
            clearBtn.addEventListener('click', handler);
            this.unsubscribeEvents.push(() => clearBtn.removeEventListener('click', handler));
        }

        this.attachResultEvents();
    }

    private attachResultEvents() {
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

        // Genre buttons
        const genreBtns = this.container.querySelectorAll('.genre-btn');
        genreBtns.forEach(btn => {
            const handler = () => {
                const genre = (btn as HTMLElement).dataset.genre || '';
                this.searchQuery = genre;
                const input = this.container?.querySelector('#search-input') as HTMLInputElement;
                if (input) input.value = genre;
                this.updateResults();
            };
            btn.addEventListener('click', handler);
            this.unsubscribeEvents.push(() => btn.removeEventListener('click', handler));
        });

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
