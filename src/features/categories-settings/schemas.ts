import { z } from 'zod';

/**
 * Mirrors `server/src/modules/categories/categories.validation.ts` (§7). The name cap is the same
 * 60 characters the API and the profile name use (R-V4).
 */

const NAME_MAX = 60;

const name = z
  .string()
  .trim()
  .min(1, 'Enter a name.')
  .max(NAME_MAX, `Use ${String(NAME_MAX)} characters or fewer.`);

/** Only the name is editable: moving a category between types would rewrite its history. */
export const renameCategorySchema = z.object({ name });

export const createCategorySchema = z.object({ name, type: z.enum(['income', 'expense']) });

export const FIELD_LIMITS = { name: NAME_MAX } as const;

export type RenameCategoryValues = z.infer<typeof renameCategorySchema>;
export type CreateCategoryValues = z.infer<typeof createCategorySchema>;
