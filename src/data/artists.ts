/**
 * ========================================================================
 * DATA FILE: ARTISTS PROFILES
 * ========================================================================
 * 
 * This file powers the detailed "Artist Pages". 
 * If an artist is listed here, clicking their name in the app will take you
 * to a full custom profile page. If they aren't here, it falls back to a 
 * 404 "Not Found" page.
 * 
 * HOW TO ADD A NEW ARTIST:
 * 1. Place their Banner (16:9 ratio) and Profile Picture (1:1 ratio) in `src/assets/images/`
 * 2. Import those images below using `import`.
 * 3. Add an object to the `artists` array.
 *    - Make sure `id` is entirely lowercase with hyphens instead of spaces.
 *    - Do NOT use capital letters in the `id` field!
 */

// ===============================
// 1. IMPORTS
// ===============================
import { Artist } from '../types/Artist';

import arijitBanner from '../assets/images/Arijit_Singh_Banner.webp';
import arijitProfile from '../assets/images/Arijit_Singh_Profile.webp';
import javedBanner from '../assets/images/Javed_Ali_Banner.webp';
import javedProfile from '../assets/images/Javed_Ali_Profile.webp';
import fakiraBanner from '../assets/images/Fakira_Banner.webp';
import fakiraProfile from '../assets/images/Fakira_Profile.jpg';
import kishoreBanner from '../assets/images/Kishore_Kumar_Banner.webp';
import kishoreProfile from '../assets/images/Kishore_Kumar_Profile.webp';
import lataBanner from '../assets/images/Lata_Mangeshkar_Banner.webp';
import lataProfile from '../assets/images/Lata_Mangeshkar_Profile.webp';
import localProfile from '../assets/images/The_Local_Train_Profile.webp';
import localBanner from '../assets/images/The_Local_Train_Banner.webp';
import pritamProfile from '../assets/images/Pritam_Profile.webp';
import pritamBanner from '../assets/images/Pritam_Banner.webp';

export const artists: Artist[] = [
    {
        id: 'arijit-singh',
        name: 'Arijit Singh',
        tagline: 'The Voice of Modern Romance',
        monthlyListeners: 35000000,
        bannerImage: arijitBanner,
        profileImage: arijitProfile,
        bio: 'Arijit Singh is an Indian playback singer and music composer. The recipient of several awards, including a National Film Award and seven Filmfare Awards, he has recorded songs in several Indian languages. He is often cited as one of the best contemporary singers in the Indian music industry.',
        genres: ['Bollywood', 'Pop', 'Romantic'],
        socials: {
            instagram: 'https://instagram.com/arijitsingh',
            twitter: 'https://twitter.com/arijitsingh',
        }
    },
    {
        id: 'javed-ali',
        name: 'Javed Ali',
        tagline: 'Soulful Melodies',
        monthlyListeners: 12000000,
        bannerImage: javedBanner,
        profileImage: javedProfile,
        bio: 'Javed Ali is an Indian playback singer whose voice resonates with Sufi soulfulness and romantic depth. He has sung in various Indian languages and is known for his remarkable vocal range and emotional delivery.',
        genres: ['Bollywood', 'Sufi'],
    },
    {
        id: 'the-local-train',
        name: 'The Local Train',
        tagline: 'Indie Rock Legends',
        monthlyListeners: 5000000,
        bannerImage: localBanner,
        profileImage: localProfile,
        bio: 'The Local Train was an Indian Hindi rock band from Chandigarh, known for their powerful lyrics and energetic performances. They played a major role in popularizing independent rock music in India.',
        genres: ['Indie Rock', 'Alternative'],
    },
    {
        id: 'fakira',
        name: 'Fakira',
        tagline: 'Bengali Raw Spiritual Vibes',
        monthlyListeners: 5000000,
        bannerImage: fakiraBanner,
        profileImage: fakiraProfile,
        bio: 'Fakira is an Indian Bengali folk band from Kolkata, known for their powerful lyrics and energetic performances. They played a major role in popularizing independent folk music in India.',
        genres: ['Indie Folk', 'Alternative'],
    },
    {
        id: 'kishore-kumar',
        name: 'Kishore Kumar',
        tagline: 'Evergreen Melody King',
        monthlyListeners: 5000000,
        bannerImage: kishoreBanner,
        profileImage: kishoreProfile,
        bio: 'A legendary voice of Bollywood’s golden era, known for his versatility and emotional depth. His timeless songs continue to define classic Indian cinema.',
        genres: ['Golden Era Bollywood', 'Classical', 'Romantic'],
    },
    {
        id: 'lata-mangeshkar',
        name: 'Lata Mangeshkar',
        tagline: 'Nightingale of India',
        monthlyListeners: 5000000,
        bannerImage: lataBanner,
        profileImage: lataProfile,
        bio: 'The “Nightingale of India,” whose pure and soulful voice shaped generations of music lovers. A timeless icon of Indian playback singing.',
        genres: ['Golden Era Bollywood', 'Classical', 'Romantic'],
    },
    {
        id: 'pritam',
        name: 'Pritam',
        tagline: 'The Voice of Modern Romance',
        monthlyListeners: 35000000,
        bannerImage: pritamBanner,
        profileImage: pritamProfile,
        bio: 'Arijit Singh is an Indian playback singer and music composer. The recipient of several awards, including a National Film Award and seven Filmfare Awards, he has recorded songs in several Indian languages. He is often cited as one of the best contemporary singers in the Indian music industry.',
        genres: ['Bollywood', 'Pop', 'Romantic'],
        socials: {
            instagram: 'https://www.instagram.com/ipritamofficial/',
            twitter: 'https://www.facebook.com/Pritam',
        }
    }
];

// ===============================
// 2. HELPER FUNCTIONS
// ===============================

export const getArtistBySlug = (slug: string): Artist | undefined => {
    return artists.find(a => a.id === slug);
};

export const getArtistByName = (name: string): Artist | undefined => {
    return artists.find(a => a.name.toLowerCase() === name.toLowerCase());
};

export const generateSlug = (name: string): string => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};
