import { modpackManifest } from "#globals";

import fs from "node:fs";
import path from "node:path";
import * as core from "@actions/core";
import type { AxiosRequestConfig } from "axios";
import mustache from "mustache";
import buildConfig from "#buildConfig";
import {
	type DeployReleaseType,
	type InputReleaseType,
	inputToDeployReleaseTypes,
} from "#types/changelogTypes.ts";
import type { CurseForgeLegacyMCVersion } from "#types/curseForge.ts";
import { logInfo } from "#utils/log.ts";
import {
	filesize,
	getAxios,
	isEnvVariableSet,
	makeArtifactNameBody,
	sanitizeFilename,
} from "#utils/util.ts";

const CURSEFORGE_LEGACY_ENDPOINT = "https://minecraft.curseforge.com/";
const variablesToCheck = [
	"CURSEFORGE_API_TOKEN",
	"CURSEFORGE_PROJECT_ID",
	"RELEASE_TYPE",
];

async function upload(files: { name: string; displayName: string }[]) {
	const filePaths = files.map((file) => {
		const filePath = path.join(
			buildConfig.buildDestinationDirectory,
			"cf",
			file.name,
		);
		if (!fs.existsSync(filePath)) {
			throw new Error(`File ${filePath} doesn't exist!`);
		}
		return { path: filePath, file: file };
	});

	// Since we've built everything beforehand, the changelog must be available in the shared directory.
	let changelog = (
		await fs.promises.readFile(
			path.join(buildConfig.buildDestinationDirectory, "CHANGELOG_CF.md"),
		)
	).toString();

	changelog = mustache.render(changelog, {
		CENTER_ALIGN: 'style="text-align: center;"',
		CF_REDIRECT: `<h4 style="text-align: center;">Looks way better <a href="https://github.com/Nomi-CEu/Nomi-CEu/releases/tag/${process.env.GITHUB_TAG}">here.</a></h4>`,
	});

	const tokenHeaders = {
		"X-Api-Token": process.env.CURSEFORGE_API_TOKEN,
	};

	// Fetch the list of Minecraft versions from CurseForge.
	logInfo("Fetching CurseForge version manifest...");
	const versionsManifest: CurseForgeLegacyMCVersion[] | undefined = (
		await getAxios()({
			url: `${CURSEFORGE_LEGACY_ENDPOINT}api/game/versions`,
			method: "get",
			headers: tokenHeaders,
			responseType: "json",
		})
	).data;

	if (!versionsManifest) {
		throw new Error("Failed to fetch CurseForge version manifest.");
	}

	const version = versionsManifest.find(
		(m) => m.name === modpackManifest.minecraft.version,
	);

	if (!version) {
		throw new Error(
			`Version ${modpackManifest.minecraft.version} not found on CurseForge.`,
		);
	}

	const uploadedIDs: { filePath: string; displayName: string; id: number }[] =
		[];
	let parentID: number | undefined = undefined;

	const releaseType: DeployReleaseType =
		inputToDeployReleaseTypes[
			(process.env.RELEASE_TYPE ?? "Release") as InputReleaseType
		];

	// Upload artifacts.
	for (const filePath of filePaths) {
		const options: AxiosRequestConfig<unknown> = {
			url: `${CURSEFORGE_LEGACY_ENDPOINT}api/projects/${process.env.CURSEFORGE_PROJECT_ID}/upload-file`,
			method: "post",
			headers: {
				...tokenHeaders,
				"Content-Type": "multipart/form-data",
			},
			data: {
				metadata: JSON.stringify({
					changelog: changelog,
					changelogType: "html",
					releaseType: releaseType ? releaseType.cfReleaseType : "release",
					parentFileID: parentID ? parentID : undefined,
					gameVersions: parentID ? undefined : [version.id],
					displayName: filePath.file.displayName,
				}),
				file: fs.createReadStream(filePath.path),
			},
			responseType: "json",
		};

		logInfo(
			`Uploading ${filePath.file.name} to CurseForge...${parentID ? `(child of ${parentID})` : ""}`,
		);

		const response: { id: number } = (await getAxios()(options)).data;

		if (response?.id) {
			uploadedIDs.push({
				filePath: filePath.path,
				displayName: filePath.file.displayName,
				id: response.id,
			});
			if (!parentID) {
				parentID = response.id;
			}
		} else {
			throw new Error(
				`Failed to upload ${filePath.file.name}: Invalid Response.`,
			);
		}
	}
	if (isEnvVariableSet("GITHUB_STEP_SUMMARY"))
		await core.summary
			.addHeading("Nomi-CEu CurseForge Deploy Summary:", 2)
			.addTable([
				[
					{ data: "File Name", header: true },
					{ data: "File ID", header: true },
					{ data: "File Size", header: true },
				],
				...uploadedIDs.map((uploaded) => [
					uploaded.displayName,
					uploaded.id.toString(),
					filesize(fs.statSync(uploaded.filePath).size),
				]),
			])
			.write();
}

/**
 * Uploads build artifacts to CurseForge.
 */
export async function deployCurseForge(): Promise<void> {
	/*
	 * Obligatory variable check.
	 */
	for (const vari of ["GITHUB_TAG", ...variablesToCheck]) {
		if (!process.env[vari]) {
			throw new Error(`Environmental variable ${vari} is unset.`);
		}
	}

	const displayName = process.env.GITHUB_TAG ?? "";

	const files = [
		{
			name: sanitizeFilename(
				`${makeArtifactNameBody(modpackManifest.name)}-client.zip`.toLowerCase(),
			),
			displayName: displayName,
		},
		{
			name: sanitizeFilename(
				`${makeArtifactNameBody(modpackManifest.name)}-server.zip`.toLowerCase(),
			),
			displayName: `${displayName}-server`,
		},
	];

	await upload(files);
}
