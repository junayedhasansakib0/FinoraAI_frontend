import { useState } from 'react';

import { ARABIC_SOURCE, AYAHS, TRANSLATION_SOURCE } from './ayah-data';
import { ayahReference, dailyIndex, nextIndex } from './select-ayah';

/**
 * A calm dashboard card showing one verse of the Qur'an: the Arabic (right-to-left, in an Arabic
 * face), an English translation, and the citation. The verse is chosen by the local calendar day
 * (see `dailyIndex`) so it is stable through a session and turns over at midnight; "Another ayah"
 * steps through the set locally. Nothing here fetches — the dataset is bundled and verified
 * (see `ayah-data.ts`), so the card never touches the network and cannot slow the dashboard or
 * fail on an upstream error.
 *
 * The card is intentionally isolated from `DashboardPage`: it owns its own state and data and is
 * dropped in as a single element, so the finance view carries no reflection logic.
 *
 * Visual: a boxed surface (rounded, hairline `border-line`, a faint lift) sitting at the top of the
 * dashboard. All colour comes from the design tokens, so it follows the theme rather than pinning
 * its own palette. The Arabic is deliberately restrained in size — legible with room for the
 * harakat, but small enough that the card never pushes the financial summary far down the page.
 */
export function DailyAyahCard() {
  // Empty set → render nothing rather than an empty frame. Defensive; the bundle is non-empty.
  const [index, setIndex] = useState(() => dailyIndex(new Date(), AYAHS.length));

  const ayah = AYAHS[index] ?? AYAHS[0];
  if (ayah === undefined) return null;

  const reference = ayahReference(ayah);
  const showAnother = AYAHS.length > 1;

  return (
    <section
      aria-labelledby="ayah-heading"
      className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6"
    >
      <p
        id="ayah-heading"
        className="text-xs font-medium uppercase tracking-[0.18em] text-muted"
      >
        Daily reminder
      </p>

      {/*
        Arabic is the only right-to-left region on the page, so the direction and language are set
        here and nowhere wider — the card itself stays left-to-right. `font-arabic` selects the
        Arabic face; the size stays modest and the leading gives the harakat just enough room.
      */}
      <p
        dir="rtl"
        lang="ar"
        className="mt-4 text-right font-arabic text-2xl leading-[1.85] text-ink sm:text-3xl"
      >
        {ayah.arabic}
      </p>

      <p lang="en" className="mt-4 font-serif text-base leading-relaxed text-ink-soft">
        {ayah.translation}
      </p>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line pt-3">
        <p className="text-sm text-ink-soft tabular-nums">
          {ayah.surahName}
          <span aria-hidden="true"> · </span>
          {reference}
        </p>

        {showAnother && (
          <button
            type="button"
            onClick={() => setIndex((current) => nextIndex(current, AYAHS.length))}
            className="shrink-0 text-sm text-muted underline underline-offset-4 transition-colors hover:text-ink"
          >
            Another ayah
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-muted">
        Translation: {TRANSLATION_SOURCE.translator} ({TRANSLATION_SOURCE.language})
        <span aria-hidden="true"> · </span>
        Arabic:{' '}
        <a
          href={ARABIC_SOURCE.url}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-ink"
        >
          {ARABIC_SOURCE.label}
        </a>
      </p>
    </section>
  );
}
