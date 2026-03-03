<![CDATA[<div align="center">

# 🎵 Chillz Time — Premium Music Player

**A chill, immersive web-based music player with premium dark-mode aesthetics, buttery smooth GSAP animations, and a pixel-perfect UI.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Folder Structure](#-project-folder-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [How to Upload Artists & Songs](#-how-to-upload-artists--songs)
- [Data Schema Reference](#-data-schema-reference)
- [Playlist System](#-playlist-system)
- [Animation System](#-animation-system)
- [Environment Variables](#-environment-variables)
- [Known Limitations](#-known-limitations)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎧 About the Project

**Chillz Time** is a modern, single-page music player application built entirely with vanilla **TypeScript** and **Vite**. It is designed for visual elegance and a premium listening experience — think of it as a Spotify-inspired player that runs entirely in the browser with local `.mp3` files.

There is **no backend server** or external database required. All data (songs, artists, playlists) is managed locally through TypeScript data files and the browser's `localStorage` API — making setup fast and deployment simple.

> **Who is this for?** Developers, designers, and music lovers who want a beautiful, self-hosted music player with zero server dependencies.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎵 **Local Audio Playback** | Full HTML5 Audio engine with play, pause, seek, volume, and track navigation |
| 🎤 **Artist-wise Albums** | Albums are automatically grouped by artist — no manual album creation needed |
| 📝 **Playlist Creation** | Create, manage, and persist custom playlists using `localStorage` |
| 🔍 **Real-time Search** | Instantly search through songs, artists, and albums |
| ❤️ **Liked Songs** | Mark your favourite tracks and access them in a dedicated Liked Songs view |
| 🎨 **Premium Dark UI** | Glassmorphism, grain textures, and cinematic gradients for a premium desktop feel |
| 🎬 **GSAP Animations** | Page transitions, scroll-triggered card reveals, hover glows, modal animations |
| 🖼️ **Cover Art & Banners** | Full support for album cover images and artist banner/profile images |
| 🧠 **Memory-safe Views** | Each view has `mount` and `destroy` lifecycle methods — zero memory leaks |
| 💾 **Session Persistence** | Volume level, last played song, and playlists persist across browser sessions |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Markup** | HTML5 (Semantic) | App shell and structure |
| **Styling** | Tailwind CSS 3 + PostCSS | Utility-first responsive styling |
| **Logic** | TypeScript (Strict Mode) | Type-safe application logic |
| **Animation** | GSAP 3 + ScrollTrigger | Premium, performant animations |
| **Build Tool** | Vite 7 | Lightning-fast dev server and bundler |
| **Audio** | HTML5 `<audio>` API | Local `.mp3` playback engine |
| **Storage** | Browser `localStorage` | Playlist, volume, and preference persistence |
| **Typography** | Google Fonts (Sora, Spline Sans, Cormorant Garamond) | Premium typography system |
| **Icons** | Material Symbols (Google) | Consistent icon set |

---

## 📂 Project Folder Structure

```text
chillz-time/
├── index.html                  # 🏠 Main SPA shell (entry point)
├── vite.config.ts              # ⚡ Vite bundler configuration
├── tsconfig.json               # 📘 TypeScript compiler options
├── tailwind.config.js          # 🎨 Tailwind CSS theme & extensions
├── postcss.config.js           # 🔧 PostCSS plugin pipeline
├── package.json                # 📦 Dependencies & scripts
├── package-lock.json           # 🔒 Dependency lock file
├── .env                        # 🔐 Environment variables (create manually)
├── .gitignore                  # 🚫 Git ignore rules
├── README.md                   # 📖 You are here!
│
├── dist/                       # 📤 Production build output (auto-generated)
│
└── src/                        # 💻 SOURCE CODE
    ├── main.ts                 # 🚀 App entry point & bootstrapper
    ├── style.css               # 🎨 Tailwind directives & global textures
    ├── vite-env.d.ts           # 📘 Vite type declarations
    │
    ├── assets/                 # 🎵 MEDIA FILES
    │   ├── songs/              #    └── .mp3 audio files
    │   └── images/             #    └── Album art, artist banners & profiles
    │
    ├── data/                   # 📊 LOCAL DATA (acts as the "database")
    │   ├── songs.ts            #    └── Song registry with metadata
    │   └── artists.ts          #    └── Artist profiles with bios & images
    │
    ├── types/                  # 📘 TYPESCRIPT INTERFACES
    │   ├── Song.ts             #    └── Song data shape
    │   ├── Artist.ts           #    └── Artist profile shape
    │   ├── Playlist.ts         #    └── Playlist data shape
    │   ├── PlayerState.ts      #    └── Audio player state shape
    │   └── View.ts             #    └── View lifecycle interface
    │
    ├── store/                  # 🏪 STATE MANAGEMENT
    │   └── Store.ts            #    └── Central PubSub state manager
    │
    ├── services/               # ⚙️ CORE SERVICES
    │   └── AudioService.ts     #    └── HTML5 Audio abstraction (singleton)
    │
    ├── utils/                  # 🧰 UTILITIES
    │   ├── animations.ts       #    └── ★ Centralized GSAP animation system
    │   ├── router.ts           #    └── View lifecycle manager & routing
    │   ├── storage.ts          #    └── localStorage helpers
    │   ├── formatTime.ts       #    └── Duration formatter (seconds → mm:ss)
    │   └── groupByArtist.ts    #    └── Groups songs by artist name
    │
    ├── components/             # 🧩 PERSISTENT UI COMPONENTS
    │   ├── PlayerBar.ts        #    └── Bottom audio control bar
    │   └── Sidebar.ts          #    └── Left navigation menu
    │
    └── views/                  # 📄 APPLICATION VIEWS (pages)
        ├── LibraryView.ts      #    └── Home / music library grid
        ├── AlbumView.ts        #    └── Single album track list
        ├── ArtistView.ts       #    └── Full artist profile page
        ├── PlaylistView.ts     #    └── Custom playlist view
        ├── LikedView.ts        #    └── Liked / favourited songs
        ├── SearchView.ts       #    └── Real-time search results
        ├── NowPlayingOverlay.ts #   └── Full-screen now playing view
        ├── NewPlaylistModal.ts  #   └── Create playlist modal
        └── ComponentSheet.ts   #    └── UI component showcase
```

### Folder Breakdown

| Folder | What It Does |
|---|---|
| `src/assets/songs/` | Stores all `.mp3` audio files. Vite resolves these at build time. |
| `src/assets/images/` | Stores album art (`.jpg`, `.webp`), artist banners (16:9), and profile pics (1:1). |
| `src/data/` | Acts as the **local database**. `songs.ts` and `artists.ts` hold all structured data. |
| `src/types/` | TypeScript interfaces that enforce data shapes across the entire app. |
| `src/store/` | A custom PubSub-based reactive state manager — the single source of truth. |
| `src/services/` | The `AudioService` singleton wraps the HTML5 Audio API with loading states and error handling. |
| `src/utils/` | Helper utilities — the animation system, router, localStorage wrappers, and formatters. |
| `src/components/` | Persistent UI elements that remain on screen across all views (sidebar, player bar). |
| `src/views/` | Each file represents a "page" in the SPA, with `mount()` and `destroy()` lifecycle methods. |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** — version `18.0` or higher (v20+ recommended)
- **npm** — comes bundled with Node.js (or use `yarn` / `pnpm` alternatives)
- **Git** — for cloning the repository

```bash
# Verify your installations
node -v    # Should print v18.x.x or higher
npm -v     # Should print 9.x.x or higher
git --version
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/chillz-time.git
cd chillz-time
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including TypeScript, Vite, Tailwind CSS, GSAP, and PostCSS.

### 3. Set Up Environment Variables

Create a `.env` file in the project root (see [Environment Variables](#-environment-variables) for details):

```bash
cp .env.example .env
```

Or manually create it:

```env
VITE_APP_TITLE=Chillz Time
VITE_APP_VERSION=1.0.0
VITE_BASE_URL=/
```

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to the address shown in the terminal (usually [`http://localhost:5173`](http://localhost:5173)).

### 5. Build for Production

```bash
npm run build
```

This runs the TypeScript compiler and then bundles everything with Vite into the `dist/` folder.

### 6. Preview Production Build

```bash
npm run preview
```

Serves the `dist/` folder locally so you can test the production build before deployment.

---

## 🎤 How to Upload Artists & Songs

### Step 1 — Add Audio & Image Files

1. Place your `.mp3` file inside:
   ```
   src/assets/songs/
   ```
2. Place the corresponding album art (`.jpg`, `.png`, or `.webp`) inside:
   ```
   src/assets/images/
   ```
3. **Naming convention**: Use descriptive names.
   ```
   Songs:  My Song Title.mp3
   Images: My Song Title.jpg
   ```

### Step 2 — Register the Song in the Data File

Open `src/data/songs.ts` and follow these steps:

**a) Import the files at the top:**

```typescript
// Import the image
import mySongImg from '../assets/images/My Song Title.jpg';

// Import the audio
import mySongSrc from '../assets/songs/My Song Title.mp3';
```

**b) Add a new entry to the `songs` array:**

```typescript
{
    id: 15,                    // ⚠️ Must be a UNIQUE number
    title: 'My Song Title',
    artist: 'Artist Name',     // Must match the artist's `name` field exactly
    album: 'Album Name',
    src: mySongSrc,            // Use the imported audio variable
    cover: mySongImg,          // Use the imported image variable
    duration: 240,             // Length in seconds (4 minutes = 240)
    genre: 'Pop',              // Optional
    year: 2024                 // Optional
}
```

> **💡 Tip:** Albums are generated automatically based on the `album` field. All songs that share the same `album` name will appear together. No separate album creation step is needed!

### Step 3 — Add an Artist Profile (Optional)

If you want the artist to have a dedicated profile page with a banner, bio, and social links:

1. Place a **banner image** (16:9 ratio) and a **profile picture** (1:1 square) in `src/assets/images/`:
   ```
   src/assets/images/Artist_Name_Banner.webp
   src/assets/images/Artist_Name_Profile.webp
   ```

2. Open `src/data/artists.ts` and add:

```typescript
// Import the images
import myArtistBanner from '../assets/images/Artist_Name_Banner.webp';
import myArtistProfile from '../assets/images/Artist_Name_Profile.webp';

// Add to the artists array
{
    id: 'artist-name',            // ⚠️ Must be lowercase with hyphens (no spaces!)
    name: 'Artist Name',          // Display name (must match `artist` field in songs.ts)
    tagline: 'Genre-defining Sound',
    monthlyListeners: 5000000,
    bannerImage: myArtistBanner,
    profileImage: myArtistProfile,
    bio: 'A short biography about the artist...',
    genres: ['Pop', 'Rock'],
    socials: {
        instagram: 'https://instagram.com/artistname',
        twitter: 'https://twitter.com/artistname',
        website: 'https://artistname.com'
    }
}
```

### Step 4 — Verify

Start the dev server and check:

```bash
npm run dev
```

- ✅ The new song appears in the **Library** view
- ✅ The song is grouped under its **album** automatically
- ✅ Clicking the **artist name** opens their profile page (if registered in `artists.ts`)
- ✅ The **search** finds the song by title, artist, or album name

---

## 📐 Data Schema Reference

### Song Interface

```typescript
// src/types/Song.ts
export interface Song {
    id: number;          // Unique numeric identifier (Required)
    title: string;       // Display name of the track (Required)
    artist: string;      // Name of the artist (Required)
    album: string;       // Album the track belongs to (Required)
    src: string;         // Path to the .mp3 audio file (Required)
    cover: string;       // Path to the album art image (Required)
    duration?: number;   // Track length in seconds (Optional)
    genre?: string;      // Musical category (Optional)
    year?: number;       // Release year (Optional)
}
```

### Artist Interface

```typescript
// src/types/Artist.ts
export interface Artist {
    id: string;                  // URL-safe slug, e.g. 'arijit-singh' (Required)
    name: string;                // Display name (Required)
    tagline?: string;            // Short subtitle, e.g. 'The Voice of Modern Romance'
    monthlyListeners?: number;   // Displayed in the stats section
    bannerImage?: string;        // 16:9 cinematic background image path
    profileImage?: string;       // 1:1 circular avatar image path
    bio?: string;                // Multi-paragraph biography
    genres?: string[];           // Array of genre tags
    socials?: {
        instagram?: string;
        twitter?: string;
        website?: string;
    };
    gallery?: string[];          // Array of image paths for a photo gallery
}
```

### Playlist Interface

```typescript
// src/types/Playlist.ts
export interface Playlist {
    id: string;          // Auto-generated unique ID, e.g. 'p-1700000000000'
    name: string;        // User-defined playlist name
    cover?: string;      // Optional custom cover image
    songIds: number[];   // Array of Song IDs in this playlist
    createdAt: number;   // Unix timestamp of creation
}
```

### Example Playlist in localStorage

```json
[
  {
    "id": "p-1700000000000",
    "name": "Late Night Vibes",
    "songIds": [1, 7, 10, 14],
    "createdAt": 1700000000000
  }
]
```

---

## 🎼 Playlist System

| Action | How It Works |
|---|---|
| **Create** | Click the `+` icon in the sidebar → Enter a name → Save |
| **Add Songs** | Select a song → Add to an existing playlist |
| **Persistence** | All playlists are saved to `localStorage` and survive browser refreshes |
| **Deletion** | Remove playlists from the sidebar context options |

**Storage Key:** `chillz_time_playlists`

---

## 🎬 Animation System

All GSAP animations are centralized in [`src/utils/animations.ts`](src/utils/animations.ts). The system includes:

- **Page Transitions** — Smooth fade and slide when switching views
- **Scroll-Triggered Reveals** — Cards animate in as you scroll
- **Hover Glows** — Interactive glow effects on cards and buttons
- **Modal Entrances** — Spring-based scale animations for modals
- **Ambient Effects** — Continuous subtle background animations

### Adjusting Animation Speed

Modify the duration constants at the top of `animations.ts`:

```typescript
const DURATIONS = {
    fast: 0.3,      // Quick micro-interactions
    normal: 0.6,    // Standard transitions
    slow: 1.0,      // Dramatic reveals
    entrance: 0.8   // Page entrance animations
};
```

---

## 🔐 Environment Variables

This project uses Vite's built-in environment variable system. Variables prefixed with `VITE_` are exposed to the client-side code.

Create a `.env` file in the project root:

```env
# ─── App Configuration ─────────────────────────────
VITE_APP_TITLE=Chillz Time
VITE_APP_VERSION=1.0.0

# ─── Server Configuration ──────────────────────────
VITE_PORT=5173
VITE_BASE_URL=/

# ─── Feature Flags ─────────────────────────────────
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

| Variable | Description | Default |
|---|---|---|
| `VITE_APP_TITLE` | Application title shown in the browser tab | `Chillz Time` |
| `VITE_APP_VERSION` | Current app version string | `1.0.0` |
| `VITE_PORT` | Dev server port number | `5173` |
| `VITE_BASE_URL` | Base URL for asset resolution | `/` |
| `VITE_ENABLE_ANALYTICS` | Toggle analytics tracking | `false` |
| `VITE_ENABLE_DEBUG_MODE` | Toggle verbose console logging | `false` |

> **⚠️ Important:** Never commit your `.env` file to version control. A `.env.example` file with dummy values is provided for reference.

---

## ⚠️ Known Limitations

- **Browser Auto-play Policies** — Modern browsers block auto-play until user interaction. Click "Play" or select a track to initialize the audio context.
- **Local Playback Only** — No web audio streaming (HLS/DASH) is implemented. All audio files must be bundled locally.
- **Seeking Limitation** — Seeking before a track is fully buffered might snap to the nearest keyframe depending on audio encoding.
- **Desktop Optimized** — The UI is designed for desktop viewports (1280px+). Mobile layouts are functional but not the primary target.
- **No Backend** — There is no server-side component. All data is local, and playlists are stored in the browser's `localStorage`.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use For |
|---|---|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation changes |
| `style:` | Formatting, no code change |
| `refactor:` | Code restructuring |
| `perf:` | Performance improvements |
| `chore:` | Build tasks, CI, dependencies |

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ and a lot of ☕**

*Chillz Time — Because great music deserves a great player.*

</div>
]]>
