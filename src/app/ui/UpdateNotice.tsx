import type { JSX } from "preact";

interface UpdateNoticeProps {
  onRefresh: () => void;
  onDismiss: () => void;
}

export function UpdateNotice({
  onRefresh,
  onDismiss,
}: UpdateNoticeProps): JSX.Element {
  return (
    <section class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-700">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>Update available. Refresh to get the latest version.</span>
        <div class="flex gap-2">
          <button
            class="rounded-xl bg-slate-900 px-3 py-2 text-white"
            onClick={onRefresh}
          >
            Refresh
          </button>
          <button
            class="rounded-xl border border-slate-200 px-3 py-2"
            onClick={onDismiss}
          >
            Later
          </button>
        </div>
      </div>
    </section>
  );
}
