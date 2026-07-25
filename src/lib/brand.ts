/**
 * avenCITY brand + game constants.
 *
 * Single source of truth for the figures shown in outward-facing copy. They
 * mirror the reference game board (Year 24 save) so every number on the site
 * is a real one from the game, not marketing filler. Update here, not inline.
 */

export const tagline = 'Build. Invest. Connect. Prosper.' as const;

export const pitch =
	'avenCITY is a founder’s simulator for the post-AGI world. Go all in on your idea in a city where the risk is simulated and the lessons are real: found your venture as a district, ignite sparks with your capital, connect routes — and build income streams that pay you back, hour after hour.' as const;

/** Top-bar resources, with per-hour accrual. */
export const resources = [
	{ label: 'Capital', value: '$ 248,750', rate: '+12,540 /h' },
	{ label: 'Energy', value: '12,540', rate: '+420 /h' },
	{ label: 'Materials', value: '8,320', rate: '+310 /h' },
	{ label: 'Technology', value: '4,680', rate: '+180 /h' },
	{ label: 'Influence', value: '2,150', rate: '+90 /h' }
] as const;

export const overview = {
	cityValue: '$ 1,248,750',
	population: '12,540',
	happiness: '82%',
	rating: 'IV',
	year: 24,
	season: 'Autumn'
} as const;

/** Sparks: capital invested into a district that yields income per hour. */
export const sparks = {
	active: '8 / 8',
	createCost: '$ 25,000',
	list: [
		{ name: 'Industry Spark', rate: '+$ 120 /h' },
		{ name: 'Trade Spark', rate: '+$ 95 /h' },
		{ name: 'Tech Spark', rate: '+$ 80 /h' },
		{ name: 'Agriculture Spark', rate: '+$ 60 /h' }
	]
} as const;

/** Income streams: what the city pays back, per sector. */
export const incomeStreams = {
	total: '$ 4,290 /h',
	list: [
		{ sector: 'Manufacturing', rate: '$ +1,280 /h' },
		{ sector: 'Commerce', rate: '$ +980 /h' },
		{ sector: 'Technology', rate: '$ +760 /h' },
		{ sector: 'Agriculture', rate: '$ +540 /h' },
		{ sector: 'Energy', rate: '$ +420 /h' },
		{ sector: 'Services', rate: '$ +310 /h' }
	]
} as const;

/**
 * The prize — the one bridge from simulation to reality. The best players
 * don't just win the game.
 */
export const prize = {
	eyebrow: 'The stakes are real',
	headline: 'The best founders leave the game funded.',
	copy: 'avenCITY is a proving ground. Top players win real-world angel investment and strategic co-founding support — incorporation included. Build the strongest city, and your idea walks out of the simulation with backing.'
} as const;

/** Districts on the Year-24 map, with their levels. */
export const districts = [
	{ name: 'Avenhall', level: 5 },
	{ name: 'Aurelia', level: 4 },
	{ name: 'Brighthold', level: 4 },
	{ name: 'Northgate', level: 3 },
	{ name: 'Riverdale', level: 3 },
	{ name: 'Southpoint', level: 2 }
] as const;
