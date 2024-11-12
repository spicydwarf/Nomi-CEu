import path from "node:path";
import buildConfig from "#buildConfig";
import type { ModpackManifest } from "#types/modpackManifest.ts";
import manifest from "./../manifest.json" with { type: "json" };

export const sharedDestDirectory = path.join(
	buildConfig.buildDestinationDirectory,
	"shared",
);
export const modDestDirectory = path.join(
	buildConfig.buildDestinationDirectory,
	"mods",
);
export const clientDestDirectory = path.join(
	buildConfig.buildDestinationDirectory,
	"client",
);
export const mmcDestDirectory = path.join(
	buildConfig.buildDestinationDirectory,
	"mmc",
);
export const serverDestDirectory = path.join(
	buildConfig.buildDestinationDirectory,
	"server",
);
export const langDestDirectory = path.join(
	buildConfig.buildDestinationDirectory,
	"lang",
);
export const tempDirectory = path.join(
	buildConfig.buildDestinationDirectory,
	"temp",
);
export const modpackManifest = manifest as ModpackManifest;
export const overridesFolder = modpackManifest.overrides || "overrides";
export const configFolder = path.join(overridesFolder, "config");
export const configOverridesFolder = path.join(
	overridesFolder,
	"config-overrides",
);
export const rootDirectory = "..";
export const templatesFolder = "templates";
export const storageFolder = "storage";

// The GitHub Repository Owner
export const repoOwner = "Nomi-CEu";

// The GitHub Repository Name
export const repoName = "Nomi-CEu";
