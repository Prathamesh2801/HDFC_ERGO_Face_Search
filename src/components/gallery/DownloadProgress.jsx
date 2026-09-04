import { Portal } from "@/components/ui/Portal";

/** Blocking overlay shown while a bulk download walks the queue. */
export function DownloadProgress({ done, total, onCancel }) {
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <Portal>
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-50 grid place-items-center overscroll-contain bg-ink-900/70 px-6 backdrop-blur-sm"
        style={{ height: "100dvh" }}
      >
        <div className="w-full max-w-xs rounded-card bg-white p-6 text-center shadow-card">
          <p className="text-base font-bold text-ink-900">Saving your photos</p>
          <p className="mt-1 text-sm tabular-nums text-ink-400">
            {done} of {total}
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream-200">
            <div
              className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Keep this screen open. Your browser may ask permission to save
            multiple files.
          </p>

          <button
            type="button"
            onClick={onCancel}
            className="mt-4 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </Portal>
  );
}
