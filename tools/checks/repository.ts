import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { check_effects } from './runes.ts';
import { parse_source, type Finding } from './source.ts';

function git_paths(root: string) {
	return execFileSync(
		'git',
		['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
		{ cwd: root, encoding: 'utf8' },
	)
		.split('\0')
		.filter(Boolean)
		.sort((a, b) => a.localeCompare(b));
}

export function inspect_repository(root: string) {
	const findings: Finding[] = [];
	let source_count = 0;
	for (const file of git_paths(root).filter(
		(file) =>
			file.startsWith('src/') && /\.(?:ts|svelte)$/.test(file),
	)) {
		if (
			lstatSync(join(root, file), {
				throwIfNoEntry: false,
			})?.isFile() !== true
		)
			continue;
		source_count++;
		const text = readFileSync(join(root, file), 'utf8');
		findings.push(...check_effects(parse_source(file, text)));
	}
	return { findings, source_count };
}
