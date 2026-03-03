/**
 * ========================================================================
 * AUDIO SERVICE (PLAYBACK ENGINE)
 * ========================================================================
 * 
 * This file is the bridge between the hidden HTML `<audio>` tag that actually 
 * plays the music, and our central `Store` that tracks the app's state.
 * 
 * HOW IT WORKS:
 * - When you click play, a UI component calls `AudioService.getInstance().play()`.
 * - The AudioService tells the invisible `<audio>` element to play.
 * - The `<audio>` element fires an event saying "I started playing!".
 * - AudioService catches that event and tells the `Store` to set `isPlaying: true`.
 * - The `Store` then tells the UI to update the Play button to a Pause button.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { Store } from '../store/Store';

// ===============================
// 2. CORE LOGIC
// ===============================
export class AudioService {
    // Singleton instance ensures we only ever have ONE music player running
    private static instance: AudioService;

    // The actual invisible browser audio engine
    private audio: HTMLAudioElement;

    // Reference to our global state manager
    private store: Store;

    private constructor() {
        this.audio = new Audio();
        this.store = Store.getInstance();
        this.setupListeners();

        // Apply initial volume
        this.audio.volume = this.store.getState().volume;
    }

    static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    // ===============================
    // 3. EVENT LISTENERS
    // ===============================

    /**
     * Listens to the browser's native audio events and strictly syncs them
     * back to our application Store. 
     */
    private setupListeners() {
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.store.setState({ error: 'Failed to load audio', isLoading: false, isPlaying: false });
        });

        this.audio.addEventListener('loadstart', () => {
            this.store.setState({ isLoading: true, error: null });
        });

        this.audio.addEventListener('canplay', () => {
            this.store.setState({ isLoading: false });
        });

        this.audio.addEventListener('play', () => {
            this.store.setState({ isPlaying: true });
        });

        this.audio.addEventListener('pause', () => {
            this.store.setState({ isPlaying: false });
        });

        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                this.store.setState({ progress: this.audio.currentTime / this.audio.duration });
            }
        });

        this.audio.addEventListener('ended', () => {
            this.store.setState({ isPlaying: false, progress: 0 });
            // TODO: Fire custom event for 'playlist_ended' to naturally advance tracks
            document.dispatchEvent(new CustomEvent('trackEnded'));
        });
    }

    // ===============================
    // 4. CONTROL METHODS
    // ===============================

    /** Loads a new .mp3 file into the browser's audio engine */
    public loadTrack(src: string) {
        this.audio.src = src;
        this.audio.load();
    }

    public play() {
        // Only attempt if src is set
        if (this.audio.src) {
            this.audio.play().catch(e => {
                console.error('Play intercepted:', e);
                this.store.setState({ error: 'Playback failed', isPlaying: false });
            });
        }
    }

    public pause() {
        this.audio.pause();
    }

    public togglePlay() {
        if (this.store.getState().isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    public setVolume(volume: number) {
        this.audio.volume = Math.max(0, Math.min(1, volume));
        this.store.setState({ volume });
    }

    public seek(progress: number) {
        if (this.audio.duration) {
            this.audio.currentTime = progress * this.audio.duration;
            this.store.setState({ progress });
        }
    }

    public seekTo(timeInSeconds: number) {
        if (this.audio.duration) {
            this.audio.currentTime = Math.max(0, Math.min(timeInSeconds, this.audio.duration));
            this.store.setState({ progress: this.audio.currentTime / this.audio.duration });
        }
    }

    public getDuration(): number {
        return this.audio.duration || 0;
    }

    public getCurrentTime(): number {
        return this.audio.currentTime || 0;
    }
}
