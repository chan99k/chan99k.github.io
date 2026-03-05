/**
 * Tag taxonomy based on PARA methodology.
 *
 * - 1tier: PARA categories (Projects / Areas / Resources / Archives)
 * - 2tier: predefined children per PARA category
 * - 3tier+: free-form (no validation)
 */

export type TierColor = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'teal';

export interface Tier1Category {
	color: TierColor;
	children: string[];
}

export const TAG_TAXONOMY = {
	Projects: {
		color: 'teal',
		children: ['blogs', 'giftify'],
	},
	Areas: {
		color: 'blue',
		children: ['개발', 'architecture', 'infra'],
	},
	Resources: {
		color: 'amber',
		children: ['translations'],
	},
	Archives: {
		color: 'rose',
		children: ['til', 'thoughts'],
	},
} as const satisfies Record<string, Tier1Category>;

export type Tier1Name = keyof typeof TAG_TAXONOMY;
export type Tier2Name = typeof TAG_TAXONOMY[Tier1Name]['children'][number];

/** 2tier color overrides — when a 2tier tag needs a color different from its parent 1tier */
export const TIER2_COLORS: Partial<Record<string, TierColor>> = {
	'architecture': 'violet',
	'infra': 'emerald',
};

/** Resolve the display color for a tag (looks up 2tier override, falls back to 1tier) */
export function getTagColor(tag: string): TierColor {
	const segments = tag.split('/');
	const tier1 = segments[0];
	const tier2 = segments[1];

	if (tier2 && TIER2_COLORS[tier2]) {
		return TIER2_COLORS[tier2]!;
	}

	const category = TAG_TAXONOMY[tier1];
	return category?.color ?? 'blue';
}

/** All valid 1tier names */
export function getTier1Names(): string[] {
	return Object.keys(TAG_TAXONOMY);
}

/** All valid 2tier names for a given 1tier */
export function getTier2Names(tier1: string): string[] {
	return TAG_TAXONOMY[tier1]?.children ?? [];
}

/** Tailwind color classes mapped by TierColor */
export const COLOR_CLASSES: Record<TierColor, string> = {
	blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
	emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
	violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
	amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
	rose: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
	teal: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
};
