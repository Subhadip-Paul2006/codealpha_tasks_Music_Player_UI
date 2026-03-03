/**
 * ========================================================================
 * COMPONENT SHEET VIEW — "COMING SOON" PAGE
 * ========================================================================
 *
 * This view replaces the old Component Sheet demo page with a clean,
 * minimal "Coming Soon" placeholder. It uses GSAP animations for a
 * premium entrance feel that matches the Chillz Time aesthetic.
 */

// ===============================
// 1. IMPORTS
// ===============================
import { View } from '../types/View';
import { cleanupAnimations } from '../utils/animations';
import gsap from 'gsap';

// ===============================
// 2. COMPONENT CLASS
// ===============================
export class ComponentSheet implements View {
  private container: HTMLElement | null = null;
  private floatingTween: gsap.core.Tween | null = null;

  mount(container: HTMLElement): void {
    this.container = container;
    this.render();
    this.animateEntry();
  }

  destroy(): void {
    // Kill the continuously looping floating animation
    if (this.floatingTween) {
      this.floatingTween.kill();
      this.floatingTween = null;
    }
    if (this.container) {
      cleanupAnimations(this.container);
      this.container.innerHTML = '';
    }
  }

  // ===============================
  // 3. UI RENDERING
  // ===============================
  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full w-full min-h-[calc(100vh-5.5rem)] select-none px-6">

        <!-- Ambient glow behind the icon — a soft radial gradient -->
        <div class="absolute pointer-events-none opacity-30"
             style="width: 320px; height: 320px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(201,167,74,0.15) 0%, transparent 70%);
                    filter: blur(40px);">
        </div>

        <!-- Animated music icon -->
        <div class="relative mb-8" id="coming-soon-icon">
          <div class="size-24 rounded-full border border-primary/20 flex items-center justify-center
                      bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-sm
                      shadow-[0_0_40px_rgba(201,167,74,0.1)]">
            <span class="material-symbols-outlined text-primary text-5xl"
                  style="font-variation-settings: 'FILL' 1">music_note</span>
          </div>
          <!-- Subtle ring pulse -->
          <div class="absolute inset-0 rounded-full border border-primary/10 animate-ping"
               style="animation-duration: 3s;"></div>
        </div>

        <!-- Heading -->
        <h1 class="font-serif text-5xl lg:text-6xl text-white mb-4 text-center" id="coming-soon-title">
          Coming Soon
        </h1>

        <!-- Subtext -->
        <p class="font-sora text-base lg:text-lg text-white/40 text-center max-w-md leading-relaxed mb-6" id="coming-soon-sub">
          We're building something amazing for you.
        </p>

        <!-- Decorative divider -->
        <div class="w-16 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent mb-6" id="coming-soon-divider"></div>

        <!-- Tiny tag line -->
        <p class="font-sora text-xs text-primary/50 tracking-[0.3em] uppercase" id="coming-soon-tag">
          Stay Tuned
        </p>

      </div>
    `;
  }

  // ===============================
  // 4. GSAP ANIMATIONS
  // ===============================

  /**
   * Premium entrance sequence:
   * 1. Icon scales + fades in first
   * 2. Title slides up + fades in
   * 3. Subtext fades in with stagger
   * 4. Divider + tag fade in last
   * 5. Icon enters a continuous gentle float loop
   *
   * WHY power3.out: Fast start → smooth deceleration, feels premium.
   * WHY stagger: Each element appears one by one, draws the eye down the page.
   */
  private animateEntry(): void {
    if (!this.container) return;

    const icon = this.container.querySelector('#coming-soon-icon');
    const title = this.container.querySelector('#coming-soon-title');
    const sub = this.container.querySelector('#coming-soon-sub');
    const divider = this.container.querySelector('#coming-soon-divider');
    const tag = this.container.querySelector('#coming-soon-tag');

    // Build a timeline so animations play in sequence
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Step 1: Icon pops in with scale
    if (icon) {
      tl.fromTo(icon,
        { opacity: 0, scale: 0.6, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1.0 }
      );
    }

    // Step 2: Title slides up
    if (title) {
      tl.fromTo(title,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'  // Overlap with previous by 0.5s for fluidity
      );
    }

    // Step 3: Subtext fades in
    if (sub) {
      tl.fromTo(sub,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.4'
      );
    }

    // Step 4: Divider stretches in
    if (divider) {
      tl.fromTo(divider,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.6 },
        '-=0.3'
      );
    }

    // Step 5: Tag line fades in
    if (tag) {
      tl.fromTo(tag,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.2'
      );
    }

    // Step 6: Continuous gentle float on the icon
    // WHY sine.inOut + yoyo: Creates a smooth breathing/floating effect
    if (icon) {
      this.floatingTween = gsap.to(icon, {
        y: -12,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2  // Start floating after entrance animation finishes
      });
    }
  }
}
