import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import buildConfig from "#buildConfig";
import { rootDirectory } from "#globals";
import { logInfo } from "#utils/log.ts";
import { categoriesSetup } from "./categoryManagement.ts";
import ChangelogData from "./changelogData.ts";
import { changelogParsers } from "./definitions.ts";
import generateModChanges from "./generateModChanges.ts";
import parseParser from "./parser.ts";
import pushAll, {
	pushChangelog,
	pushSeperator,
	pushSetup,
	pushTitle,
} from "./pusher.ts";
import { specialParserSetup } from "./specialParser.ts";

/**
 * Generates a changelog based on environmental variables, and saves it a changelog data class.
 */
async function createChangelog(): Promise<ChangelogData> {
	const data: ChangelogData = new ChangelogData();

	await data.init();
	await pushSetup();

	// Handle Iterations
	if (data.shouldIterate()) {
		const tags = data.getIterations();
		pushTitle(data);
		for (const tag of tags) {
			const iteration = tags.indexOf(tag);
			logInfo(`Iteration ${iteration + 1} of Changelog.`);
			await data.setupIteration(tag);
			categoriesSetup();
			specialParserSetup(data);

			for (const parser of changelogParsers) {
				await parseParser(data, parser);
			}

			await generateModChanges(data);

			await pushChangelog(data);
			if (iteration < tags.length - 1) {
				// More to go
				pushSeperator(data);
				data.resetForIteration();
			}
		}
		return data;
	}
	logInfo("Default Iteration Detected.");

	categoriesSetup();
	specialParserSetup(data);

	for (const parser of changelogParsers) {
		await parseParser(data, parser);
	}

	await generateModChanges(data);

	await pushAll(data);

	return data;
}

/**
 * Creates a changelog based on environment variables, and saves it to the root directory.
 */
export const createRootChangelog = async (): Promise<void> => {
	// Make a changelog, and save it.
	const builder = (await createChangelog()).builder;

	// Write files.
	await fs.writeFile(
		path.join(rootDirectory, "CHANGELOG.md"),
		builder.join("\n"),
	);
	await fs.writeFile(
		path.join(rootDirectory, "CHANGELOG_CF.md"),
		await marked(builder.join("\n"), { async: true }),
	);
};

/**
 * Creates a changelog based on environment variables, and saves it to the build directory.
 */
export const createBuildChangelog = async (): Promise<void> => {
	// Make a changelog, and save it.
	const builder = (await createChangelog()).builder;

	// Write files.
	await fs.writeFile(
		path.join(buildConfig.buildDestinationDirectory, "CHANGELOG.md"),
		builder.join("\n"),
	);
	await fs.writeFile(
		path.join(buildConfig.buildDestinationDirectory, "CHANGELOG_CF.md"),
		await marked(builder.join("\n"), { async: true }),
	);
};
