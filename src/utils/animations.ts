/**
 * ========================================================================
 * CHILLZ TIME — CENTRALIZED GSAP ANIMATION SYSTEM
 * ========================================================================
 *
 * This file contains ALL reusable GSAP animations used across the app.
 * Each function is documented for beginners.
 *
 * HOW TO MODIFY ANIMATION SPEED GLOBALLY:
 * ────────────────────────────────────────
 * Change the values in the DURATIONS object below.
 * For example, setting `normal: 0.3` makes most animations twice as fast.
 *
 * HOW GSAP WORKS (Quick Refresher):
 * ────────────────────────────────
 * 1. gsap.fromTo(element, {startState}, {endState})
 *    → Animates from startState to endState.
 * 2. gsap.to(element, {endState})
 *    → Animates from current state to endState.
 * 3. Timelines (gsap.timeline()) let you chain animations sequentially.
 * 4. ScrollTrigger fires animations when elements scroll into view.
 *
 * WHY THESE EASINGS?
 * ──────────────────
 * - power3.out : Fast start, smooth deceleration. Great for entrances.
 * - expo.out   : Even snappier entrance, very premium feel.
 * - back.out   : Slight overshoot then settle — "bouncy" feel.
 * - sine.inOut : Gentle, breathing-like motion. Good for infinite loops.
 * - elastic.out: Rubber-band snap. Perfect for micro-interactions.
 */

// ===============================
// 1. IMPORTS
// ===============================
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin so GSAP knows about it
gsap.registerPlugin(ScrollTrigger);

// ===============================
// 2. GLOBAL DURATION CONSTANTS
// ===============================
/**
 * Change these values to speed up / slow down ALL animations globally.
 * - fast   : Micro-interactions (hover, click feedback)
 * - normal : Standard entrances (page content, cards)
 * - slow   : Cinematic entrances (overlays, modals)
 * - entrance: Initial page load animations
 */
const DURATIONS = {
    fast: 0.3,
    normal: 0.6,
    slow: 1.0,
    entrance: 0.8
};

// ===============================
// 3. PAGE-LEVEL ANIMATIONS
// ===============================

/**
 * animatePageIn — Fades+slides in all direct children of a container.
 * WHEN: Called by each view's mount() method after rendering HTML.
 * WHY power3.out: Starts fast, decelerates smoothly → feels responsive.
 *
 * @param container The parent element whose children get animated.
 */
export function animatePageIn(container: HTMLElement): void {
    const sections = container.querySelectorAll(':scope > *');
    if (sections.length === 0) return;

    gsap.fromTo(sections,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: DURATIONS.normal, stagger: 0.08, ease: 'power3.out' }
    );
}

/**
 * animateHeroText — Stagger animation for hero/header text elements.
 * WHEN: Called on page load for the main heading area.
 * Each child element (subtitle, title, description) fades in one after another.
 *
 * @param container The header/hero element whose children get staggered.
 */
export function animateHeroText(container: HTMLElement): void {
    const children = container.querySelectorAll(':scope > *');
    if (children.length === 0) return;

    gsap.fromTo(children,
        { opacity: 0, y: 20 },
        {
            opacity: 1,
            y: 0,
            duration: DURATIONS.entrance,
            stagger: 0.12,       // 120ms between each child
            ease: 'expo.out'     // Snappy, premium entrance
        }
    );
}

/**
 * animateLogoEntrance — Subtle scale pulse on the sidebar logo icon.
 * WHEN: Called once when the app first loads.
 * The logo pops in from slightly smaller, then settles to normal size.
 *
 * @param logoElement The logo icon element (e.g. the equalizer icon).
 */
export function animateLogoEntrance(logoElement: Element): void {
    gsap.fromTo(logoElement,
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 1, duration: DURATIONS.slow, ease: 'back.out(1.7)' }
    );
}

// ===============================
// 4. NAVBAR / SIDEBAR ANIMATIONS
// ===============================

/**
 * animateNavbarIn — Slides the sidebar down from above on initial load.
 * WHEN: Called once in main.ts after sidebar mounts.
 *
 * @param sidebarElement The sidebar container element.
 */
export function animateNavbarIn(sidebarElement: HTMLElement): void {
    gsap.fromTo(sidebarElement,
        { y: -40, opacity: 0 },
        { y: 0, opacity: 1, duration: DURATIONS.entrance, ease: 'power3.out' }
    );
}

/**
 * animateNavLinkHover — Adds a smooth underline + glow effect on nav link hover.
 * WHEN: Called after sidebar renders. Attaches mouseenter/mouseleave handlers.
 * Returns cleanup functions to remove listeners on destroy.
 *
 * @param navItems NodeList of nav link elements.
 * @returns Array of cleanup functions.
 */
export function animateNavLinkHover(navItems: NodeListOf<Element>): (() => void)[] {
    const cleanups: (() => void)[] = [];

    navItems.forEach(item => {
        // On hover: slide right slightly + add a subtle glow text-shadow
        const onEnter = () => {
            gsap.to(item, {
                x: 6,
                textShadow: '0 0 8px rgba(201, 167, 74, 0.3)',
                duration: DURATIONS.fast,
                ease: 'power2.out'
            });
        };
        // On leave: reset to normal
        const onLeave = () => {
            gsap.to(item, {
                x: 0,
                textShadow: '0 0 0px rgba(201, 167, 74, 0)',
                duration: DURATIONS.fast,
                ease: 'power2.out'
            });
        };

        item.addEventListener('mouseenter', onEnter);
        item.addEventListener('mouseleave', onLeave);

        cleanups.push(() => {
            item.removeEventListener('mouseenter', onEnter);
            item.removeEventListener('mouseleave', onLeave);
            gsap.killTweensOf(item);
        });
    });

    return cleanups;
}

// ===============================
// 5. CARD ANIMATIONS
// ===============================

/**
 * animateCards — Scales up and fades in cards (featured, artist, etc.).
 * WHEN: Called immediately after cards are rendered.
 * WHY: Creates a "popping in" entrance effect.
 *
 * @param cards NodeList or array of card elements.
 */
export function animateCards(cards: NodeListOf<Element> | Element[]): void {
    if (!cards || (cards as NodeListOf<Element>).length === 0) return;

    gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: DURATIONS.normal, stagger: 0.07, ease: 'power2.out' }
    );
}

/**
 * animateCardsOnScroll — Uses ScrollTrigger to animate cards when they
 * scroll into the viewport. Cards fade+rise upward.
 * WHEN: Called after rendering cards inside a scrollable container.
 * WHY ScrollTrigger: Better perf — animations only fire when visible.
 *
 * @param cards NodeList or array of card elements.
 * @param scrollContainer The scrollable parent element (e.g. #main-content).
 */
export function animateCardsOnScroll(
    cards: NodeListOf<Element> | Element[],
    scrollContainer?: HTMLElement
): void {
    if (!cards || (cards as NodeListOf<Element>).length === 0) return;

    const cardArray = Array.from(cards as NodeListOf<Element>);

    cardArray.forEach((card) => {
        gsap.fromTo(card,
            { opacity: 0, y: 40, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: DURATIONS.entrance,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    scroller: scrollContainer || undefined,
                    start: 'top 90%',     // Fires when card top reaches 90% viewport height
                    toggleActions: 'play none none none'  // Play once on enter
                }
            }
        );
    });
}

/**
 * animateCardHoverGlow — Adds a soft glow + scale on card hover.
 * WHEN: Called after cards are rendered. Attaches hover listeners.
 * Returns cleanup functions for memory safety.
 *
 * @param cards NodeList or array of card elements.
 * @returns Array of cleanup functions.
 */
export function animateCardHoverGlow(cards: NodeListOf<Element> | Element[]): (() => void)[] {
    const cleanups: (() => void)[] = [];
    const list = Array.from(cards as NodeListOf<Element>);

    list.forEach(card => {
        const onEnter = () => {
            gsap.to(card, {
                scale: 1.03,
                boxShadow: '0 0 25px rgba(201, 167, 74, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)',
                duration: DURATIONS.fast,
                ease: 'power2.out'
            });
        };
        const onLeave = () => {
            gsap.to(card, {
                scale: 1,
                boxShadow: '0 0 0px rgba(201, 167, 74, 0), 0 0 0px rgba(0, 0, 0, 0)',
                duration: DURATIONS.fast,
                ease: 'power2.out'
            });
        };

        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);

        cleanups.push(() => {
            card.removeEventListener('mouseenter', onEnter);
            card.removeEventListener('mouseleave', onLeave);
            gsap.killTweensOf(card);
        });
    });

    return cleanups;
}

// ===============================
// 6. TABLE ROW ANIMATIONS
// ===============================

/**
 * animateTableRows — Slides track rows in from the left.
 * WHEN: Called after rendering a track list table.
 *
 * @param rows NodeList or array of row elements.
 */
export function animateTableRows(rows: NodeListOf<Element> | Element[]): void {
    if (!rows || (rows as NodeListOf<Element>).length === 0) return;

    gsap.fromTo(rows,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.03, ease: 'power2.out' }
    );
}

// ===============================
// 7. BUTTON ANIMATIONS
// ===============================

/**
 * animateButtonHover — Scale on hover, bounce on click.
 * WHEN: Called after buttons are rendered.
 * Returns cleanup functions for memory safety.
 *
 * @param buttons NodeList or array of button elements.
 * @returns Array of cleanup functions.
 */
export function animateButtonHover(buttons: NodeListOf<Element> | Element[]): (() => void)[] {
    const cleanups: (() => void)[] = [];
    const list = Array.from(buttons as NodeListOf<Element>);

    list.forEach(btn => {
        // Hover: slight scale up
        const onEnter = () => {
            gsap.to(btn, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
        };
        const onLeave = () => {
            gsap.to(btn, { scale: 1, duration: 0.2, ease: 'power2.out' });
        };
        // Click: quick bounce effect using elastic easing
        const onClick = () => {
            gsap.fromTo(btn,
                { scale: 0.92 },
                { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }
            );
        };

        btn.addEventListener('mouseenter', onEnter);
        btn.addEventListener('mouseleave', onLeave);
        btn.addEventListener('click', onClick);

        cleanups.push(() => {
            btn.removeEventListener('mouseenter', onEnter);
            btn.removeEventListener('mouseleave', onLeave);
            btn.removeEventListener('click', onClick);
            gsap.killTweensOf(btn);
        });
    });

    return cleanups;
}

// ===============================
// 8. MODAL ANIMATIONS
// ===============================

/**
 * animateModalIn — Smooth fade + scale entrance for modals/popups.
 * WHEN: Called in mount() of modal views.
 * WHY back.out: Creates a subtle overshoot that makes it feel bouncy and alive.
 *
 * @param modalChildren The children of the modal container element.
 */
export function animateModalIn(modalChildren: HTMLCollection | NodeListOf<Element>): void {
    gsap.fromTo(modalChildren,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: DURATIONS.normal, ease: 'back.out(1.5)' }
    );
}

/**
 * animateModalOut — Reverse: scale down + fade out for modals.
 * WHEN: Called when closing the modal.
 * The onComplete callback is fired after the animation finishes.
 *
 * @param modalChildren The children of the modal container element.
 * @param onComplete Callback to run when animation finishes (e.g. navigate away).
 */
export function animateModalOut(
    modalChildren: HTMLCollection | NodeListOf<Element>,
    onComplete: () => void
): void {
    gsap.to(modalChildren, {
        opacity: 0,
        scale: 0.95,
        duration: DURATIONS.fast,
        ease: 'power2.in',
        onComplete
    });
}

// ===============================
// 9. PAGE TRANSITION
// ===============================

/**
 * animatePageTransition — Crossfade effect for router view changes.
 * WHEN: Called by the Router before swapping views.
 *
 * Phase 1: Fade out old content (opacity → 0, slight upward drift).
 * Phase 2: Callback fires to swap HTML.
 * Phase 3: New content fades in (already handled by the new view's mount()).
 *
 * @param container The main content container element.
 * @param onMidpoint Callback to execute when old content is fully faded out.
 */
export function animatePageTransition(
    container: HTMLElement,
    onMidpoint: () => Promise<void>
): void {
    const children = container.querySelectorAll(':scope > *');

    if (children.length === 0) {
        // Nothing to animate out, just proceed
        onMidpoint();
        return;
    }

    gsap.to(children, {
        opacity: 0,
        y: -10,
        duration: DURATIONS.fast,
        ease: 'power2.in',
        onComplete: () => {
            onMidpoint();
        }
    });
}

// ===============================
// 10. INTERACTIVE HOVER EFFECTS
// ===============================

/**
 * hoverScale — Makes elements grow slightly when hovered.
 * WHEN: Use on any clickable element for a tactile feel.
 * Returns cleanup functions so we can remove listeners safely in destroy().
 *
 * @param elements NodeList or array of elements.
 * @param scale Target scale on hover (default: 1.05).
 * @returns Array of cleanup functions.
 */
export function hoverScale(elements: NodeListOf<Element> | Element[], scale: number = 1.05): (() => void)[] {
    const cleanups: (() => void)[] = [];
    const list = 'length' in elements ? Array.from(elements as NodeListOf<Element>) : [elements as unknown as Element];

    list.forEach(el => {
        const onEnter = () => { gsap.to(el, { scale, duration: 0.25, ease: 'power2.out' }); };
        const onLeave = () => { gsap.to(el, { scale: 1, duration: 0.25, ease: 'power2.out' }); };

        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);

        cleanups.push(() => {
            el.removeEventListener('mouseenter', onEnter);
            el.removeEventListener('mouseleave', onLeave);
            gsap.killTweensOf(el);
        });
    });

    return cleanups;
}

// ===============================
// 11. CONTINUOUS / AMBIENT ANIMATIONS
// ===============================

/**
 * pulseGlow — Continuous subtle glowing shadow outline around an element.
 * WHEN: Used on the play button or active elements.
 * - repeat: -1 → loops forever
 * - yoyo: true → reverses back and forth (pulsing effect)
 *
 * @param element The element to pulse.
 * @returns The GSAP tween (so you can .kill() it later).
 */
export function pulseGlow(element: Element): gsap.core.Tween {
    return gsap.to(element, {
        boxShadow: '0 0 25px rgba(201, 167, 74, 0.5)',
        repeat: -1,
        yoyo: true,
        duration: 1.5,
        ease: 'sine.inOut'
    });
}

/**
 * vinylSpin — Spins an element 360° forever (vinyl record effect).
 * WHEN: Used on the album art in Now Playing overlay.
 *
 * @param element The element to spin.
 * @returns The GSAP tween (so you can .kill() it later).
 */
export function vinylSpin(element: Element): gsap.core.Tween {
    return gsap.to(element, {
        rotation: 360,
        repeat: -1,
        duration: 8,
        ease: 'linear'
    });
}

/**
 * animateFloatingBg — Subtle floating animation for ambient background elements.
 * WHEN: Called once on initial app load for background decoration.
 * Creates gentle drifting particles/shapes behind the main content.
 *
 * @param container The body or app-level container.
 * @returns The GSAP tween (so you can .kill() it later).
 */
export function animateFloatingBg(container: HTMLElement): gsap.core.Tween {
    // We animate the ::after pseudo-element via the container itself
    // The ambient-gradient class in style.css already has the gradient shapes
    return gsap.to(container, {
        '--ambient-x': '3%',
        '--ambient-y': '4%',
        '--ambient-rotate': '5deg',
        repeat: -1,
        yoyo: true,
        duration: 15,
        ease: 'sine.inOut'
    });
}

// ===============================
// 12. SINGLE ELEMENT HELPERS
// ===============================

/**
 * fadeIn — Simple fade-in for a single element.
 * WHEN: Use for any generic reveal animation.
 *
 * @param element The element to fade in.
 * @param delay Optional delay before the animation starts.
 */
export function fadeIn(element: Element, delay: number = 0): void {
    gsap.fromTo(element,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: DURATIONS.normal, delay, ease: 'power2.out' }
    );
}

// ===============================
// 13. ANIMATION CLEANUP
// ===============================

/**
 * cleanupAnimations — MUST be called when leaving a page.
 * Stops all running GSAP animations inside a container to prevent
 * memory leaks and ghost animations running in the background.
 *
 * @param container The container element whose animations to kill.
 */
export function cleanupAnimations(container: HTMLElement): void {
    // Kill all ScrollTrigger instances scoped to this container
    ScrollTrigger.getAll().forEach(trigger => {
        if (container.contains(trigger.trigger as Element)) {
            trigger.kill();
        }
    });

    gsap.killTweensOf(container.querySelectorAll('*'));
    gsap.killTweensOf(container);
}
