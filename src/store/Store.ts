/**
 * ========================================================================
 * APPLICATION STORE (GLOBAL STATE)
 * ========================================================================
 * 
 * The Store is a central "brain" that remembers what the app is currently doing.
 * Instead of every component trying to remember the volume or what song is playing,
 * they all just ask the Store.
 * 
 * HOW IT WORKS:
 * 1. A component (like the Play Button) tells the Store to change the `isPlaying` state.
 * 2. The Store updates its internal state.
 * 3. The Store "notifies" all subscribed components.
 * 4. The components automatically re-draw themselves to match the new state.
 * 
 * We use a "Singleton" pattern here. That means no matter how many times you 
 * import `Store`, you are always talking to the exact same continuous data object.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { PlayerState } from '../types/PlayerState';
import { storage } from '../utils/storage';

// ===============================
// 2. TYPES
// ===============================
type Listener = (state: PlayerState) => void;

// ===============================
// 3. CORE STORE LOGIC
// ===============================
export class Store {
    // This holds the single permanent instance of our store
    private static instance: Store;

    private state: PlayerState = {
        currentSongId: null,
        isPlaying: false,
        volume: 1,
        progress: 0,
        activeView: 'library',
        isLoading: false,
        error: null,
        likedSongIds: [],
    };

    private listeners: Listener[] = [];

    private constructor() { }

    static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }

    // ===============================
    // 4. METHODS
    // ===============================

    /** Grabs saved preferences (volume, liked songs) from the browser's LocalStorage */
    loadFromStorage() {
        this.state.volume = storage.getVolume();
        this.state.currentSongId = storage.getLastSongId();
        this.state.likedSongIds = storage.getLikedSongs();
        this.notify();
    }

    /** Returns a safe copy of the current state */
    getState(): PlayerState {
        return { ...this.state };
    }

    /** 
     * Updates the state. You only need to pass in what changed.
     * Example: store.setState({ volume: 0.5 })
     */
    setState(partialState: Partial<PlayerState>) {
        // Merge the old state with the new changes
        this.state = { ...this.state, ...partialState };

        // Persist volume or currentSongId immediately if they changed
        if (partialState.volume !== undefined) {
            storage.setVolume(partialState.volume);
        }
        if (partialState.currentSongId !== undefined && partialState.currentSongId !== null) {
            storage.setLastSongId(partialState.currentSongId);
        }
        if (partialState.likedSongIds !== undefined) {
            storage.setLikedSongs(partialState.likedSongIds);
        }

        this.notify();
    }

    toggleLike(songId: number): boolean {
        const liked = [...this.state.likedSongIds];
        const idx = liked.indexOf(songId);
        if (idx >= 0) {
            liked.splice(idx, 1);
        } else {
            liked.push(songId);
        }
        this.setState({ likedSongIds: liked });
        return idx < 0; // returns true if now liked
    }

    isLiked(songId: number): boolean {
        return this.state.likedSongIds.includes(songId);
    }

    /** 
     * Components call this when they want to be alerted anytime the state changes.
     * It returns a "cleanup" function the component can call when it's destroyed.
     */
    subscribe(listener: Listener): () => void {
        this.listeners.push(listener);
        listener(this.getState()); // Send initial state immediately
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /** Triggers all subscribed components to update themselves based on the new state */
    private notify() {
        const currentState = this.getState();
        this.listeners.forEach(listener => listener(currentState));
    }
}
