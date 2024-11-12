import path from "node:path";
import buildConfig from "#buildConfig";
import {
	langDestDirectory,
	overridesFolder,
	sharedDestDirectory,
} from "#globals";
import { copyFiles, ensureDir, removeDir } from "#utils/build.js";
import { series, shouldSkipChangelog } from "#utils/util.ts";

const resourcesPath = path.join(
	sharedDestDirectory,
	overridesFolder,
	"resources",
);

async function langCleanUp() {
	await removeDir(langDestDirectory);
}

/**
 * Checks and creates all necessary directories so we can build the lang safely.
 */
async function createLangDirs() {
	await ensureDir(langDestDirectory);
}

/**
 * Copies the license file.
 */
async function copyLangLicense() {
	await copyFiles("../LICENSE", langDestDirectory);
}

/**
 * Copies the update notes file.
 */
async function copyLangUpdateNotes() {
	await copyFiles("../UPDATENOTES.md", langDestDirectory);
}

/**
 * Copies the changelog file.
 */
async function copyLangChangelog() {
	if (shouldSkipChangelog()) return;

	await copyFiles(
		path.join(buildConfig.buildDestinationDirectory, "CHANGELOG.md"),
		langDestDirectory,
	);
}

async function copyLangFiles() {
	await copyFiles("**/*.lang", path.join(langDestDirectory, "assets"), {
		cwd: resourcesPath,
	});
}

async function copyLangMcMeta() {
	await copyFiles(path.join(resourcesPath, "pack.mcmeta"), langDestDirectory);
}

export default series(
	langCleanUp,
	createLangDirs,
	copyLangFiles,
	copyLangMcMeta,
	copyLangLicense,
	copyLangChangelog,
	copyLangUpdateNotes,
);
