/**
 * ========================================================================
 * PLAYER BAR COMPONENT
 * ========================================================================
 * 
 * This is the permanent audio player at the bottom of the screen.
 * It is responsible for telling the `AudioService` to play/pause music,
 * and it listens to the `Store` to visually update the progress bar.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { Store } from '../store/Store';
import { AudioService } from '../services/AudioService';
import { formatTime } from '../utils/formatTime';
import { songs } from '../data/songs';
import { Router } from '../utils/router';
import gsap from 'gsap';

// ===============================
// 2. COMPONENT CLASS
// ===============================
export class PlayerBar {
    private container: HTMLElement;
    private unsubscribe: (() => void) | null = null;
    private progressDragging = false;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    mount() {
        this.render();
        this.attachEvents();
        this.unsubscribe = Store.getInstance().subscribe(() => this.updateUI());
    }

    destroy() {
        if (this.unsubscribe) this.unsubscribe();
    }

    // ===============================
    // 3. UI RENDERING
    // ===============================

    /** Draws the initial Player HTML shell */
    private render() {
        const state = Store.getInstance().getState();
        const song = songs.find(s => s.id === state.currentSongId);
        const isLiked = song ? Store.getInstance().isLiked(song.id) : false;

        this.container.innerHTML = `
            <div class="h-full px-5 flex items-center gap-4 font-sora relative">

                <!-- Ambient glow when playing -->
                <div class="absolute inset-0 pointer-events-none transition-opacity duration-700 ${state.isPlaying ? 'opacity-100' : 'opacity-0'}" id="player-glow"
                     style="background: linear-gradient(to right, rgba(201,167,74,0.03), transparent 30%, transparent 70%, rgba(201,167,74,0.03))"></div>

                <!-- Track Info -->
                <div class="flex items-center gap-3 w-[280px] min-w-[200px] cursor-pointer group relative z-10" id="btn-now-playing">
                    <div class="size-12 bg-surface-light rounded-lg overflow-hidden flex-shrink-0 shadow-lg ${state.isPlaying ? 'ring-1 ring-primary/20' : ''}">
                        ${song ? `<img src="${song.cover}" alt="cover" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex items-center justify-center"><span class="material-symbols-outlined text-white/20 text-xl">music_note</span></div>`}
                    </div>
                    <div class="flex flex-col min-w-0 flex-1">
                        <span class="text-sm font-medium truncate ${song ? 'text-white' : 'text-white/30'}">${song ? song.title : 'No track'}</span>
                        <span class="text-xs text-white/40 truncate artist-link hover:underline hover:text-primary transition-colors inline-block w-max pointer-events-auto" data-artist="${song ? song.artist : ''}">${song ? song.artist : 'selected'}</span>
                    </div>
                    ${song ? `
                        <button class="btn-like-player transition-colors flex-shrink-0 p-1 ${isLiked ? 'text-primary' : 'text-white/20 hover:text-primary'}" id="btn-like-player">
                            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' ${isLiked ? '1' : '0'}">favorite</span>
                        </button>
                    ` : ''}
                </div>

                <!-- Center Controls -->
                <div class="flex flex-col items-center flex-1 max-w-[580px] mx-auto relative z-10">
                    <div class="flex items-center gap-5 mb-1.5">
                        <button class="text-white/30 hover:text-white transition-colors" id="btn-prev">
                            <span class="material-symbols-outlined text-[22px]">skip_previous</span>
                        </button>
                        <button class="size-9 rounded-full bg-primary flex items-center justify-center text-background-dark hover:scale-105 active:scale-95 transition-transform ${state.isPlaying ? 'glow-primary' : ''}" id="btn-play">
                            <span class="material-symbols-outlined text-xl" id="icon-play" style="font-variation-settings: 'FILL' 1">${state.isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button class="text-white/30 hover:text-white transition-colors" id="btn-next">
                            <span class="material-symbols-outlined text-[22px]">skip_next</span>
                        </button>
                    </div>

                    <div class="flex items-center w-full gap-2.5 text-[10px] text-white/30 font-mono">
                        <span id="time-current" class="w-8 text-right">00:00</span>
                        <div class="relative h-1 flex-1 bg-white/10 rounded-full group cursor-pointer" id="progress-container">
                            <div class="absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none transition-[width]" id="progress-bar" style="width: 0%"></div>
                            <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" id="progress-thumb" style="left: 0%"></div>
                        </div>
                        <span id="time-total" class="w-8">${song?.duration ? formatTime(song.duration) : '00:00'}</span>
                    </div>
                </div>

                <!-- Volume -->
                <div class="flex items-center gap-2 w-[160px] justify-end relative z-10">
                    <button class="text-white/30 hover:text-white transition-colors" id="btn-volume-icon">
                        <span class="material-symbols-outlined text-[18px]">volume_up</span>
                    </button>
                    <div class="relative h-1 w-24 bg-white/10 rounded-full group cursor-pointer" id="volume-container">
                        <div class="absolute top-0 left-0 h-full bg-primary/70 rounded-full pointer-events-none group-hover:bg-primary transition-colors" id="volume-bar" style="width: ${(state.volume ?? 1) * 100}%"></div>
                        <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 pointer-events-none" id="volume-thumb" style="left: ${(state.volume ?? 1) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===============================
    // 4. STATE SYNC LOOP
    // ===============================

    /** 
     * Runs continually. Every time the Store state changes (like the song moves forward 1 second),
     * this function updates the visible progress bars and text WITHOUT redrawing the whole HTML.
     */
    private updateUI() {
        const state = Store.getInstance().getState();
        const song = songs.find(s => s.id === state.currentSongId);

        // Play icon
        const iconPlay = this.container.querySelector('#icon-play');
        if (iconPlay) iconPlay.textContent = state.isPlaying ? 'pause' : 'play_arrow';

        // Play button glow
        const playBtn = this.container.querySelector('#btn-play');
        if (playBtn) {
            playBtn.classList.toggle('glow-primary', state.isPlaying);
        }

        // Ambient glow
        const glow = this.container.querySelector('#player-glow') as HTMLElement;
        if (glow) {
            glow.classList.toggle('opacity-100', state.isPlaying);
            glow.classList.toggle('opacity-0', !state.isPlaying);
        }

        // Progress
        const audio = AudioService.getInstance();
        if (!this.progressDragging && audio.getDuration() > 0) {
            const pct = (audio.getCurrentTime() / audio.getDuration()) * 100;
            const bar = this.container.querySelector('#progress-bar') as HTMLElement;
            const thumb = this.container.querySelector('#progress-thumb') as HTMLElement;
            const timeCurrent = this.container.querySelector('#time-current');
            if (bar) bar.style.width = pct + '%';
            if (thumb) thumb.style.left = pct + '%';
            if (timeCurrent) timeCurrent.textContent = formatTime(audio.getCurrentTime());
        }

        // Total time
        const timeTotal = this.container.querySelector('#time-total');
        if (timeTotal && song?.duration) timeTotal.textContent = formatTime(song.duration);

        // Track info
        const coverEl = this.container.querySelector('#btn-now-playing img') as HTMLImageElement;
        const titleEl = this.container.querySelector('#btn-now-playing .text-sm');
        const artistEl = this.container.querySelector('#btn-now-playing .text-xs');
        if (song) {
            if (coverEl) coverEl.src = song.cover;
            if (titleEl) { titleEl.textContent = song.title; titleEl.classList.remove('text-white/30'); titleEl.classList.add('text-white'); }
            if (artistEl) {
                artistEl.textContent = song.artist;
                artistEl.setAttribute('data-artist', song.artist);
            }
        }

        // Like button state
        const likeBtn = this.container.querySelector('#btn-like-player');
        if (likeBtn && song) {
            const isLiked = Store.getInstance().isLiked(song.id);
            const icon = likeBtn.querySelector('.material-symbols-outlined') as HTMLElement;
            if (icon) {
                (icon as HTMLElement).style.fontVariationSettings = `"FILL" ${isLiked ? '1' : '0'}`;
                likeBtn.classList.toggle('text-primary', isLiked);
                likeBtn.classList.toggle('text-white/20', !isLiked);
            }
        }

        // Cover ring when playing
        const coverContainer = this.container.querySelector('#btn-now-playing > div:first-child');
        if (coverContainer) {
            coverContainer.classList.toggle('ring-1', state.isPlaying);
            coverContainer.classList.toggle('ring-primary/20', state.isPlaying);
        }
    }

    // ===============================
    // 5. EVENT HANDLERS
    // ===============================

    /** Hooks up all the buttons inside the player to actual logical functions */
    private attachEvents() {
        const audio = AudioService.getInstance();

        // Play/pause
        this.container.querySelector('#btn-play')?.addEventListener('click', () => audio.togglePlay());

        // Prev/Next
        this.container.querySelector('#btn-prev')?.addEventListener('click', () => {
            const state = Store.getInstance().getState();
            const idx = songs.findIndex(s => s.id === state.currentSongId);
            const prev = idx - 1 < 0 ? songs.length - 1 : idx - 1;
            Store.getInstance().setState({ currentSongId: songs[prev].id, isPlaying: true });
            audio.loadTrack(songs[prev].src);
            audio.play();
        });

        this.container.querySelector('#btn-next')?.addEventListener('click', () => {
            const state = Store.getInstance().getState();
            const idx = songs.findIndex(s => s.id === state.currentSongId);
            const next = (idx + 1) % songs.length;
            Store.getInstance().setState({ currentSongId: songs[next].id, isPlaying: true });
            audio.loadTrack(songs[next].src);
            audio.play();
        });

        // ===============================
        // 6. GSAP ANIMATIONS
        // ===============================

        // Like button - bouncy animation
        this.container.querySelector('#btn-like-player')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const state = Store.getInstance().getState();
            if (state.currentSongId) {
                const isNowLiked = Store.getInstance().toggleLike(state.currentSongId);
                const icon = this.container.querySelector('#btn-like-player .material-symbols-outlined') as HTMLElement;

                if (icon) {
                    // GSAP bouncy scale effect:
                    // 1. Instantly pop up to 140% size (1.4 scale)
                    // 2. Shrink back down to 100% size with a rubber-band 'elastic' ease
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
        });

        // ===============================
        // 5 (Cont.). MORE EVENT HANDLERS
        // ===============================

        // Progress bar dragging logic
        const progContainer = this.container.querySelector('#progress-container') as HTMLElement;
        if (progContainer) {
            const seek = (e: MouseEvent) => {
                const rect = progContainer.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audio.seekTo(pct * audio.getDuration());
            };

            progContainer.addEventListener('mousedown', (e) => {
                this.progressDragging = true;
                seek(e);
                const onMove = (ev: MouseEvent) => seek(ev);
                const onUp = () => { this.progressDragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        }

        // Volume
        const volContainer = this.container.querySelector('#volume-container') as HTMLElement;
        if (volContainer) {
            const setVol = (e: MouseEvent) => {
                const rect = volContainer.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audio.setVolume(pct);
                Store.getInstance().setState({ volume: pct });
                const bar = this.container.querySelector('#volume-bar') as HTMLElement;
                const thumb = this.container.querySelector('#volume-thumb') as HTMLElement;
                if (bar) bar.style.width = (pct * 100) + '%';
                if (thumb) thumb.style.left = (pct * 100) + '%';
            };

            volContainer.addEventListener('mousedown', (e) => {
                setVol(e);
                const onMove = (ev: MouseEvent) => setVol(ev);
                const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        }

        // Now Playing
        this.container.querySelector('#btn-now-playing')?.addEventListener('click', () => {
            Router.getInstance().navigate('nowplaying');
        });

        // Artist Link on Player Bar
        const artistLink = this.container.querySelector('#btn-now-playing .artist-link');
        artistLink?.addEventListener('click', (e) => {
            e.stopPropagation();
            const artistName = (artistLink as HTMLElement).dataset.artist;
            if (artistName) {
                Router.getInstance().navigate('artist', { artistName });
            }
        });

        // Auto-advance to next track
        document.addEventListener('trackEnded', () => {
            const state = Store.getInstance().getState();
            const idx = songs.findIndex(s => s.id === state.currentSongId);
            const next = (idx + 1) % songs.length;
            Store.getInstance().setState({ currentSongId: songs[next].id, isPlaying: true });
            audio.loadTrack(songs[next].src);
            audio.play();
        });

        // Periodic UI update for progress
        setInterval(() => this.updateUI(), 250);
    }
}
