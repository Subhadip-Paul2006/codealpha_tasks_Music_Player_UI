/**
 * ========================================================================
 * NOW PLAYING OVERLAY (FULL SCREEN PLAYER)
 * ========================================================================
 * 
 * This is the immersive, full-screen player view. It slides up over the 
 * current page rather than replacing it. It features complex, chained 
 * GSAP timeline animations for a premium feel when opening.
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
import { cleanupAnimations } from '../utils/animations';
import gsap from 'gsap';

// ===============================
// 2. COMPONENT CLASS & ENTRY ANIMATION
// ===============================
export class NowPlayingOverlay implements View {
    private container: HTMLElement | null = null;
    private unsubscribe: (() => void) | null = null;
    private unsubscribeEvents: (() => void)[] = [];
    private continuousTweens: gsap.core.Tween[] = [];
    private previousSongId: number | null = null;

    mount(container: HTMLElement): void {
        this.container = container;
        this.render();
        const state = Store.getInstance().getState();
        this.previousSongId = state.currentSongId;

        // Premium Page Load Animation Sequence
        const tl = gsap.timeline();

        // Base container slide up
        tl.fromTo(this.container.firstElementChild,
            { y: '100%', opacity: 0 },
            { y: '0%', opacity: 1, duration: 0.7, ease: 'power3.out' }
        );

        // Staggered reveals
        const cover = this.container.querySelector('#cover-container');
        const title = this.container.querySelector('#overlay-title');
        const artist = this.container.querySelector('#overlay-artist');
        const progress = this.container.querySelector('#overlay-progress-container');
        const playBtn = this.container.querySelector('#btn-play-overlay');

        if (cover) {
            tl.fromTo(cover,
                { scale: 0.85, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out' },
                "-=0.3"
            );
        }
        if (title) {
            tl.fromTo(title,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
                "-=0.6"
            );
        }
        if (artist) {
            tl.fromTo(artist,
                { opacity: 0 },
                { opacity: 1, duration: 0.6, ease: 'power3.out' },
                "-=0.4"
            );
        }
        if (progress) {
            tl.fromTo(progress,
                { scaleX: 0, transformOrigin: 'left center', opacity: 0 },
                { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power3.out' },
                "-=0.4"
            );
        }
        if (playBtn) {
            tl.fromTo(playBtn,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out', clearProps: 'all' },
                "-=0.5"
            );
        }

        this.unsubscribe = Store.getInstance().subscribe((state) => {
            this.updateUI(state);
        });

        this.attachEvents();
        this.updateContinuousAnimations();
    }

    destroy(): void {
        if (this.unsubscribe) this.unsubscribe();
        this.unsubscribeEvents.forEach(unsub => unsub());
        this.continuousTweens.forEach(t => t.kill());
        this.continuousTweens = [];
        if (this.container) {
            cleanupAnimations(this.container);
            this.container.innerHTML = '';
        }
    }

    // ===============================
    // 3. UI RENDERING
    // ===============================


    private render() {
        if (!this.container) return;

        const state = Store.getInstance().getState();
        const song = songs.find(s => s.id === state.currentSongId) || songs[0];
        const isLiked = song ? Store.getInstance().isLiked(song.id) : false;
        const audio = AudioService.getInstance();

        this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex flex-col font-sora">
        <!-- Blurred background -->
        <div class="absolute inset-0 bg-background-dark/80 backdrop-blur-2xl -z-10 bg-transition-layer"></div>
        ${song && song.cover ? `<div class="absolute inset-0 bg-cover bg-center opacity-[0.07] -z-20 scale-110 overlay-bg-cover" style="background-image: url('${song.cover}')"></div>` : ''}
        
        <!-- Ambient gradients -->
        <div class="absolute inset-0 -z-10 pointer-events-none" id="ambient-bg">
          <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        </div>

        <!-- Header -->
        <header class="p-6 lg:p-8 flex justify-between items-center z-10">
           <button class="size-11 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all" id="btn-close">
              <span class="material-symbols-outlined">expand_more</span>
           </button>
           <p class="text-xs uppercase tracking-widest text-white/40">Now Playing</p>
           <button class="size-11 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all ${isLiked ? '!text-primary !bg-primary/10' : ''}" id="btn-like-overlay">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${isLiked ? '1' : '0'}">favorite</span>
           </button>
        </header>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 z-10 w-full max-w-2xl mx-auto space-y-10">
           
           <!-- Large Art -->
           <div class="w-full aspect-square max-w-[380px] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden relative border border-white/10 mx-auto group" id="cover-container">
              ${song && song.cover
                ? `<img src="${song.cover}" class="w-full h-full object-cover" id="overlay-cover" />`
                : '<div class="w-full h-full bg-neutral-800 flex items-center justify-center"><span class="material-symbols-outlined text-6xl text-white/10">music_note</span></div>'}
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
           </div>

           <!-- Info & Controls -->
           <div class="w-full flex flex-col items-center text-center space-y-8">
              <div>
                <h1 class="font-serif text-3xl lg:text-4xl text-white mb-2 text-glow" id="overlay-title">${song ? song.title : 'No Track'}</h1>
                <p class="text-base text-primary/70 artist-link cursor-pointer hover:underline transition-colors pointer-events-auto inline-block relative z-20" id="overlay-artist" data-artist="${song ? song.artist : ''}">${song ? song.artist : 'Select a track'}</p>
              </div>

              <!-- Progress -->
              <div class="w-full flex flex-col gap-2">
                <div class="relative h-1.5 w-full bg-white/10 hover:bg-white/20 transition-colors duration-300 rounded-full cursor-pointer group" id="overlay-progress-container">
                  <div class="absolute top-0 left-0 h-full bg-primary rounded-full pointer-events-none shadow-[0_0_8px_rgba(201,167,74,0.4)] transition-all duration-300 ease-linear" id="overlay-progress-bar" style="width: ${(state.progress || 0) * 100}%"></div>
                  <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 ease-out pointer-events-none" id="overlay-progress-thumb" style="left: ${(state.progress || 0) * 100}%"></div>
                </div>
                <div class="flex justify-between text-[11px] text-white/30 font-mono">
                  <span id="overlay-time-current">${formatTime(audio.getCurrentTime())}</span>
                  <span id="overlay-time-total">${song?.duration ? formatTime(song.duration) : '00:00'}</span>
                </div>
              </div>

              <!-- Main Player Controls -->
              <div class="flex items-center gap-8">
                <button class="text-white/30 hover:text-white hover:scale-110 transition-all duration-300" id="btn-shuffle-overlay"><span class="material-symbols-outlined text-2xl">shuffle</span></button>
                <button class="text-white/40 hover:text-white hover:scale-110 transition-all duration-300" id="btn-prev-overlay"><span class="material-symbols-outlined text-3xl">skip_previous</span></button>
                <button class="size-18 rounded-full bg-primary flex items-center justify-center text-background-dark hover:scale-105 transition-transform glow-primary-intense" id="btn-play-overlay">
                  <span class="material-symbols-outlined text-4xl" id="icon-play-overlay" style="font-variation-settings: 'FILL' 1">${state.isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
                <button class="text-white/40 hover:text-white hover:scale-110 transition-all duration-300" id="btn-next-overlay"><span class="material-symbols-outlined text-3xl">skip_next</span></button>
                <button class="text-white/30 hover:text-white hover:scale-110 transition-all duration-300" id="btn-repeat-overlay"><span class="material-symbols-outlined text-2xl">repeat</span></button>
              </div>
           </div>
        </main>
      </div>
    `;
    }

    // ===============================
    // 4. STATE SYNC & CONTINUOUS ANIMATIONS
    // ===============================

    /** Sets up the subtle "breathing" and floating animations while playing */
    private updateContinuousAnimations() {
        const state = Store.getInstance().getState();
        const coverContainer = this.container?.querySelector('#cover-container') as HTMLElement;
        const playBtn = this.container?.querySelector('#btn-play-overlay') as HTMLElement;
        const ambientBg = this.container?.querySelector('#ambient-bg') as HTMLElement;

        if (state.isPlaying) {
            if (this.continuousTweens.length === 0) {
                // Play Button breathing glow
                if (playBtn) {
                    this.continuousTweens.push(
                        gsap.to(playBtn, {
                            scale: 1.05,
                            boxShadow: '0 0 30px rgba(201,167,74,0.4)',
                            repeat: -1,
                            yoyo: true,
                            duration: 2,
                            ease: 'sine.inOut'
                        })
                    );
                }

                // Album Cover subtle float and unnoticeable rotation
                if (coverContainer) {
                    this.continuousTweens.push(
                        gsap.to(coverContainer, {
                            y: -8,
                            rotation: 1,
                            boxShadow: '0 25px 65px rgba(0,0,0,0.6), 0 0 40px rgba(201,167,74,0.1)',
                            repeat: -1,
                            yoyo: true,
                            duration: 4,
                            ease: 'sine.inOut'
                        })
                    );
                }

                // Background ambient shift
                if (ambientBg) {
                    this.continuousTweens.push(
                        gsap.to(ambientBg, {
                            scale: 1.05,
                            opacity: 0.8,
                            repeat: -1,
                            yoyo: true,
                            duration: 5,
                            ease: 'sine.inOut'
                        })
                    );
                }
            }
        } else {
            if (this.continuousTweens.length > 0) {
                this.continuousTweens.forEach(t => t.kill());
                this.continuousTweens = [];

                // Reset smoothly
                if (playBtn) gsap.to(playBtn, { scale: 1, boxShadow: '0 0 0px rgba(201,167,74,0)', duration: 0.5, ease: 'power3.out' });
                if (coverContainer) gsap.to(coverContainer, { y: 0, rotation: 0, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', duration: 0.8, ease: 'power3.out' });
                if (ambientBg) gsap.to(ambientBg, { scale: 1, opacity: 1, duration: 1, ease: 'power3.out' });
            }
        }
    }

    /** Triggers every time the song changes, play/pause toggles, or progress ticks */
    private updateUI(state: any) {
        if (!this.container) return;

        const song = songs.find(s => s.id === state.currentSongId);
        if (!song) return;

        const playIcon = this.container.querySelector('#icon-play-overlay') as HTMLElement;
        if (playIcon) {
            playIcon.innerText = state.isPlaying ? 'pause' : 'play_arrow';
        }

        const titleEl = this.container.querySelector('#overlay-title') as HTMLElement;
        const artistEl = this.container.querySelector('#overlay-artist') as HTMLElement;
        const coverEl = this.container.querySelector('#overlay-cover') as HTMLImageElement;
        const bgBlurEl = this.container.querySelector('.overlay-bg-cover') as HTMLElement;

        if (this.previousSongId !== null && this.previousSongId !== song.id) {
            // Cinematic Track Change Transition
            const tl = gsap.timeline();

            if (this.continuousTweens.length > 0) {
                this.continuousTweens.forEach(t => t.kill());
                this.continuousTweens = [];
            }

            // Animate OUT
            tl.to(coverEl, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' }, 0)
                .to([titleEl, artistEl], { opacity: 0, y: -10, stagger: 0.05, duration: 0.2, ease: 'power2.in' }, 0)
                .add(() => {
                    if (titleEl) titleEl.innerText = song.title;
                    if (artistEl) {
                        artistEl.innerText = song.artist;
                        artistEl.setAttribute('data-artist', song.artist);
                    }
                    if (coverEl) coverEl.src = song.cover;

                    gsap.set(coverEl, { scale: 0.85, y: 0 });
                    gsap.set([titleEl, artistEl], { y: 15 });

                    // Background transition
                    if (bgBlurEl && bgBlurEl.style.backgroundImage !== `url("${song.cover}")`) {
                        gsap.to(bgBlurEl, {
                            opacity: 0, duration: 0.3, onComplete: () => {
                                bgBlurEl.style.backgroundImage = `url('${song.cover}')`;
                                gsap.to(bgBlurEl, { opacity: 0.07, duration: 0.5 });
                            }
                        });
                    }
                })
                // Animate IN
                .to(coverEl, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' })
                .to(titleEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, "-=0.4")
                .to(artistEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, "-=0.3")
                .add(() => {
                    this.updateContinuousAnimations();
                }, "-=0.2");

            this.previousSongId = song.id;
        } else {
            // Standard state update (same track)
            if (titleEl && titleEl.innerText !== song.title) {
                titleEl.innerText = song.title;
            }
            if (artistEl && artistEl.innerText !== song.artist) {
                artistEl.innerText = song.artist;
                artistEl.setAttribute('data-artist', song.artist);
            }
            if (coverEl && coverEl.src !== song.cover) {
                coverEl.src = song.cover;
            }
            if (bgBlurEl && bgBlurEl.style.backgroundImage !== `url("${song.cover}")`) {
                bgBlurEl.style.backgroundImage = `url('${song.cover}')`;
            }
            this.previousSongId = song.id;
        }

        // Progress
        const audio = AudioService.getInstance();
        if (audio.getDuration() > 0) {
            const pct = (audio.getCurrentTime() / audio.getDuration()) * 100;
            const bar = this.container.querySelector('#overlay-progress-bar') as HTMLElement;
            const thumb = this.container.querySelector('#overlay-progress-thumb') as HTMLElement;
            const timeCurrent = this.container.querySelector('#overlay-time-current');
            const timeTotal = this.container.querySelector('#overlay-time-total');
            if (bar) bar.style.width = pct + '%';
            if (thumb) thumb.style.left = pct + '%';
            if (timeCurrent) timeCurrent.textContent = formatTime(audio.getCurrentTime());
            if (timeTotal && song.duration) timeTotal.textContent = formatTime(song.duration);
        }

        // Like button state
        const likeBtn = this.container.querySelector('#btn-like-overlay');
        if (likeBtn) {
            const isLiked = Store.getInstance().isLiked(song.id);
            const icon = likeBtn.querySelector('.material-symbols-outlined') as HTMLElement;
            if (icon) icon.style.fontVariationSettings = `'FILL' ${isLiked ? '1' : '0'}`;
            likeBtn.classList.toggle('!text-primary', isLiked);
            likeBtn.classList.toggle('!bg-primary/10', isLiked);
        }

        this.updateContinuousAnimations();
    }

    // ===============================
    // 5. EVENT HANDLERS
    // ===============================
    private attachEvents() {
        if (!this.container) return;

        const closeBtn = this.container.querySelector('#btn-close');
        const hClose = () => {
            if (this.container) {
                gsap.to(this.container.children, {
                    y: '100%',
                    opacity: 0,
                    duration: 0.4,
                    ease: 'power2.in',
                    onComplete: () => {
                        Router.getInstance().hideOverlay();
                    }
                });
            }
        };
        closeBtn?.addEventListener('click', hClose);
        this.unsubscribeEvents.push(() => closeBtn?.removeEventListener('click', hClose));

        // Artist Link
        const artistLink = this.container.querySelector('#overlay-artist');
        if (artistLink) {
            const hArtist = (e: Event) => {
                e.stopPropagation();
                const artistName = (artistLink as HTMLElement).dataset.artist;
                if (artistName && this.container) {
                    gsap.to(this.container.children, {
                        y: '100%', opacity: 0, duration: 0.4, ease: 'power2.in',
                        onComplete: () => {
                            Router.getInstance().hideOverlay();
                            Router.getInstance().navigate('artist', { artistName });
                        }
                    });
                }
            };
            artistLink.addEventListener('click', hArtist);
            this.unsubscribeEvents.push(() => artistLink.removeEventListener('click', hArtist));
        }

        const audioSvc = AudioService.getInstance();

        const playBtn = this.container.querySelector('#btn-play-overlay');
        const hPlay = () => audioSvc.togglePlay();
        playBtn?.addEventListener('click', hPlay);
        this.unsubscribeEvents.push(() => playBtn?.removeEventListener('click', hPlay));

        const nextBtn = this.container.querySelector('#btn-next-overlay');
        const hNext = () => {
            const state = Store.getInstance().getState();
            if (state.currentSongId) {
                const idx = songs.findIndex(s => s.id === state.currentSongId);
                const nextIdx = (idx + 1) % songs.length;
                Store.getInstance().setState({ currentSongId: songs[nextIdx].id });
                audioSvc.loadTrack(songs[nextIdx].src);
                audioSvc.play();
            }
        };
        nextBtn?.addEventListener('click', hNext);
        this.unsubscribeEvents.push(() => nextBtn?.removeEventListener('click', hNext));

        const prevBtn = this.container.querySelector('#btn-prev-overlay');
        const hPrev = () => {
            const state = Store.getInstance().getState();
            if (state.currentSongId) {
                const idx = songs.findIndex(s => s.id === state.currentSongId);
                const prevIdx = idx - 1 < 0 ? songs.length - 1 : idx - 1;
                Store.getInstance().setState({ currentSongId: songs[prevIdx].id });
                audioSvc.loadTrack(songs[prevIdx].src);
                audioSvc.play();
            }
        };
        prevBtn?.addEventListener('click', hPrev);
        this.unsubscribeEvents.push(() => prevBtn?.removeEventListener('click', hPrev));

        // Shuffle
        const shuffleBtn = this.container.querySelector('#btn-shuffle-overlay');
        const hShuffle = () => {
            const rand = songs[Math.floor(Math.random() * songs.length)];
            Store.getInstance().setState({ currentSongId: rand.id });
            audioSvc.loadTrack(rand.src);
            audioSvc.play();
        };
        shuffleBtn?.addEventListener('click', hShuffle);
        this.unsubscribeEvents.push(() => shuffleBtn?.removeEventListener('click', hShuffle));

        // Like button
        const likeBtn = this.container.querySelector('#btn-like-overlay');
        const hLike = () => {
            const state = Store.getInstance().getState();
            if (state.currentSongId) {
                const isNowLiked = Store.getInstance().toggleLike(state.currentSongId);
                const icon = likeBtn?.querySelector('.material-symbols-outlined') as HTMLElement;
                if (icon) {
                    gsap.fromTo(icon, { scale: 1 }, {
                        scale: isNowLiked ? 1.3 : 0.8, duration: 0.4, ease: 'back.out(2)',
                        onComplete: () => { gsap.to(icon, { scale: 1, duration: 0.3, ease: 'power2.out' }); }
                    });
                }
            }
        };
        likeBtn?.addEventListener('click', hLike);
        this.unsubscribeEvents.push(() => likeBtn?.removeEventListener('click', hLike));

        // Progress bar seeking
        const progContainer = this.container.querySelector('#overlay-progress-container') as HTMLElement;
        if (progContainer) {
            const seek = (e: MouseEvent) => {
                const rect = progContainer.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audioSvc.seekTo(pct * audioSvc.getDuration());
            };
            progContainer.addEventListener('mousedown', (e) => {
                seek(e);
                const onMove = (ev: MouseEvent) => seek(ev);
                const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        }

        // Periodic UI update
        const interval = setInterval(() => {
            const state = Store.getInstance().getState();
            this.updateUI(state);
        }, 250);
        this.unsubscribeEvents.push(() => clearInterval(interval));
    }
}
