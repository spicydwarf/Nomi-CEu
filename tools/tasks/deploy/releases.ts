import { modpackManifest } from "#globals";

import fs from "node:fs";
import path from "node:path";
import mustache from "mustache";
import sanitize from "sanitize-filename";
import buildConfig from "#buildConfig";
import {
	type DeployReleaseType,
	type InputReleaseType,
	inputToDeployReleaseTypes,
} from "#types/changelogTypes.ts";
import { makeArtifactNameBody, octokit } from "#utils/util.ts";

const variablesToCheck = [
	"GITHUB_TAG",
	"GITHUB_TOKEN",
	"GITHUB_REPOSITORY",
	"RELEASE_TYPE",
];

/**
 * Uploads build artifacts to GitHub Releases.
 */
async function deployReleases(): Promise<void> {
	/**
	 * Obligatory variable check.
	 */
	for (const vari of variablesToCheck) {
		if (!process.env[vari]) {
			throw new Error(`Environmental variable ${vari} is unset.`);
		}
	}

	const body = makeArtifactNameBody(modpackManifest.name);
	const files = ["client", "server", "lang"].map((file) =>
		sanitize(`${body}-${file}.zip`.toLowerCase()),
	);

	/**
	 * Obligatory file check.
	 */
	for (const file of files) {
		const filePath = path.join(buildConfig.buildDestinationDirectory, file);
		if (!fs.existsSync(filePath)) {
			throw new Error(`File ${filePath} doesn't exist!`);
		}
	}

	const [, owner, repoName] =
		process.env.GITHUB_REPOSITORY?.match(/(.+)\/(.+)/) ?? [];

	if (!owner || !repoName) {
		throw new Error("No/malformed GitHub repository slug provided.");
	}

	const repo = {
		owner,
		repo: repoName,
	};

	const tag = process.env.GITHUB_TAG;
	const releaseType: DeployReleaseType =
		inputToDeployReleaseTypes[
			(process.env.RELEASE_TYPE ?? "") as InputReleaseType
		];
	const preRelease = releaseType ? releaseType.isPreRelease : false;

	// Since we've grabbed, or built, everything beforehand, the Changelog file should be in the build dir
	let changelog = (
		await fs.promises.readFile(
			path.join(buildConfig.buildDestinationDirectory, "CHANGELOG.md"),
		)
	).toString();

	changelog = mustache.render(changelog, {
		CENTER_ALIGN: 'align="center"',
		CF_REDIRECT: "",
	});

	// Create a release.
	const release = await octokit.repos.createRelease({
		tag_name: tag || "latest-dev-preview",
		prerelease: preRelease,
		name: tag || "latest-dev-preview",
		body: changelog,
		...repo,
	});

	// Upload artifacts.
	await Promise.all(
		files.map(async (file) => {
			return octokit.repos.uploadReleaseAsset({
				name: file,
				release_id: release.data.id,
				...repo,

				// Dumb workaround thanks to broken typings. Data should accept buffers...
				data: (await fs.promises.readFile(
					path.join(buildConfig.buildDestinationDirectory, file),
				)) as unknown as string,
			});
		}),
	);

	await octokit.repos.updateRelease({
		release_id: release.data.id,
		draft: false,
		...repo,
	});
}

export default deployReleases;
