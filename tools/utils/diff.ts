import type { Operation } from "#types/actionQBTypes.js";
import { diffLines, createPatch, applyPatch } from "diff";
import colors from "yoctocolors";

interface FormatDiffOptions {
	hideLines?: boolean;
	maxAdjacentStaticLines?: number;
}

const PREFIX_ADD = "+  ";
const PREFIX_REMOVE = "-  ";
const PREFIX_STATIC = "   ";
const PREFIX_MORE = "@@ ";

export function formatDiff(
	previous: string,
	next: string,
	options: FormatDiffOptions = {},
): string {
	const { hideLines = true, maxAdjacentStaticLines = 2 } = options;

	const result: string[] = [];

	// Split diff into lines with prefixes
	const diff = diffLines(`${previous}\n`, `${next}\n`).map((part) => ({
		...part,
		lines: part.value
			.split("\n")
			.slice(0, -1)
			.map((line) => {
				if (part.added) return PREFIX_ADD + line;
				if (part.removed) return PREFIX_REMOVE + line;
				return PREFIX_STATIC + line;
			}),
	}));

	// Process each part
	for (const part of diff) {
		const { lines, added, removed } = part;

		if (!hideLines || added || removed) {
			// Show all lines for changes or when hiding is disabled
			for (const line of lines) {
				if (added) result.push(colors.green(line));
				else if (removed) result.push(colors.red(line));
				else result.push(colors.gray(line));
			}
		} else {
			// Handle static parts with potential shortening
			const count = lines.length;
			if (
				count > maxAdjacentStaticLines &&
				count - 2 * maxAdjacentStaticLines > 1
			) {
				// Show truncated version
				const startLines = lines.slice(0, maxAdjacentStaticLines);
				const endLines = lines.slice(-maxAdjacentStaticLines);

				// Add start lines
				for (const line of startLines) {
					result.push(colors.gray(line));
				}

				// Add count of hidden lines
				result.push(
					colors.blue(
						`${PREFIX_MORE}${count - 2 * maxAdjacentStaticLines} more lines`,
					),
				);

				// Add end lines
				for (const line of endLines) {
					result.push(colors.gray(line));
				}
			} else {
				// Show all lines if below threshold
				for (const line of lines) {
					result.push(colors.gray(line));
				}
			}
		}
	}

	return result.join("\n");
}

export function applyChanges(
	oldStr: string,
	newStr: string,
	baseStr: string,
): string {
	const patch = createPatch("file", oldStr, newStr);
	const result = applyPatch(baseStr, patch);
	if (typeof result === "boolean") {
		throw new Error("Failed to apply patch");
	}
	return result;
}

export function compareObjects<T>(
	oldObj: T,
	newObj: T,
): Array<{
	path: (string | number)[];
	op: Operation;
	value?: unknown;
}> {
	const changes: Array<{
		path: (string | number)[];
		op: "add" | "remove" | "replace";
		value?: unknown;
	}> = [];

	// biome-ignore lint/suspicious/noExplicitAny: ignore
	function compare(oldVal: any, newVal: any, path: (string | number)[] = []) {
		if (oldVal === newVal) return;

		if (Array.isArray(oldVal) && Array.isArray(newVal)) {
			if (oldVal.length !== newVal.length) {
				changes.push({
					path,
					op: "replace",
					value: newVal,
				});
				return;
			}
			for (let i = 0; i < oldVal.length; i++) {
				compare(oldVal[i], newVal[i], [...path, i]);
			}
			return;
		}

		if (
			typeof oldVal === "object" &&
			typeof newVal === "object" &&
			oldVal !== null &&
			newVal !== null
		) {
			const keys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
			for (const key of keys) {
				if (!(key in oldVal)) {
					changes.push({
						path: [...path, key],
						op: "add",
						value: newVal[key],
					});
				} else if (!(key in newVal)) {
					changes.push({
						path: [...path, key],
						op: "remove",
					});
				} else {
					compare(oldVal[key], newVal[key], [...path, key]);
				}
			}
			return;
		}

		changes.push({
			path,
			op: "replace",
			value: newVal,
		});
	}

	compare(oldObj, newObj);
	return changes;
}
