import { createHash, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import * as v from 'valibot';
import { links_store } from './links.js';

// Top-level routes that would shadow a link with the same source.
const reserved_sources = ['api', 'health', 'links'];

const source = v.pipe(
	v.string(),
	v.trim(),
	v.regex(
		/^[A-Za-z0-9][A-Za-z0-9_-]*$/,
		'source must be letters, numbers, - or _',
	),
	v.maxLength(255),
	v.check(
		(value) => !reserved_sources.includes(value.toLowerCase()),
		`source cannot be ${reserved_sources.join(', ')}`,
	),
);

const destination = v.pipe(
	v.string(),
	v.trim(),
	v.url('destination must be a URL'),
	v.maxLength(2048),
);

const link_fields = {
	description: v.optional(v.nullable(v.pipe(v.string(), v.trim()))),
	position: v.optional(v.nullable(v.pipe(v.number(), v.integer()))),
	visible: v.optional(v.boolean()),
};

const add_schema = v.object({ source, destination, ...link_fields });

const update_schema = v.object({
	source: v.string(),
	changes: v.object({
		source: v.optional(source),
		destination: v.optional(destination),
		...link_fields,
	}),
});

const delete_schema = v.object({ source: v.string() });

export class TaskError extends Error {
	constructor(
		message: string,
		readonly status: number,
	) {
		super(message);
	}
}

const tasks = {
	list_links: (db: DatabaseSync) => links_store(db).list(),

	add_link: (db: DatabaseSync, data: unknown) => {
		const input = v.parse(add_schema, data);
		const links = links_store(db);
		if (links.by_source(input.source))
			throw new TaskError(`/${input.source} already exists.`, 409);
		return links.add(input);
	},

	update_link: (db: DatabaseSync, data: unknown) => {
		const { source, changes } = v.parse(update_schema, data);
		const links = links_store(db);
		if (
			changes.source &&
			changes.source !== source &&
			links.by_source(changes.source)
		)
			throw new TaskError(`/${changes.source} already exists.`, 409);
		const link = links.update(source, changes);
		if (!link) throw new TaskError(`No link /${source}.`, 404);
		return link;
	},

	delete_link: (db: DatabaseSync, data: unknown) => {
		const { source } = v.parse(delete_schema, data);
		if (!links_store(db).remove(source))
			throw new TaskError(`No link /${source}.`, 404);
		return { deleted: source };
	},
};

type TaskName = keyof typeof tasks;

const is_task_name = (name: string): name is TaskName =>
	Object.hasOwn(tasks, name);

const body_schema = v.object({
	task: v.pipe(v.string(), v.maxLength(100)),
	data: v.optional(v.unknown()),
});

const no_store = { 'Cache-Control': 'no-store' };
const reply = (body: unknown, status = 200) =>
	Response.json(body, { status, headers: no_store });

/** Compares digests, so neither the length nor the bytes leak by timing. */
function token_matches(header: string | null, token: string) {
	const given = /^Bearer (.+)$/.exec(header ?? '')?.[1];
	if (!given) return false;
	const digest = (value: string) =>
		createHash('sha256').update(value).digest();
	return timingSafeEqual(digest(given), digest(token));
}

/**
 * `POST /api/ingest {"task": "...", "data": ...}` with
 * `Authorization: Bearer $INGEST_TOKEN`. Authorises before reading the
 * body, so task names cannot be probed.
 */
export async function handle_ingest(
	request: Request,
	token: string | undefined,
	get_db: () => DatabaseSync,
) {
	if (!token || token.length < 32)
		return reply({ message: 'Ingest is not configured.' }, 503);
	if (!token_matches(request.headers.get('authorization'), token))
		return reply({ message: 'Unauthorised' }, 401);

	let body: v.InferOutput<typeof body_schema>;
	try {
		body = v.parse(body_schema, await request.json());
	} catch {
		return reply(
			{ message: 'Send {"task": "<name>"} as JSON.' },
			400,
		);
	}
	if (!is_task_name(body.task))
		return reply(
			{
				message: 'No such task.',
				tasks: Object.keys(tasks),
			},
			400,
		);

	try {
		return reply(tasks[body.task](get_db(), body.data));
	} catch (error) {
		if (error instanceof TaskError)
			return reply({ message: error.message }, error.status);
		if (v.isValiError(error))
			return reply(
				{
					message: 'Invalid task data',
					errors: error.issues.map((issue) => issue.message),
				},
				400,
			);
		console.error(`[ingest] ${body.task} failed`, error);
		return reply({ message: `Task ${body.task} failed.` }, 500);
	}
}
