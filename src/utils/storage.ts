/**
 * ========================================================================
 * LOCAL STORAGE UTILITY — Chillz Time
 * ========================================================================
 * 
 * Handles persisting user data (volume, last played song, playlists, liked songs)
 * across browser sessions using localStorage.
 * 
 * MIGRATION: If old "audio_system_" keys exist from a previous version,
 * they are automatically migrated to the new "chillz_time_" prefix on first load.
 */

import { Playlist } from '../types/Playlist';

// ===============================
// 1. STORAGE KEY DEFINITIONS
// ===============================

const STORAGE_KEYS = {
    VOLUME: 'chillz_time_volume',
    LAST_SONG: 'chillz_time_last_song',
    PLAYLISTS: 'chillz_time_playlists',
    LIKED_SONGS: 'chillz_time_liked_songs'
};

// Old keys from previous "Audio System" branding — used only for migration
const OLD_KEYS: Record<string, string> = {
    'audio_system_volume': STORAGE_KEYS.VOLUME,
    'audio_system_last_song': STORAGE_KEYS.LAST_SONG,
    'audio_system_playlists': STORAGE_KEYS.PLAYLISTS,
    'audio_system_liked_songs': STORAGE_KEYS.LIKED_SONGS
};

// ===============================
// 2. AUTO-MIGRATION (runs once)
// ===============================

/**
 * If the user had data saved under the old "audio_system_" keys,
 * copy it to the new "chillz_time_" keys and delete the old ones.
 * This ensures no user data is lost during the rebrand.
 */
function migrateOldKeys(): void {
    for (const [oldKey, newKey] of Object.entries(OLD_KEYS)) {
        const oldValue = localStorage.getItem(oldKey);
        if (oldValue !== null && localStorage.getItem(newKey) === null) {
            localStorage.setItem(newKey, oldValue);
            localStorage.removeItem(oldKey);
        }
    }
}

// Run migration immediately when this module is first imported
migrateOldKeys();

// ===============================
// 3. STORAGE API
// ===============================

export const storage = {
    getVolume(): number {
        const vol = localStorage.getItem(STORAGE_KEYS.VOLUME);
        return vol ? parseFloat(vol) : 1;
    },
    setVolume(volume: number): void {
        localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    },

    getLastSongId(): number | null {
        const id = localStorage.getItem(STORAGE_KEYS.LAST_SONG);
        return id ? parseInt(id, 10) : null;
    },
    setLastSongId(id: number): void {
        localStorage.setItem(STORAGE_KEYS.LAST_SONG, id.toString());
    },

    getPlaylists(): Playlist[] {
        const p = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
        return p ? JSON.parse(p) : [];
    },
    setPlaylists(playlists: Playlist[]): void {
        localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    },

    getLikedSongs(): number[] {
        const ids = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
        return ids ? JSON.parse(ids) : [];
    },
    setLikedSongs(ids: number[]): void {
        localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(ids));
    }
};
