import fs from "node:fs/promises";
import path from "node:path";
import buildConfig from "#buildConfig";
import {
	mmcDestDirectory,
	modDestDirectory,
	modpackManifest,
	sharedDestDirectory,
} from "#globals";
import { copyFiles, ensureDir, removeDir } from "#utils/build.js";
import { series, shouldSkipChangelog } from "#utils/util.ts";

async function mmcCleanUp() {
	await removeDir(mmcDestDirectory);
}

/**
 * Checks and creates all necessary directories so we can build the MMC zip safely.
 */
async function createMMCDirs() {
	await ensureDir(mmcDestDirectory);
}

/**
 * Copies the update notes file.
 */
async function copyMMCUpdateNotes() {
	await copyFiles("../UPDATENOTES.md", mmcDestDirectory);
}

/**
 * Copies the license file.
 */
async function copyMMCLicense() {
	await copyFiles("../LICENSE", mmcDestDirectory);
}

/**
 * Copies the changelog file.
 */
async function copyMMCChangelog() {
	if (shouldSkipChangelog()) return;

	await copyFiles(
		path.join(buildConfig.buildDestinationDirectory, "CHANGELOG.md"),
		mmcDestDirectory,
	);
}

/**
 * Copies modpack overrides.
 */
async function copyOverrides() {
	await copyFiles("**/*", path.join(mmcDestDirectory, ".minecraft"), {
		cwd: path.join(sharedDestDirectory, "overrides"),
	});
}

/**
 * Copies client & shared mods.
 */
async function copyMMCModJars() {
	await copyFiles(
		["*", path.join("client", "*")],
		path.join(mmcDestDirectory, ".minecraft", "mods"),
		{
			cwd: modDestDirectory,
		},
	);
}

async function createMMCConfig() {
	const cfg: Record<string, string> = {
		InstanceType: "OneSix",
		iconKey: "default",
		name: modpackManifest.name,
	};

	await fs.writeFile(
		path.join(mmcDestDirectory, "instance.cfg"),
		Object.keys(cfg)
			.map((key) => {
				return `${key}=${cfg[key]}`;
			})
			.join("\n"),
	);
}

async function createMMCManifest() {
	const manifest = {
		components: [],
		formatVersion: 1,
	} as { components: unknown[]; formatVersion: number };

	manifest.components.push({
		cachedName: "Minecraft",
		cachedVersion: modpackManifest.minecraft.version,
		important: true,
		uid: "net.minecraft",
		version: modpackManifest.minecraft.version,
	});

	const forgeLoader = modpackManifest.minecraft.modLoaders
		.map((x) => x.id.match(/forge-(.+)/))
		.filter(Boolean)
		.shift();

	if (forgeLoader) {
		const ver = forgeLoader[1];

		manifest.components.push({
			cachedName: "Forge",
			cachedRequires: [
				{
					equals: `${modpackManifest.minecraft.version}`,
					uid: "net.minecraft",
				},
			],
			cachedVersion: ver,
			uid: "net.minecraftforge",
			version: ver,
		});
	}

	await fs.writeFile(
		path.join(mmcDestDirectory, "mmc-pack.json"),
		JSON.stringify(manifest, null, "\t"),
	);
}

export default series(
	mmcCleanUp,
	createMMCDirs,
	copyMMCChangelog,
	copyMMCLicense,
	copyMMCUpdateNotes,
	copyOverrides,
	createMMCConfig,
	createMMCManifest,
	copyMMCModJars,
);
