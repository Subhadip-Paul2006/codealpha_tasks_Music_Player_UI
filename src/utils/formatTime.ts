/**
 * ========================================================================
 * UTILITY: FORMAT TIME
 * ========================================================================
 * 
 * This helper function converts raw seconds (e.g., 125) into a 
 * readable minute:second string format (e.g., "02:05").
 * 
 * @param seconds The total number of seconds
 * @returns A formatted string like "03:45"
 */
export function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
