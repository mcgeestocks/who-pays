const HAPTIC_LABEL_SELECTOR = 'label[for="ios-haptic-switch"]';

export function triggerHaptic(): void {
  const label = document.querySelector<HTMLLabelElement>(HAPTIC_LABEL_SELECTOR);
  if (label) {
    label.click();
  }

  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
}
