/**
 * Haptic feedback simulation via the Web Vibration API.
 * Silently no-ops on unsupported devices.
 */

function vibrate(pattern) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/** Light tap — for checking off a set */
export function hapticLight() {
  vibrate(10);
}

/** Medium tap — for adding an exercise or set */
export function hapticMedium() {
  vibrate(30);
}

/** Success — for finishing a workout or hitting a PR */
export function hapticSuccess() {
  vibrate([40, 60, 40]);
}

/** Warning — for timer end or rest complete */
export function hapticAlert() {
  vibrate([200, 100, 200]);
}

/** Error / destructive action */
export function hapticError() {
  vibrate([100, 50, 100, 50, 100]);
}
