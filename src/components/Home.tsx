import type { JSX } from "preact";

type HomeProps = {
  onStart: () => void;
};

export function Home({ onStart }: HomeProps): JSX.Element {
  return (
    <section class="flex flex-1 flex-col gap-6">
      <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <h2 class="text-lg font-semibold">
          Single-screen, multi-touch chooser
        </h2>
        <p class="text-sm text-slate-600">
          Everyone holds a circle. The ring jumps and lands on a winner.
        </p>
      </div>
      <div class="flex flex-col gap-3">
        <button
          class="rounded-xl bg-slate-900 px-4 py-3 text-white"
          onClick={onStart}
        >
          Start Game
        </button>
      </div>
    </section>
  );
}
