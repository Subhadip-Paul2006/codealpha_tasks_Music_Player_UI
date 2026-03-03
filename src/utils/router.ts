/**
 * ========================================================================
 * ROUTER UTILITY
 * ========================================================================
 * 
 * This file handles all navigation (changing pages) in the application.
 * Because this is a Single Page Application (SPA), we don't actually load 
 * new HTML files. Instead, The Router removes the old "View" (UI Component)
 * and mounts a new "View" into the container.
 * 
 * IF YOU WANT TO ADD A NEW PAGE:
 * 1. Build your new view file (e.g., SettingsView.ts)
 * 2. Go to `main.ts` and import your new view.
 * 3. Register it in `main.ts` inside the `initApp` function using:
 *    router.register('settings', async () => new SettingsView());
 * 4. You can then jump to that page by calling:
 *    Router.getInstance().navigate('settings');
 */

// ===============================
// 1. IMPORTS
// ===============================

import { View } from '../types/View';
import { Store } from '../store/Store';
import { ActiveView } from '../types/PlayerState';
import { animatePageTransition } from './animations';

// ===============================
// 2. CORE LOGIC
// ===============================

export class Router {
    // We use a "Singleton" pattern so there is only ever ONE instance of the Router running.
    private static instance: Router;

    // Tracks the currently displayed full-screen page (like Library or Artist)
    private currentView: View | null = null;

    // Tracks currently displayed popup windows (like Now Playing or Create Playlist)
    private currentOverlay: View | null = null;

    // The main HTML element where we will inject our page code
    private container: HTMLElement | null = null;

    // A dictionary holding the names of our pages and instructions on how to build them
    private viewsMap: Record<string, () => Promise<View>> = {};

    private constructor() { }

    /** Gets the single active instance of the Router */
    static getInstance(): Router {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return Router.instance;
    }

    /** Tells the router which HTML div to use as the main content area */
    public init(container: HTMLElement) {
        this.container = container;
    }

    /** Connects a specific name (like 'library') to a View component layout */
    public register(viewName: ActiveView, viewFactory: () => Promise<View>) {
        this.viewsMap[viewName as string] = viewFactory;
    }

    /**
     * Changes the current page to the requested view name.
     * @param viewName The name of the registered page (e.g. 'artist')
     * @param params Any data you need to pass to the next page (like the artist's slug)
     */
    public async navigate(viewName: ActiveView, params?: any) {
        if (!this.container) return;

        // Overlays don't clear the background page, so they get rendered specially
        if (viewName === 'nowplaying' || viewName === 'newplaylist') {
            return this.showOverlay(viewName, params);
        }

        // Save the user's intent to the global application state
        Store.getInstance().setState({ activeView: viewName });

        // ★ GSAP: Smooth page transition — fade out old → mount new
        const mountNewView = async () => {
            // 1. Teardown the old page to prevent memory leaks
            if (this.currentView) {
                this.currentView.destroy();
                this.currentView = null;
                this.container!.innerHTML = '';
            }

            // 2. Find and construct the new page layout
            const factory = this.viewsMap[viewName as string];
            if (factory) {
                const view = await factory();
                this.currentView = view;
                // 3. Mount (draw) the new page onto the screen
                this.currentView.mount(this.container!, params);
            } else {
                console.warn(`View ${viewName} not registered`);
                this.container!.innerHTML = `<div class="p-10 text-primary">View ${viewName} not found</div>`;
            }
        };

        // If there's old content, animate it out first; otherwise mount directly
        if (this.currentView) {
            animatePageTransition(this.container, mountNewView);
        } else {
            await mountNewView();
        }
    }

    /** Shows a popup modal on top of the current screen without clearing the under-layer */
    public async showOverlay(viewName: ActiveView, params?: any) {
        const overlayContainer = document.getElementById('overlay-container');
        if (!overlayContainer) return;

        if (this.currentOverlay) {
            this.currentOverlay.destroy();
            this.currentOverlay = null;
        }

        const factory = this.viewsMap[viewName as string];
        if (factory) {
            this.currentOverlay = await factory();
            this.currentOverlay.mount(overlayContainer, params);
        }
    }

    /** Destroys the active popup modal */
    public hideOverlay() {
        if (this.currentOverlay) {
            this.currentOverlay.destroy();
            this.currentOverlay = null;
        }
    }
}
