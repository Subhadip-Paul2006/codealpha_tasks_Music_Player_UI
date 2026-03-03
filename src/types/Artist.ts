/**
 * ========================================================================
 * TYPE: ARTIST
 * ========================================================================
 * 
 * This interface defines the structure for rich Artist Profiles.
 * It is used by the Artist Template View.
 */
export interface Artist {
    // A string used in the URL. Must be lowercase with hyphens (e.g. 'arijit-singh') (Required)
    id: string;

    // The display name of the artist (Required)
    name: string;

    // Optional Fields ("?" means they can be left out)
    tagline?: string;           // E.g. "The Voice of Modern Romance"
    monthlyListeners?: number;  // Shown in the stats block
    bannerImage?: string;       // 16:9 cinematic background image
    profileImage?: string;      // Circular avatar image
    bio?: string;               // Multi-paragraph biography string
    genres?: string[];          // Array of genre tags like ['Pop', 'Lo-Fi']

    // An object holding external links
    socials?: {
        instagram?: string;
        twitter?: string;
        website?: string;
    };

    // Array of image paths for a photo gallery feature
    gallery?: string[];
}
