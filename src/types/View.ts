/**
 * ========================================================================
 * TYPE: VIEW
 * ========================================================================
 * 
 * Think of a "View" as a single Page or pop-up Screen in our app.
 * Every single page (like LibraryView, ArtistView) must implement this interface,
 * which means they MUST contain the `mount` and `destroy` functions.
 */
export interface View {
    /** Called when the page is being DRAWN onto the screen. GSAP animations start here. */
    mount(container: HTMLElement, params?: any): void;

    /** Called when the page is being REMOVED. GSAP animations MUST be killed here. */
    destroy(): void;
}
