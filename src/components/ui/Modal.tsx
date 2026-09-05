import { useEffect, useId, useRef } from 'react';

import { Button } from '@/components/ui/Button';

import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  /** Called for every way out: Escape, the close button, or a programmatic close. */
  onClose: () => void;
  children: ReactNode;
}

/**
 * A native `<dialog>` opened with `showModal()`, so the focus trap, focus restore, Escape, and
 * the inert background all come from the platform rather than from an effect (R-F7).
 */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    // `close` does not bubble, so it is listened for on the element itself. Escape reaches here
    // through it, which is why there is no key handler anywhere in this file.
    dialog.addEventListener('close', onClose);

    return () => {
      dialog.removeEventListener('close', onClose);
    };
  }, [onClose]);

  /** The page behind is inert but still scrollable, which reads as the modal drifting. */
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      // Tailwind's preflight drops the user-agent `margin: auto`, so the centring is restored here.
      className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-ink bg-paper text-ink backdrop:bg-ink/40"
    >
      <div className="flex items-baseline justify-between gap-6 border-b border-line px-6 py-4">
        <h2 id={headingId} className="font-serif text-xl">
          {title}
        </h2>
        <Button variant="text" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Mounted only while open, so a form inside opens with fresh values every time. */}
      {open && <div className="px-6 py-6">{children}</div>}
    </dialog>
  );
}
