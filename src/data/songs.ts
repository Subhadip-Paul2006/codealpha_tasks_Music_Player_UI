/**
 * ========================================================================
 * DATA FILE: SONGS LIST
 * ========================================================================
 * 
 * This file acts as the "Database" for all the basic songs in the app.
 * 
 * HOW TO ADD A NEW SONG:
 * 1. Place your `.mp3` file inside `src/assets/songs/`
 * 2. Place your cover image (`.jpg` or `.webp`) inside `src/assets/images/`
 * 3. Import both files using the `import` statements below.
 * 4. Scroll down to the `songs` array and add a new block:
 *    {
 *        id: 99, // Make sure this is a unique number!
 *        title: 'My New Song',
 *        artist: 'The Artist Name',
 *        album: 'The Album Name',
 *        src: myNewSongAudio, // The name you gave the import in step 3
 *        cover: myNewSongCover, // The name you gave the import in step 3
 *        duration: 180, // Length in seconds
 *        genre: 'Pop'
 *    }
 */

// ===============================
// 1. IMPORTS
// ===============================
import { Song } from '../types/Song';

// Import images so Vite can resolve them at building time
import channaMereyaImg from '../assets/images/Channa Mereya.jpg';
import tumTakImg from '../assets/images/Tum Tak.jpg';
import palPalImg from '../assets/images/Pal Pal Dil Ke Paas.jpg';
import lagJaGaleImg from '../assets/images/Lag Ja Gale Se Phir.jpg';
import raaiJagoImg from '../assets/images/RAAI JAGO.jpg';
import hareKrishnaImg from '../assets/images/HARE KRISHNA.jpg';
import kesariyaImg from '../assets/images/Kesariya.webp';
import shayadImg from '../assets/images/Shayad.webp';
import samjhawanImg from '../assets/images/Samjhawan.jpg';
import kalankImg from '../assets/images/Kalank.webp';
import phirLeAyaDilImg from '../assets/images/Phir Le Aya Dil.webp';
import aaogeTumKabhiImg from '../assets/images/Aaoge Tum Kabhi.webp';
import chooLoImg from '../assets/images/Choo Lo.webp';
import kaiseyJiyunImg from '../assets/images/Kaise Jiyun.webp';

// Import audio files
import channaMereyaSrc from '../assets/songs/Channa Mereya.mp3';
import tumTakSrc from '../assets/songs/Tum Tak.mp3';
import palPalSrc from '../assets/songs/Pal Pal Dil Ke Paas.mp3';
import lagJaGaleSrc from '../assets/songs/Lag Ja Gale Se Phir.mp3';
import raaiJagoSrc from '../assets/songs/RAAI JAGO.mp3';
import hareKrishnaSrc from '../assets/songs/HARE KRISHNA.mp3';
import kesariyaSrc from '../assets/songs/Kesariya.mp3';
import shayadSrc from '../assets/songs/Shayad.mp3';
import samjhawanSrc from '../assets/songs/Samjhawan.mp3';
import kalankSrc from '../assets/songs/Kalank.mp3';
import phirLeAyaDilSrc from '../assets/songs/Phir Le Aya Dil.mp3';
import aaogeTumKabhiSrc from '../assets/songs/Aaoge Tum Kabhi.mp3';
import chooLoSrc from '../assets/songs/Choo Lo.mp3';
import kaiseyJiyunSrc from '../assets/songs/Kaisey Jiyun.mp3';

export const songs: Song[] = [
    {
        id: 1,
        title: 'Channa Mereya',
        artist: 'Arijit Singh',
        album: 'Ae Dil Hai Mushkil',
        src: channaMereyaSrc,
        cover: channaMereyaImg,
        duration: 289,
        genre: 'Bollywood',
        year: 2016
    },
    {
        id: 2,
        title: 'Tum Tak',
        artist: 'Javed Ali',
        album: 'Raanjhanaa',
        src: tumTakSrc,
        cover: tumTakImg,
        duration: 310,
        genre: 'Bollywood',
        year: 2013
    },
    {
        id: 3,
        title: 'Pal Pal Dil Ke Paas',
        artist: 'Kishore Kumar',
        album: 'Blackmail',
        src: palPalSrc,
        cover: palPalImg,
        duration: 327,
        genre: 'Classic',
        year: 1973
    },
    {
        id: 4,
        title: 'Lag Ja Gale Se Phir',
        artist: 'Lata Mangeshkar',
        album: 'Woh Kaun Thi',
        src: lagJaGaleSrc,
        cover: lagJaGaleImg,
        duration: 257,
        genre: 'Classic',
        year: 1964
    },
    {
        id: 5,
        title: 'Raai Jago',
        artist: 'Fakira',
        album: 'Fakira',
        src: raaiJagoSrc,
        cover: raaiJagoImg,
        duration: 332,
        genre: 'Folk',
        year: 2024
    },
    {
        id: 6,
        title: 'Hare Krishna',
        artist: 'Fakira',
        album: 'Fakira',
        src: hareKrishnaSrc,
        cover: hareKrishnaImg,
        duration: 422,
        genre: 'Folk',
        year: 2024
    },
    {
        id: 7,
        title: 'Kesariya',
        artist: 'Arijit Singh',
        album: 'Brahmastra',
        src: kesariyaSrc,
        cover: kesariyaImg,
        duration: 268,
        genre: 'Bollywood',
        year: 2022
    },
    {
        id: 8,
        title: 'Shayad',
        artist: 'Arijit Singh',
        album: 'Love Aaj Kal',
        src: shayadSrc,
        cover: shayadImg,
        duration: 247,
        genre: 'Bollywood',
        year: 2020
    },
    {
        id: 9,
        title: 'Kalank',
        artist: 'Pritam',
        album: 'Kalank',
        src: kalankSrc,
        cover: kalankImg,
        duration: 247,
        genre: 'Bollywood',
        year: 2019
    },
    {
        id: 10,
        title: 'Phir Le Aya Dil',
        artist: 'Arijit Singh',
        album: 'Barfi',
        src: phirLeAyaDilSrc,
        cover: phirLeAyaDilImg,
        duration: 303,
        genre: 'Bollywood',
        year: 2012
    },
    {
        id: 11,
        title: 'Aaoge Tum Kabhi',
        artist: 'The local Train',
        album: 'The local Train',
        src: aaogeTumKabhiSrc,
        cover: aaogeTumKabhiImg,
        duration: 314,
        genre: 'Bollywood',
        year: 2015
    },
    {
        id: 12,
        title: 'Choo Lo',
        artist: 'The local Train',
        album: 'The local Train',
        src: chooLoSrc,
        cover: chooLoImg,
        duration: 236,
        genre: 'Bollywood',
        year: 2015
    },
    {
        id: 13,
        title: 'Kaisey Jiyun',
        artist: 'The local Train',
        album: 'The local Train',
        src: kaiseyJiyunSrc,
        cover: kaiseyJiyunImg,
        duration: 240,
        genre: 'Bollywood',
        year: 2015
    },
    {
        id: 14,
        title: 'Samjhawan',
        artist: 'Arijit Singh',
        album: 'Humpty Sharma Ki Dulhania',
        src: samjhawanSrc,
        cover: samjhawanImg,
        duration: 270,
        genre: 'Bollywood',
        year: 2014
    }
];
