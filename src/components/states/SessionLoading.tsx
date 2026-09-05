/** Shown while the boot `GET /auth/me` decides whether anyone is signed in. */
export function SessionLoading() {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center px-6">
      <p className="flex items-center gap-3 text-sm text-muted">
        <span
          aria-hidden="true"
          className="size-2 rounded-full bg-muted motion-safe:animate-pulse"
        />
        Restoring your session
      </p>
    </div>
  );
}
