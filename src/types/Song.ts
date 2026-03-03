/**
 * ========================================================================
 * TYPE: SONG
 * ========================================================================
 * 
 * This interface defines the mandatory structure of every song in our app.
 * If you add a new song to `songs.ts`, it MUST follow these rules exactly.
 */
export interface Song {
    id: number;          // Unique number for the song (Required)
    title: string;       // The display name of the track (Required)
    artist: string;      // The creator of the track (Required)
    album: string;       // Which album this belongs to (Required)
    src: string;         // The path to the actual audio file (Required)
    cover: string;       // The path to the square album art image (Required)

    // The fields below have a "?" which means they are OPTIONAL.
    // The app will still work even if these aren't provided.
    duration?: number;   // Length of the track in seconds
    genre?: string;      // Musical category (e.g. "Bollywood", "Rock")
    year?: number;       // Release year
}
