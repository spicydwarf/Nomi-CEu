import fs from "node:fs";
import { join } from "node:path";
import archiver from "archiver";
import sanitize from "sanitize-filename";
import buildConfig from "#buildConfig";
import {
	clientDestDirectory,
	langDestDirectory,
	mmcDestDirectory,
	modpackManifest,
	serverDestDirectory,
} from "#globals";
import { makeArtifactNameBody, parallel } from "#utils/util.ts";

async function zipFolder(
	path: string,
	globs: string[],
	dest: string,
	zipName: string,
): Promise<void> {
	const output = fs.createWriteStream(join(dest, zipName));
	const archive = archiver("zip");

	archive.pipe(output);

	for (const glob of globs) {
		archive.glob(glob, { cwd: path, dot: true });
	}

	archive.finalize();
}

function makeZipper(src: string, artifactName: string, isCFZip = false) {
	const zipFn = () => {
		return zipFolder(
			src,
			isCFZip ? buildConfig.cfZipGlobs : buildConfig.normalZipGlobs,
			isCFZip
				? join(buildConfig.buildDestinationDirectory, "cf")
				: buildConfig.buildDestinationDirectory,
			sanitize(
				`${makeArtifactNameBody(modpackManifest.name)}-${artifactName}.zip`.toLowerCase(),
			),
		);
	};

	Object.defineProperty(zipFn, "name", {
		value: `zip${artifactName}${isCFZip ? "CF" : ""}`,
		configurable: true,
	});

	return zipFn;
}

export const zipServer = makeZipper(serverDestDirectory, "Server");
export const zipClient = makeZipper(clientDestDirectory, "Client");
export const zipLang = makeZipper(langDestDirectory, "Lang");
export const zipMMC = makeZipper(mmcDestDirectory, "MMC");
export const zipServerCF = makeZipper(serverDestDirectory, "Server", true);
export const zipClientCF = makeZipper(clientDestDirectory, "Client", true);

export const zipAll = parallel(
	zipServer,
	zipClient,
	zipLang,
	zipServerCF,
	zipClientCF,
);
