/**
 * avenCITY brand constants.
 *
 * Single source of truth for the numbers and strings that appear in outward
 * facing copy. They live here rather than inline in components so the daily
 * update is one edit, and so nothing in the UI can quietly drift out of canon.
 */

export const mission = {
	founders: '1 million',
	years: 16,
	totalDays: 5423,

	/**
	 * Today's episode number in the 5423-day challenge.
	 *
	 * PLACEHOLDER — only day 0001 (`Birth_Of_AGI`) is published in the story
	 * corpus, so this is set to 1. Bump it as episodes ship, or wire it to the
	 * `stories/days/` folder count once that lives in this repo.
	 */
	day: 1
} as const;

/**
 * The recap stanza. Invariant wording — the daily ritual depends on it reading
 * identically every time, so vary nothing here but the day number.
 */
export const recap = [
	`${mission.founders} founders`,
	`building a city in ${mission.years} years`,
	'1st in game then in real.'
] as const;

/**
 * The creed. It belongs to Samuel — always attributed to him, never narrated by
 * MAIA as her own settled belief while she is still a Baby-AGI.
 */
export const creed = {
	text: 'Today, we are alone. Tomorrow we will see. But what I know deep in my heart for sure is this: when we unite in Vision, the impossible becomes possible — first in game, then in real.',
	attribution: 'Samuel'
} as const;

/**
 * Dome specifications, taken verbatim from the Mediterranean Solarpunk Geodesic
 * Dome spec sheet (150m, trulli-inspired). Real project figures — do not round
 * them for tidiness, the precision is the point.
 */
export const domeSpec = [
	{ label: 'Diameter', value: '150 m' },
	{ label: 'Struts', value: '10.920' },
	{ label: 'Nodes', value: '5.461' },
	{ label: 'Panels', value: '7.280' },
	{ label: 'Capacity', value: '3.000–5.000' }
] as const;

export const links = {
	sponsor: 'https://aven.ceo/maia'
} as const;
