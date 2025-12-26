export function triggerHaptic(): void {
  console.log("triggerHaptic");
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
}
