import path from "node:path";
import { modDestDirectory, modpackManifest } from "#globals";
import { ensureDir, removeDir } from "#utils/build.js";
import { fetchMods } from "#utils/curseForgeAPI.ts";
import logInfo from "#utils/log.ts";
import { parallel, series } from "#utils/util.ts";

async function modCleanUp() {
	await removeDir(modDestDirectory);
}

/**
 * Checks and creates all necessary directories so we can download the mods safely.
 */
async function createModDirs() {
	await ensureDir(path.join(modDestDirectory, "client"));
	await ensureDir(path.join(modDestDirectory, "server"));
}

/**
 * Downloads mods according to manifest.json and checks hashes.
 */
async function downloadMods(): Promise<void> {
	logInfo("Fetching Shared Mods...");
	await fetchMods(
		modpackManifest.files.filter((f) => !f.sides),
		modDestDirectory,
	);
}

/**
 * Downloads mods according to manifest.json and checks hashes.
 */
async function downloadClientMods(): Promise<void> {
	logInfo("Fetching Client Mods...");
	await fetchMods(
		modpackManifest.files.filter((f) => f.sides?.includes("client")),
		path.join(modDestDirectory, "client"),
	);
}

/**
 * Downloads mods according to manifest.json and checks hashes.
 */
async function downloadServerMods(): Promise<void> {
	logInfo("Fetching Server Mods...");
	await fetchMods(
		modpackManifest.files.filter((f) => f.sides?.includes("server")),
		path.join(modDestDirectory, "server"),
	);
}

export const downloadSharedAndServer = series(
	modCleanUp,
	createModDirs,
	parallel(downloadMods, downloadServerMods),
);

export const downloadSharedAndClient = series(
	modCleanUp,
	createModDirs,
	parallel(downloadMods, downloadClientMods),
);
