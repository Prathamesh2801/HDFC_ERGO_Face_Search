import { CloseIcon, DownloadIcon, SelectAllIcon } from "@/components/ui/Icons";
import { Portal } from "@/components/ui/Portal";

/**
 * Sticky action bar for selection mode.
 *
 * Portalled so `fixed` resolves against the viewport — AppLayout's transform
 * and backdrop-filter would otherwise trap it mid-page on iOS — and padded past
 * the safe-area inset so it clears the home indicator.
 */
export function SelectionBar({
  count,
  total,
  busy,
  onSelectAll,
  onClear,
  onDownload,
}) {
  const allSelected = count === total;

  return (
    <Portal>
      <div className="fixed inset-x-0 bottom-0 z-40 animate-fade-up px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="mx-auto flex max-w-xl items-center gap-2 rounded-full bg-ink-900/95 p-2 pl-4 text-white shadow-card backdrop-blur">
          <button
            type="button"
            onClick={onClear}
            aria-label="Exit selection"
            className="grid size-9 shrink-0 place-items-center rounded-full transition hover:bg-white/15"
          >
            <CloseIcon className="size-4" />
          </button>

          <span className="flex-1 text-sm font-semibold tabular-nums">
            {count} selected
          </span>

          <button
            type="button"
            onClick={onSelectAll}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition hover:bg-white/15"
          >
            <SelectAllIcon className="size-4" />
            {allSelected ? "None" : "All"}
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={!count || busy}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-xs font-semibold transition hover:bg-brand-500 disabled:opacity-50"
          >
            {busy ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <DownloadIcon className="size-4" />
            )}
            Save
          </button>
        </div>
      </div>
    </Portal>
  );
}
