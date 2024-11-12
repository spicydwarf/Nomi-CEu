import fs from "node:fs";
import path from "node:path";
import mustache from "mustache";
import buildConfig from "#buildConfig";
import {
	modDestDirectory,
	modpackManifest,
	overridesFolder,
	rootDirectory,
	sharedDestDirectory,
	tempDirectory,
} from "#globals";
import type { FileDef } from "#types/fileDef.ts";
import { copyFiles, ensureDir, removeDir } from "#utils/build.js";
import logInfo, { logError } from "#utils/log.ts";
import {
	downloadFileDef,
	downloadOrRetrieveFileDef,
	isEnvVariableSet,
	series,
	shouldSkipChangelog,
} from "#utils/util.ts";
import { createBuildChangelog } from "../changelog/index.ts";
import {
	updateFilesBuildSetup,
	updateLabsVersion,
} from "../misc/transformFiles.ts";
import { transformQuestBook } from "./quest.ts";
import transformVersion from "./transformVersion.ts";

async function sharedCleanUp() {
	await removeDir(sharedDestDirectory);
	await removeDir(tempDirectory);
}

/**
 * Checks and creates all necessary directories so we can build everything safely.
 */
async function createSharedDirs() {
	await ensureDir(sharedDestDirectory);
	await ensureDir(tempDirectory);
}

/**
 * Copies modpack overrides.
 */
async function copyOverrides() {
	await copyFiles(
		buildConfig.copyToSharedDirGlobs,
		path.join(sharedDestDirectory, overridesFolder),
		{
			cwd: rootDirectory,
		},
	);
}

/**
 * Copies Modpack Pack Mode Switcher Scripts.
 */
async function copyPackModeSwitchers() {
	await copyFiles(buildConfig.packModeSwitcherGlobs, sharedDestDirectory, {
		cwd: rootDirectory,
	});
}

/**
 * Fetch external dependencies and remove the field from the manifest file.
 */
async function fetchExternalDependencies() {
	const dependencies = modpackManifest.externalDependencies;
	if (dependencies) {
		const destDirectory = path.join(modDestDirectory, "mods");

		await ensureDir(destDirectory);

		// Map dependencies to FileDefs.
		const depDefs: FileDef[] = dependencies.map((dep) => {
			return {
				url: dep.url,
				hashes: [
					{
						hashes: [dep.sha],
						id: "sha1",
					},
				],
			};
		});

		modpackManifest.externalDependencies = undefined;

		await Promise.all(
			depDefs.map(async (depDef) => {
				const dest = path.join(destDirectory, path.basename(depDef.url));
				const cachePath = (await downloadOrRetrieveFileDef(depDef)).cachePath;

				return fs.promises.symlink(path.resolve(dest, cachePath), dest);
			}),
		);
	}
}

/**
 * Either fetches the Changelog File, or makes one. Does nothing if 'SKIP_CHANGELOG' is set to a truthy value.
 */
async function fetchOrMakeChangelog() {
	if (shouldSkipChangelog()) return;

	if (isEnvVariableSet("MADE_CHANGELOG")) {
		let made = false;
		try {
			made = JSON.parse((process.env.MADE_CHANGELOG ?? "false").toLowerCase());
		} catch (err) {
			throw new Error("Made Changelog Env Variable set to Invalid Value.");
		}

		if (made) {
			logInfo("Already Made Changelogs...");
			return;
		}
	}

	if (
		isEnvVariableSet("CHANGELOG_URL") &&
		isEnvVariableSet("CHANGELOG_CF_URL")
	) {
		logInfo("Using Changelog Files from URL.");
		await downloadChangelogs(
			process.env.CHANGELOG_URL ?? "",
			process.env.CHANGELOG_CF_URL ?? "",
		);
		return;
	}
	if (isEnvVariableSet("CHANGELOG_BRANCH")) {
		logInfo("Using Changelog Files from Branch.");
		const url =
			"https://raw.githubusercontent.com/Nomi-CEu/Nomi-CEu/{{ branch }}/{{ filename }}";
		await downloadChangelogs(
			mustache.render(url, {
				branch: process.env.CHANGELOG_BRANCH,
				filename: "CHANGELOG.md",
			}),
			mustache.render(url, {
				branch: process.env.CHANGELOG_BRANCH,
				filename: "CHANGELOG_CF.md",
			}),
		);
		return;
	}
	logInfo("Creating Changelog Files.");
	await createBuildChangelog();
}

async function downloadChangelogs(
	changelogURL: string,
	changelogCFURL: string,
) {
	const changelog = await downloadFileDef({ url: changelogURL });
	const changelogCF = await downloadFileDef({ url: changelogCFURL });

	await writeToChangelog(changelog, "CHANGELOG.md", changelogURL);
	await writeToChangelog(changelogCF, "CHANGELOG_CF.md", changelogCFURL);
}

async function writeToChangelog(
	buffer: Buffer,
	changelogFile: string,
	url: string,
) {
	try {
		await fs.promises.writeFile(
			path.join(buildConfig.buildDestinationDirectory, changelogFile),
			buffer,
		);
	} catch (err) {
		logError(`Couldn't download changelog from URL ${url}, cleaning up...`);

		throw err;
	}
}

const updateBuildLabsVersion = async () => {
	await updateLabsVersion(sharedDestDirectory);
};

export default series(
	sharedCleanUp,
	createSharedDirs,
	copyOverrides,
	copyPackModeSwitchers,
	fetchOrMakeChangelog,
	fetchExternalDependencies,
	updateFilesBuildSetup,
	updateBuildLabsVersion,
	transformVersion,
	transformQuestBook,
);

export const buildChangelog = series(
	sharedCleanUp,
	createSharedDirs,
	fetchOrMakeChangelog,
);
