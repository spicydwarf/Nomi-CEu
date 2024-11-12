import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";
import mustache from "mustache";
import unzip from "unzipper";
import buildConfig from "#buildConfig";
import {
	modDestDirectory,
	modpackManifest,
	serverDestDirectory,
	sharedDestDirectory,
} from "#globals";
import type { FileDef } from "#types/fileDef.ts";
import type { ForgeProfile } from "#types/forgeProfile.ts";
import { copyFiles, ensureDir, removeDir } from "#utils/build.js";
import { logInfo, logWarn } from "#utils/log.ts";
import {
	downloadOrRetrieveFileDef,
	getForgeJar,
	getVersionManifest,
	series,
	shouldSkipChangelog,
} from "#utils/util.ts";

let g_forgeJar: string | undefined = undefined;

async function serverCleanUp() {
	await removeDir(serverDestDirectory);
}

/**
 * Checks and creates all necessary directories so we can build the server safely.
 */
async function createServerDirs() {
	await ensureDir(serverDestDirectory);
}

/**
 * Download the Forge jar.
 *
 * Extract, parse the profile data and download required libraries.
 */
async function downloadForge() {
	const { forgeJar, forgeUniversalPath } = await getForgeJar();

	/**
	 * Parse the profile manifest.
	 */
	let forgeUniversalJar: Buffer | undefined = undefined;
	let forgeProfile: ForgeProfile | undefined = undefined;
	const files = (await unzip.Open.buffer(forgeJar))?.files;

	logInfo("Extracting Forge installation profile & jar...");

	if (!files) {
		throw new Error("Malformed Forge installation jar.");
	}

	for (const file of files) {
		// Look for the universal jar.
		if (!forgeUniversalJar && file.path === forgeUniversalPath) {
			forgeUniversalJar = await file.buffer();
		}
		// Look for the installation profile.
		else if (!forgeProfile && file.path === "version.json") {
			forgeProfile = JSON.parse((await file.buffer()).toString());
		}

		if (forgeUniversalJar && forgeProfile) {
			break;
		}
	}

	if (!forgeProfile || !forgeProfile.libraries) {
		throw new Error("Malformed Forge installation profile.");
	}

	if (!forgeUniversalJar) {
		throw new Error(
			"Couldn't find the universal Forge jar in the installation jar.",
		);
	}

	/**
	 * Move the universal jar into the dist folder.
	 */
	logInfo("Extracting the Forge jar...");
	await fs.promises.writeFile(
		path.join(serverDestDirectory, path.basename(forgeUniversalPath)),
		forgeUniversalJar,
	);

	/**
	 * Save the universal jar file name for later.
	 *
	 * We will need it to process launchscripts.
	 */
	g_forgeJar = path.basename(forgeUniversalPath);

	/**
	 * Finally, fetch libraries.
	 */
	const libraries = forgeProfile.libraries.filter((x) =>
		Boolean(x?.downloads?.artifact?.url),
	);
	logInfo(`Fetching ${libraries.length} server libraries...`);

	await Promise.all(
		libraries.map(async (library) => {
			const libraryPath = library.downloads.artifact.path;

			const def: FileDef = {
				url: library.downloads.artifact.url,
			};

			if (library.downloads.artifact.sha1) {
				def.hashes = [
					{ id: "sha1", hashes: [library.downloads.artifact.sha1] },
				];
			}

			await fs.promises.copyFile(
				(await downloadOrRetrieveFileDef(def)).cachePath,
				path.join(serverDestDirectory, "libraries", libraryPath),
			);
		}),
	);
}

/**
 * Download the server jar.
 */
async function downloadMinecraftServer() {
	logInfo("Fetching the Minecraft version manifest...");
	const versionManifest = await getVersionManifest(
		modpackManifest.minecraft.version,
	);
	if (!versionManifest) {
		throw new Error(`No manifest found for Minecraft ${versionManifest}`);
	}

	/**
	 * Fetch the server jar file.
	 *
	 * Pass SHA1 hash to compare against the downloaded file.
	 */
	const serverJar = await downloadOrRetrieveFileDef({
		url: versionManifest.downloads.server.url,
		hashes: [{ id: "sha1", hashes: versionManifest.downloads.server.sha1 }],
	});

	if (!versionManifest.downloads?.server) {
		throw new Error(`No server jar file found for ${versionManifest.id}`);
	}

	const dest = path.join(
		serverDestDirectory,
		`minecraft_server.${versionManifest.id}.jar`,
	);
	await fs.promises.copyFile(path.resolve(serverJar.cachePath), dest);
}

/**
 * Copies server & shared mods.
 */
async function copyServerMods() {
	await copyFiles(["*", path.join("server", "*")], serverDestDirectory, {
		cwd: modDestDirectory,
	});
}

/**
 * Copies modpack overrides.
 */
async function copyServerOverrides() {
	await copyFiles(buildConfig.copyFromSharedServerGlobs, serverDestDirectory, {
		cwd: sharedDestDirectory,
	});
}

/**
 * Copies files from ./serverfiles into dest folder.
 */
async function copyServerFiles() {
	await copyFiles("../serverfiles/**", serverDestDirectory);
}

/**
 * Copies the license file.
 */
async function copyServerLicense() {
	await copyFiles("../LICENSE", serverDestDirectory);
}

/**
 * Copies the update notes file.
 */
async function copyServerUpdateNotes() {
	await copyFiles("../UPDATENOTES.md", serverDestDirectory);
}

/**
 * Copies the changelog file.
 */
async function copyServerChangelog() {
	if (shouldSkipChangelog()) return;

	await copyFiles(
		path.join(buildConfig.buildDestinationDirectory, "CHANGELOG.md"),
		serverDestDirectory,
	);
}

/**
 * Copies files from ./launchscripts into dest folder and processes them using mustache.
 *
 * Replaces jvmArgs, minRAM, maxRAM and forgeJar.
 */
async function processLaunchscripts() {
	const rules = {
		jvmArgs: buildConfig.launchscriptsJVMArgs,
		minRAM: buildConfig.launchscriptsMinRAM,
		maxRAM: buildConfig.launchscriptsMaxRAM,
		forgeJar: "",
	};

	if (g_forgeJar) {
		rules.forgeJar = g_forgeJar;
	} else {
		logWarn("No forgeJar specified!");
		logWarn("Did downloadForge task fail?");
	}

	const files = await glob("../launchscripts/**");

	for (const file of files) {
		const content = await fs.promises.readFile(file, "utf-8");
		const rendered = mustache.render(content, rules);
		const destPath = path.join(
			serverDestDirectory,
			path.relative("../launchscripts", file),
		);

		await fs.promises.writeFile(destPath, rendered);
	}
}

export default series(
	serverCleanUp,
	createServerDirs,
	downloadForge,
	downloadMinecraftServer,
	copyServerMods,
	copyServerOverrides,
	copyServerFiles,
	copyServerLicense,
	copyServerChangelog,
	copyServerUpdateNotes,
	processLaunchscripts,
);
