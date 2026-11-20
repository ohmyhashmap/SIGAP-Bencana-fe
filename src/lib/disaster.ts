// Harus sama dengan REPORT_CATEGORIES di source backend repository BE.
export const DISASTER_CATEGORIES = [
	{ value: 'banjir', label: 'Banjir', icon: '🌊' },
	{ value: 'longsor', label: 'Tanah Longsor', icon: '⛰️' },
	{ value: 'gempa', label: 'Gempa Bumi', icon: '🏚️' },
	{ value: 'karhutla', label: 'Kebakaran Hutan/Lahan', icon: '🔥' },
	{ value: 'erupsi', label: 'Erupsi Gunung Api', icon: '🌋' },
	{ value: 'cuaca', label: 'Cuaca Ekstrem', icon: '🌪️' },
	{ value: 'lainnya', label: 'Lainnya', icon: '⚠️' }
] as const;

export type DisasterCategory = (typeof DISASTER_CATEGORIES)[number];

const FALLBACK = DISASTER_CATEGORIES.at(-1)!;

/** Data jenis bencana; laporan lama tanpa kategori dianggap "Lainnya". */
export function disasterCategory(value?: string | null): DisasterCategory {
	return DISASTER_CATEGORIES.find((category) => category.value === value) ?? FALLBACK;
}
