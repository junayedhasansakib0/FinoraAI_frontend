/**
 * Verified Quran dataset for the dashboard Ayah card.
 *
 * PROVENANCE (verified this build, not assumed):
 * - Arabic text: Tanzil Uthmani (`quran-uthmani`), pulled via the AlQuran Cloud API and stored
 *   here verbatim. The Tanzil Project permits redistribution of an UNMODIFIED copy with
 *   attribution to tanzil.net; the text below is copied byte-for-byte and is never altered at
 *   runtime. See {@link ARABIC_SOURCE}.
 * - English translation: Marmaduke Pickthall, "The Meaning of the Glorious Koran" — public
 *   domain. See {@link TRANSLATION_SOURCE}.
 *
 * The set is a small curation of reflective verses (gratitude, patience, provision, moderation
 * in spending, reliance, hope) chosen to suit a personal-finance context. It ships as a static
 * bundle so the card makes NO network request — selection is fully local (see `select-ayah.ts`).
 */

export interface Ayah {
  /** 1-based surah (chapter) number. */
  surahNumber: number;
  /** Surah name in Latin transliteration, e.g. "Al-Baqara". */
  surahName: string;
  /** Surah name in Arabic, e.g. "سُورَةُ البَقَرَةِ". */
  surahNameArabic: string;
  /** 1-based ayah (verse) number within the surah. */
  ayahNumber: number;
  /** Arabic verse text (Tanzil Uthmani), verbatim. */
  arabic: string;
  /** English translation (Pickthall), verbatim. */
  translation: string;
}

/** Attribution for the Arabic source — rendered in the card and required by the Tanzil terms. */
export const ARABIC_SOURCE = {
  label: 'Tanzil Uthmani',
  project: 'Tanzil Project',
  url: 'https://tanzil.net',
} as const;

/** Attribution for the translation — shown so the reader knows which rendering they are reading. */
export const TRANSLATION_SOURCE = {
  translator: 'Pickthall',
  language: 'English',
  note: 'Public domain',
} as const;

/**
 * Eleven verified verses. Order is not significant — selection is deterministic by day
 * (see `select-ayah.ts`) — but each entry's fields correspond exactly to its cited reference.
 */
export const AYAHS: readonly Ayah[] = [
  {
    surahNumber: 65,
    surahName: 'At-Talaaq',
    surahNameArabic: 'سُورَةُ الطَّلَاقِ',
    ayahNumber: 3,
    arabic:
      'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ ۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمْرِهِۦ ۚ قَدْ جَعَلَ ٱللَّهُ لِكُلِّ شَىْءٍۢ قَدْرًۭا',
    translation:
      'And will provide for him from (a quarter) whence he hath no expectation. And whosoever putteth his trust in Allah, He will suffice him. Lo! Allah bringeth His command to pass. Allah hath set a measure for all things.',
  },
  {
    surahNumber: 94,
    surahName: 'Ash-Sharh',
    surahNameArabic: 'سُورَةُ الشَّرۡحِ',
    ayahNumber: 6,
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا',
    translation: 'Lo! with hardship goeth ease;',
  },
  {
    surahNumber: 14,
    surahName: 'Ibrahim',
    surahNameArabic: 'سُورَةُ إِبۡرَاهِيمَ',
    ayahNumber: 7,
    arabic:
      'وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِى لَشَدِيدٌۭ',
    translation:
      'And when your Lord proclaimed: If ye give thanks, I will give you more; but if ye are thankless, lo! My punishment is dire.',
  },
  {
    surahNumber: 2,
    surahName: 'Al-Baqara',
    surahNameArabic: 'سُورَةُ البَقَرَةِ',
    ayahNumber: 152,
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ',
    translation:
      'Therefore remember Me, I will remember you. Give thanks to Me, and reject not Me.',
  },
  {
    surahNumber: 13,
    surahName: "Ar-Ra'd",
    surahNameArabic: 'سُورَةُ الرَّعۡدِ',
    ayahNumber: 28,
    arabic:
      'ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translation:
      'Who have believed and whose hearts have rest in the remembrance of Allah. Verily in the remembrance of Allah do hearts find rest!',
  },
  {
    surahNumber: 39,
    surahName: 'Az-Zumar',
    surahNameArabic: 'سُورَةُ الزُّمَرِ',
    ayahNumber: 53,
    arabic:
      '۞ قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ',
    translation:
      'Say: O My slaves who have been prodigal to their own hurt! Despair not of the mercy of Allah, Who forgiveth all sins. Lo! He is the Forgiving, the Merciful.',
  },
  {
    surahNumber: 25,
    surahName: 'Al-Furqaan',
    surahNameArabic: 'سُورَةُ الفُرۡقَانِ',
    ayahNumber: 67,
    arabic:
      'وَٱلَّذِينَ إِذَآ أَنفَقُوا۟ لَمْ يُسْرِفُوا۟ وَلَمْ يَقْتُرُوا۟ وَكَانَ بَيْنَ ذَٰلِكَ قَوَامًۭا',
    translation:
      'And those who, when they spend, are neither prodigal nor grudging; and there is ever a firm station between the two;',
  },
  {
    surahNumber: 93,
    surahName: 'Ad-Dhuhaa',
    surahNameArabic: 'سُورَةُ الضُّحَىٰ',
    ayahNumber: 5,
    arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ',
    translation: 'And verily thy Lord will give unto thee so that thou wilt be content.',
  },
  {
    surahNumber: 16,
    surahName: 'An-Nahl',
    surahNameArabic: 'سُورَةُ النَّحۡلِ',
    ayahNumber: 97,
    arabic:
      'مَنْ عَمِلَ صَٰلِحًۭا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌۭ فَلَنُحْيِيَنَّهُۥ حَيَوٰةًۭ طَيِّبَةًۭ ۖ وَلَنَجْزِيَنَّهُمْ أَجْرَهُم بِأَحْسَنِ مَا كَانُوا۟ يَعْمَلُونَ',
    translation:
      'Whosoever doeth right, whether male or female, and is a believer, him verily we shall quicken with good life, and We shall pay them a recompense in proportion to the best of what they used to do.',
  },
  {
    surahNumber: 3,
    surahName: 'Aal-i-Imraan',
    surahNameArabic: 'سُورَةُ آلِ عِمۡرَانَ',
    ayahNumber: 139,
    arabic: 'وَلَا تَهِنُوا۟ وَلَا تَحْزَنُوا۟ وَأَنتُمُ ٱلْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    translation:
      'Faint not nor grieve, for ye will overcome them if ye are (indeed) believers.',
  },
  {
    surahNumber: 17,
    surahName: 'Al-Israa',
    surahNameArabic: 'سُورَةُ الإِسۡرَاءِ',
    ayahNumber: 26,
    arabic:
      'وَءَاتِ ذَا ٱلْقُرْبَىٰ حَقَّهُۥ وَٱلْمِسْكِينَ وَٱبْنَ ٱلسَّبِيلِ وَلَا تُبَذِّرْ تَبْذِيرًا',
    translation:
      'Give the kinsman his due, and the needy, and the wayfarer, and squander not (thy wealth) in wantonness.',
  },
];
