export interface Count {
	name: string;
	clicks: number;
}

/** What the expanded row on /links shows for one link. */
export interface LinkDetail {
	/** Old and new referrers merged by source, most clicks first. */
	referrers: Count[];
	/** Clicks from referrers past the top few. */
	other_referrers: number;
	/** People since click events started; bots are counted apart. */
	people: number;
	people_30_days: number;
	bots: number;
	countries: Count[];
	devices: Count[];
}

/** One visible link as /links renders it. */
export interface LinkRow {
	id: number;
	source: string;
	destination: string;
	description: string | null;
	clicks: number;
	detail: LinkDetail | null;
}
