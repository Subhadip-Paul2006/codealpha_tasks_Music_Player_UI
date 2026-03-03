/**
 * ========================================================================
 * MAIN ENTRY POINT
 * ========================================================================
 * 
 * This file is the "brain" of the application that wakes up when the browser loads `index.html`.
 * 
 * HOW IT WORKS:
 * 1. It initializes the AudioService (so we can play music).
 * 2. It loads the saved user State (like what song was last played).
 * 3. It creates the permanent UI elements (Sidebar and Player Bar).
 * 4. It registers all our "Views" (pages) with the Router.
 * 5. It tells the Router to load the default page ('library').
 * 
 * If you want to add a new page (e.g. a Settings page), you must import its View class 
 * here and register it with the Router below!
 */

// ===============================
// 1. IMPORTS
// ===============================
import './style.css';
import { Router } from './utils/router';
import { Store } from './store/Store';
import { AudioService } from './services/AudioService';

// Import Views (Our Pages)
import { LibraryView } from './views/LibraryView';
import { ComponentSheet } from './views/ComponentSheet';
import { AlbumView } from './views/AlbumView';
import { PlaylistView } from './views/PlaylistView';
import { NowPlayingOverlay } from './views/NowPlayingOverlay';
import { NewPlaylistModal } from './views/NewPlaylistModal';
import { ArtistView } from './views/ArtistView';
import { LikedView } from './views/LikedView';
import { SearchView } from './views/SearchView';

// Import Permanent Components
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';

// Import GSAP animations for initial app load
import { animateNavbarIn, animateLogoEntrance, animateFloatingBg } from './utils/animations';

// ===============================
// 2. CORE LOGIC & INITIALIZATION
// ===============================

// This function runs automatically as soon as the HTML DOM is fully loaded.
async function initApp() {

    // 1. Boot up internal systems
    const store = Store.getInstance();
    AudioService.getInstance(); // Ensure the audio engine exists
    store.loadFromStorage();    // Load last session (e.g. volume, last played song)

    // 2. Find the invisible containers we built in index.html
    const appContainer = document.getElementById('main-content');
    const sidebarContainer = document.getElementById('sidebar-container');
    const playerBarContainer = document.getElementById('player-bar-container');

    // 3. Inject permanent UI into the containers
    if (sidebarContainer) {
        new Sidebar(sidebarContainer).mount();

        // ★ GSAP: Slide the sidebar in from above on first load
        animateNavbarIn(sidebarContainer);

        // ★ GSAP: Pulse the brand logo icon
        const logoIcon = sidebarContainer.querySelector('#brand-logo-icon');
        if (logoIcon) animateLogoEntrance(logoIcon);
    }
    if (playerBarContainer) {
        new PlayerBar(playerBarContainer).mount();
    }

    // ★ GSAP: Start subtle floating background animation
    const appEl = document.getElementById('app');
    if (appEl) animateFloatingBg(appEl);

    // 4. Setup the Router (The Navigation System)
    if (appContainer) {
        const router = Router.getInstance();
        router.init(appContainer);

        // Tell the router about all the available pages
        router.register('library', async () => new LibraryView());
        router.register('componentsheet', async () => new ComponentSheet());
        router.register('album', async () => new AlbumView());
        router.register('playlist', async () => new PlaylistView());
        router.register('nowplaying', async () => new NowPlayingOverlay());
        router.register('newplaylist', async () => new NewPlaylistModal());
        router.register('artist', async () => new ArtistView());
        router.register('liked', async () => new LikedView());
        router.register('search', async () => new SearchView());

        // 5. Fire off the first navigation to load the starting view (Dashboard)
        await router.navigate('library');
    }
}

// Wait for the browser to finish rendering index.html before starting the scripts
document.addEventListener('DOMContentLoaded', initApp);
