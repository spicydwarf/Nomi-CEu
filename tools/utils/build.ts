import { copyFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import glob from "fast-glob";
import globParent from "glob-parent";

export async function ensureDir(dir: string): Promise<void> {
	await mkdir(dir, { recursive: true });
}

export async function removeDir(dir: string): Promise<void> {
	await rm(dir, { force: true, recursive: true });
}

export async function copyFiles(
	patterns: string | string[],
	dest: string,
	options?: { cwd?: string; followSymbolicLinks?: boolean },
) {
	const files = await glob(patterns, {
		cwd: options?.cwd,
		followSymbolicLinks: options?.followSymbolicLinks ?? true,
		absolute: true,
	});

	if (files.length === 0) {
		return;
	}

	const patternArray = Array.isArray(patterns) ? patterns : [patterns];
	const parents = patternArray.map((pattern) =>
		path.resolve(options?.cwd ?? "", globParent(pattern)),
	);

	const baseRegex = new RegExp(`(${parents.join("|")})`, "g");

	await Promise.all(
		files.map(async (source) => {
			const destination = path.join(dest, source.replace(baseRegex, ""));

			await ensureDir(path.dirname(destination));

			await copyFile(source, destination);
		}),
	);
}
