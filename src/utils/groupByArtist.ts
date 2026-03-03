// ===============================
// 1. IMPORTS
// ===============================
import { Song } from '../types/Song';

/**
 * ========================================================================
 * UTILITY: GROUP BY ARTIST
 * ========================================================================
 * 
 * This helper function takes a flat list of songs and organizes them into 
 * a "dictionary" (or Object) where the keys are the Artist Names, and the 
 * values are arrays of their songs.
 * 
 * Example output:
 * {
 *   "Arijit Singh": [Song1, Song2],
 *   "Javed Ali": [Song3]
 * }
 */
export function groupByArtist(songs: Song[]): Record<string, Song[]> {
    return songs.reduce((result: Record<string, Song[]>, song: Song) => {
        const artist = song.artist || 'Unknown Artist';
        if (!result[artist]) {
            result[artist] = [];
        }
        result[artist].push(song);
        return result;
    }, {});
}
