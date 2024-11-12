import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import stream from "node:stream";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "@octokit/rest";
import axios, {
	AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type AxiosStatic,
} from "axios";
import axiosRetry, {
	DEFAULT_OPTIONS,
	type IAxiosRetryConfig,
	type IAxiosRetryConfigExtended,
	namespace,
} from "axios-retry";
import { sha1 } from "hash-wasm";
import lodash from "lodash";
import { type SimpleGit, pathspec, simpleGit } from "simple-git";
import buildConfig from "#buildConfig";
import { modpackManifest, repoName, repoOwner, rootDirectory } from "#globals";
import type { NomiConfig } from "#types/axios.ts";
import type { Commit, ModChangeInfo } from "#types/changelogTypes.ts";
import type { FileDef } from "#types/fileDef.ts";
import type {
	ExternalDependency,
	ModpackManifest,
	ModpackManifestFile,
} from "#types/modpackManifest.ts";
import { BuildData } from "#types/transformFiles.js";
import type { VersionManifest } from "#types/versionManifest.ts";
import type { VersionsManifest } from "#types/versionsManifest.ts";
import {
	fetchFileInfo,
	fetchProject,
	fetchProjectsBulk,
} from "./curseForgeAPI.ts";
import { compareBufferToHashDef } from "./hashes.ts";
import logInfo, { logError, logWarn } from "./log.ts";

const LIBRARY_REG = /^(.+?):(.+?):(.+?)$/;

// Make git commands run in root dir
export const git: SimpleGit = simpleGit(rootDirectory);

const RetryOctokit = Octokit.plugin(retry, throttling);
let shouldTryGetInfo = true;
export const octokit = new RetryOctokit({
	auth: process.env.GITHUB_TOKEN,
	throttle: {
		onRateLimit: (retryAfter, options, _octokit, retryCount) => {
			logError(
				`Request Quota Exhausted for Request ${options.method} ${options.url}!`,
			);

			if (retryCount < buildConfig.downloaderMaxRetries) {
				if (retryAfter < buildConfig.changelogRequestRetryMaxSeconds) {
					logInfo(`Retrying after ${retryAfter} seconds.`);
					return true;
				}
				logError(
					`Reset Time of ${retryAfter} Seconds is Too Long! Not Retrying!`,
				);
				shouldTryGetInfo = false;
				return false;
			}
		},
		onSecondaryRateLimit: (retryAfter, options, _octokit, retryCount) => {
			logError(
				`Secondary Rate Limit Hit for Request ${options.method} ${options.url}!`,
			);

			if (retryCount < buildConfig.downloaderMaxRetries) {
				if (retryAfter < buildConfig.changelogRequestRetryMaxSeconds) {
					logInfo(`Retrying after ${retryAfter} seconds.`);
					return true;
				}
				logError(
					`Reset Time of ${retryAfter} Seconds is Too Long! Not Retrying!`,
				);
				shouldTryGetInfo = false;
				return false;
			}
		},
	},
});

const retryCfg: IAxiosRetryConfig = {
	retries: 10,
	retryDelay: (count) => count * 100,
	onRetry: (count, error, cfg) =>
		logWarn(
			`Retrying HTTP Request of URL ${cfg.url} in 100ms. (${error.message}) (${count} Times)`,
		),
	onMaxRetryTimesExceeded: (error) => {
		throw error;
	},
};

axiosRetry(axios, retryCfg);

const fileDownloader = axios.create();
axiosRetry(fileDownloader, retryCfg);
fileDownloader.interceptors.response.use(async (response) => {
	if (response.status < 200 || response.status > 299) return response; // Error, Probably Handled by Axios Retry
	if (!response.data || !(response.data instanceof stream.Stream))
		return retryOrThrow(response, "No Response Error");

	const buf: Uint8Array[] = [];
	const dataStream = response.data as stream.Stream;
	const buffer = await new Promise<Buffer>((resolve) => {
		dataStream.on("data", (chunk) => buf.push(chunk));
		dataStream.on("end", () => {
			resolve(Buffer.concat(buf));
		});
	});

	const nomiCfg = response.config.nomiCfg as Required<NomiConfig>;
	const url = response.config.url ?? nomiCfg.fileDef.url;

	// If Buffer Does not Match, Retry
	if (!buffer)
		throw new Error(`Failed to Download File from ${url}, no Buffer Returned!`);
	if (nomiCfg.fileDef.hashes) {
		let success = true;
		for (const hash of nomiCfg.fileDef.hashes) {
			if (await compareBufferToHashDef(buffer, hash)) continue;
			success = false;
			break;
		}
		if (!success)
			return retryOrThrow(
				response,
				`Failed to Download File from ${url}, File Checksum Checking Failed!`,
			);
	}

	response.data = buffer;
	return response;
}, null);

export function getAxios(): AxiosStatic {
	return axios;
}

/**
 * Parses the library name into path following the standard package naming convention.
 *
 * Turns `package:name:version` into `package/name/version/name-version`.
 */
export const libraryToPath = (library: string): string => {
	const [, pkg, name, version] = library.match(LIBRARY_REG) ?? [];
	if (pkg && name && version) {
		return `${pkg.replace(/\./g, "/")}/${name}/${version}/${name}-${version}`;
	}
	return "";
};

/**
 * Checks if given environmental variables are set. Throws otherwise.
 */
export const checkEnvironmentalVariables = (vars: string[]): void => {
	for (const vari of vars) {
		if (!isEnvVariableSet(vari)) {
			throw new Error(`Environmental variable ${vari} is unset.`);
		}
	}
};

/**
 * Returns true if given variable set, false otherwise.
 */
export const isEnvVariableSet = (env: string): boolean => {
	return Boolean(process.env[env]) && process.env[env] !== "";
};

/**
 * Check if given git tag exists. Throws otherwise.
 */
export const checkGitTag = (tag: string): void => {
	// The below command returns an empty buffer if the given tag does not exist.
	const tagBuffer = execSync(`git tag --list ${tag}`);

	if (!tagBuffer || tagBuffer.toString().trim() !== tag) {
		throw new Error(`Tag ${tag} could not be found.`);
	}
};

export enum RetrievedFileDefReason {
	Downloaded = 0,
	CacheHit = 1,
}

export interface RetrievedFileDef {
	reason: RetrievedFileDefReason;
	cachePath: string;
}

/**
 * Downloads/fetches files from the Interwebs.
 *
 * Internally hashes the URL of the provided FileDef and looks it up in the cache directory.
 * In case of no cache hit, downloads the file and stores within the cache directory for later use.
 * <p>
 * @param fileDef The file def to download or retrieve.
 */
export async function downloadOrRetrieveFileDef(
	fileDef: FileDef,
): Promise<RetrievedFileDef> {
	const fileNameSha = await sha1(fileDef.url);

	const cachedFilePath = path.join(
		buildConfig.downloaderCacheDirectory,
		fileNameSha,
	);
	if (fs.existsSync(cachedFilePath)) {
		const file = await fs.promises.readFile(cachedFilePath);

		if (file.length !== 0) {
			const rFileDef = {
				reason: RetrievedFileDefReason.CacheHit,
				cachePath: cachedFilePath,
			};

			// Check hashes.
			if (fileDef.hashes) {
				let success = true;
				for (const hash of fileDef.hashes) {
					if (await compareBufferToHashDef(file, hash)) continue;
					success = false;
					break;
				}
				if (success) return rFileDef;
			} else {
				return rFileDef;
			}
		}
	}

	if (!fs.existsSync(buildConfig.downloaderCacheDirectory)) {
		await fs.promises.mkdir(buildConfig.downloaderCacheDirectory, {
			recursive: true,
		});
	}

	let handle: fs.promises.FileHandle | undefined = undefined;
	try {
		handle = await fs.promises.open(cachedFilePath, "w");

		await handle.write(await downloadFileDef(fileDef));
		await handle.close();

		return {
			reason: RetrievedFileDefReason.Downloaded,
			cachePath: cachedFilePath,
		};
	} catch (err) {
		// noinspection PointlessBooleanExpressionJS,JSObjectNullOrUndefined
		if (handle && (await handle.stat()).isFile()) {
			logInfo(
				`Couldn't download ${path.basename(fileDef.url)}, cleaning up ${fileNameSha}...`,
			);

			await handle.close();
			await fs.promises.unlink(cachedFilePath);
		}

		throw err;
	}
}

/**
 * Similar to downloadOrRetrieveFileDef, but does not check cache.
 */
export async function downloadFileDef(fileDef: FileDef): Promise<Buffer> {
	const response = await fileDownloader({
		method: "get",
		responseType: "stream",
		url: fileDef.url,
		nomiCfg: {
			fileDef: fileDef,
		},
	});

	return response.data as Buffer;
}

function fixConfig(
	axiosInstance: AxiosInstance | AxiosStatic,
	config: AxiosRequestConfig,
) {
	// @ts-expect-error agent non-existent in type declaration`
	if (axiosInstance.defaults.agent === config.agent) {
		// @ts-expect-error agent non-existent in type declaration
		config.agent = undefined;
	}
	if (axiosInstance.defaults.httpAgent === config.httpAgent) {
		config.httpAgent = undefined;
	}
	if (axiosInstance.defaults.httpsAgent === config.httpsAgent) {
		config.httpsAgent = undefined;
	}
}

/**
 * Use Axios Retry API to retry if Hash Failed or No Response.
 */
function retryOrThrow(
	response: AxiosResponse<unknown, unknown>,
	error: string,
) {
	const currentState = {
		...DEFAULT_OPTIONS,
		...retryCfg,
		...response.config[namespace],
	};
	const config = { ...response.config };

	currentState.retryCount = currentState.retryCount || 0;
	currentState.lastRequestTime = currentState.lastRequestTime || Date.now();
	config[namespace] = currentState;

	const axiosError = new AxiosError<unknown, unknown>();

	const retryState = currentState as Required<IAxiosRetryConfigExtended>;
	if (retryState.retryCount < retryState.retries) {
		retryState.retryCount++;
		const delay = retryState.retryDelay(retryState.retryCount, axiosError);
		fixConfig(fileDownloader, config);
		if (
			!retryState.shouldResetTimeout &&
			config.timeout &&
			currentState.lastRequestTime
		) {
			const lastRequestDuration = Date.now() - currentState.lastRequestTime;
			const timeout = config.timeout - lastRequestDuration - delay;
			if (timeout <= 0) throw new Error(error);
			config.timeout = timeout;
		}
		config.transformRequest = [(data) => data];
		axiosError.message = error;
		retryState.onRetry(retryState.retryCount, axiosError, config);

		return new Promise<AxiosResponse<unknown, unknown>>((resolve) => {
			setTimeout(() => resolve(fileDownloader(config)), delay);
		});
	}

	throw new Error(error);
}

/**
 * Returns artifact name body depending on environment variables.
 * Mostly intended to be called by CI/CD.
 */
export function makeArtifactNameBody(baseName: string): string {
	return `${baseName}-${new BuildData().rawVersion}`;
}

/**
 * Returns and fetches the last tag known to Git using the current branch.
 * @param before Tag to get the tag before.
 * @returns string Git tag.
 * @throws
 */
export function getLastGitTag(before?: string): string {
	return execSync(
		`git describe --abbrev=0 --tags ${before ? `"${before}^"` : ""}`,
	)
		.toString()
		.trim();
}

/**
 * Generates a changelog based on the two provided Git refs.
 * @param since Lower boundary Git ref.
 * @param to Upper boundary Git ref.
 * @param dirs Optional scopes. These are of the perspective of the root dir.
 * @returns changelog Object Array of Changelog
 */
export async function getChangelog(
	since = "HEAD",
	to = "HEAD",
	dirs: string[] | undefined = undefined,
): Promise<Commit[]> {
	const options: string[] = ["--no-merges", `${since}..${to}`];
	if (dirs) {
		for (const dir of dirs) {
			options.push(pathspec(dir));
		}
	}

	const commitList: Commit[] = [];
	await git.log(options, (err, output) => {
		if (err) {
			logError(err.toString());
			throw new Error();
		}

		// Cannot simply set commitList as output.all as is read only, must do this
		for (const commit of output.all) {
			commitList.push(commit);
		}
	});

	return commitList;
}

/**
 * Gets the list of tags that are at or before a certain ref point.
 * @param ref The ref point. Can be a tag or a commit sha. If not set, defaults to HEAD.
 * @returns tags An array of all the tags
 */
export async function getTags(ref = "HEAD"): Promise<string[]> {
	const options: string[] = ["--merged", ref];
	const test = await git.tags(options);
	return test.all;
}

/**
 * Gets the file at a certain point in time.
 * @param path The path to the file
 * @param revision The git ref point. Can also be a commit SHA.
 */
export async function getFileAtRevision(
	path: string,
	revision = "HEAD",
): Promise<string> {
	let output = "";
	await git.show(`${revision}:./${path}`, (err, file) => {
		if (err) {
			logError(err.toString());
			throw new Error();
		}
		output = file.trim();
	});
	return output;
}

export interface ManifestFileListComparisonResult {
	removed: ModChangeInfo[];
	modified: ModChangeInfo[];
	added: ModChangeInfo[];
}

async function getModName(projectID: number): Promise<string> {
	return fetchProject(projectID).then((info) => info.name);
}

async function getFileName(projectID: number, fileID: number): Promise<string> {
	return fetchFileInfo(projectID, fileID).then((info) => info.displayName);
}

export async function compareAndExpandManifestDependencies(
	oldFiles: ModpackManifest,
	newFiles: ModpackManifest,
): Promise<ManifestFileListComparisonResult> {
	// Map inputs for efficient joining.
	const oldFileMap: { [key: number]: ModpackManifestFile } =
		oldFiles.files.reduce((map: Record<number, ModpackManifestFile>, file) => {
			map[file.projectID] = file;
			return map;
		}, {});
	const newFileMap: { [key: number]: ModpackManifestFile } =
		newFiles.files.reduce((map: Record<number, ModpackManifestFile>, file) => {
			map[file.projectID] = file;
			return map;
		}, {});

	const removed: ModChangeInfo[] = [];
	const modified: ModChangeInfo[] = [];
	const added: ModChangeInfo[] = [];

	// Create a distinct map of project IDs.
	const projectIDs = Array.from(
		new Set([
			...oldFiles.files.map((f) => f.projectID),
			...newFiles.files.map((f) => f.projectID),
		]),
	);

	// Fetch projects in bulk and discard the result.
	// Future calls to fetchProject() and fetchProjectsBulk() will hit the cache.
	await fetchProjectsBulk(projectIDs);

	const toFetch: Promise<void>[] = [];
	for (const projectID of projectIDs) {
		const oldFileInfo = oldFileMap[projectID];
		const newFileInfo = newFileMap[projectID];

		// Doesn't exist in new, but exists in old. Removed. Left outer join.
		if (!newFileInfo && oldFileInfo) {
			const names = Promise.all([
				getModName(projectID),
				getFileName(projectID, oldFileInfo.fileID),
			]);
			toFetch.push(
				names.then(([mod, file]) => {
					removed.push({
						modName: mod,
						projectID: projectID,
						oldVersion: file,
					});
				}),
			);
		}
		// Doesn't exist in old, but exists in new. Added. Right outer join.
		else if (newFileInfo && !oldFileInfo) {
			const names = Promise.all([
				getModName(projectID),
				getFileName(projectID, newFileInfo.fileID),
			]);
			toFetch.push(
				names.then(([mod, file]) => {
					added.push({
						modName: mod,
						projectID: projectID,
						newVersion: file,
					});
				}),
			);
		}
		// Exists in both. Modified? Inner join.
		else if (
			oldFileInfo &&
			newFileInfo &&
			oldFileInfo.fileID !== newFileInfo.fileID
		) {
			const names = Promise.all([
				getModName(projectID),
				getFileName(projectID, oldFileInfo.fileID),
				getFileName(projectID, newFileInfo.fileID),
			]);
			toFetch.push(
				names.then(([mod, oldFile, newFile]) => {
					modified.push({
						modName: mod,
						projectID: projectID,
						oldVersion: oldFile,
						newVersion: newFile,
					});
				}),
			);
		}
	}

	// Fetch All Modifications Async
	await Promise.all(toFetch);

	// Compare external dependencies the same way.
	const oldExternalMap: { [key: string]: ExternalDependency } = (
		oldFiles.externalDependencies || []
	).reduce((map: Record<string, ExternalDependency>, file) => {
		map[file.name] = file;
		return map;
	}, {});
	const newExternalMap: { [key: string]: ExternalDependency } = (
		newFiles.externalDependencies || []
	).reduce((map: Record<string, ExternalDependency>, file) => {
		map[file.name] = file;
		return map;
	}, {});

	const externalNames = Array.from(
		new Set([
			...(oldFiles.externalDependencies || []).map((dep) => dep.name),
			...(newFiles.externalDependencies || []).map((dep) => dep.name),
		]),
	);

	for (const name of externalNames) {
		const oldDep = oldExternalMap[name];
		const newDep = newExternalMap[name];

		// Doesn't exist in new, but exists in old. Removed. Left outer join.
		if (!newDep && oldDep) {
			removed.push({ modName: oldDep.name });
		}
		// Doesn't exist in old, but exists in new. Added. Right outer join.
		else if (newDep && !oldDep) {
			added.push({ modName: newDep.name });
		}
		// Exists in both. Modified? Inner join.
		else if (
			oldDep &&
			newDep &&
			(oldDep.url !== newDep.url || oldDep.name !== newDep.name)
		) {
			modified.push({ modName: newDep.name });
		}
	}

	return {
		removed: removed,
		modified: modified,
		added: added,
	};
}

const LAUNCHERMETA_VERSION_MANIFEST =
	"https://launchermeta.mojang.com/mc/game/version_manifest.json";

/**
 * Fetches the version manifest associated with the provided Minecraft version.
 *
 * @param minecraftVersion Minecraft version. (e. g., "1.12.2")
 */
export async function getVersionManifest(
	minecraftVersion: string,
): Promise<VersionManifest | undefined> {
	/**
	 * Fetch the manifest file of all Minecraft versions.
	 */
	const manifest: VersionsManifest = (
		await axios({
			url: LAUNCHERMETA_VERSION_MANIFEST,
			method: "get",
			responseType: "json",
		})
	)?.data;

	if (!manifest) return undefined;

	const version = manifest.versions.find((x) => x.id === minecraftVersion);
	if (!version) {
		return;
	}

	return (
		await axios({
			url: version.url,
			method: "get",
			responseType: "json",
		})
	)?.data;
}

/**
 * Cleans up a file's display name, and returns the version. Works for all tested mods!
 * @param version The filename/version to cleanup.
 */
export function cleanupVersion(filename?: string): string {
	if (!filename) return "";

	if (!filename.replace(/[\d+.?]+/g, "")) return filename;

	const version = filename.replace(/1\.12\.2|1\.12|\.jar/g, "");
	const list = version.match(/[\d+.?]+/g);
	if (!list) return version;

	if (list.at(-1) === "0") return version;

	return list.at(-1) ?? "";
}

const issueURLCache: Map<number, string> = new Map<number, string>();

/**
 * Gets all closed issue/PR URLs of the repo, sorted by updated, and saves it to the cache.
 */
export async function getIssueURLs(): Promise<void> {
	if (issueURLCache.size > 0) return;
	if (!shouldTryGetInfo) {
		logError("Skipping Get Issues because of Rate Limits!");
		return;
	}
	try {
		let page = 1;
		const issues = await octokit.paginate(
			octokit.issues.listForRepo,
			{
				owner: repoOwner,
				repo: repoName,
				per_page: 100,
				state: "closed",
				sort: "updated",
			},
			(response, done) => {
				if (page++ >= buildConfig.changelogCacheMaxPages) {
					logInfo(
						`Fetched ${buildConfig.changelogCacheMaxPages} Pages of 100 Issues! Final Issue Fetched: #${response.data.at(-1)?.number ?? 0}`,
					);
					done();
				}
				return response.data;
			},
		);
		for (const issue of issues) {
			if (!issueURLCache.has(issue.number))
				issueURLCache.set(issue.number, issue.html_url);
		}
	} catch (e) {
		logError(
			"Failed to get all Issue URLs of Repo. This may be because there are no issues, or because of rate limits.",
		);
	}
}

/**
 * Gets the specified Issue URL from the cache, or retrieves it.
 */
export async function getIssueURL(issueNumber: number): Promise<string> {
	if (issueURLCache.has(issueNumber))
		return issueURLCache.get(issueNumber) ?? "";
	if (!shouldTryGetInfo) return "";
	try {
		// Try to retrieve, might be open
		const issueInfo = await octokit.issues.get({
			owner: repoOwner,
			repo: repoName,
			issue_number: issueNumber,
		});
		if (issueInfo.status !== 200) {
			logError(
				`Failed to get the Issue/PR Info for Issue/PR #${issueNumber}. Returned Status Code ${issueInfo.status}, expected Status 200.`,
			);
			issueURLCache.set(issueNumber, "");
			return "";
		}
		logInfo(
			`No Issue URL Cache for Issue Number ${issueNumber}. Retrieved Specifically.`,
		);
		issueURLCache.set(issueNumber, issueInfo.data.html_url);
		return issueInfo.data.html_url;
	} catch (e) {
		logError(
			`Failed to get the Issue/PR Info for Issue/PR #${issueNumber}. This may be because this is not a PR or Issue, it was deleted, or because of rate limits.`,
		);
		issueURLCache.set(issueNumber, "");
		return "";
	}
}

// Map of Commit SHA -> Formatted Author
const commitAuthorCache: Map<string, string> = new Map<string, string>();

/**
 * Fills the Commit Author Cache.
 */
export async function getCommitAuthors(): Promise<void> {
	if (commitAuthorCache.size > 0) return;
	if (!shouldTryGetInfo) {
		logError("Skipping Get Commits because of Rate Limits!");
		return;
	}
	try {
		let page = 1;
		const commits = await octokit.paginate(
			octokit.repos.listCommits,
			{
				owner: repoOwner,
				repo: repoName,
				per_page: 100,
			},
			(response, done) => {
				if (page++ >= buildConfig.changelogCacheMaxPages) {
					logInfo(
						`Fetched ${buildConfig.changelogCacheMaxPages} Pages of 100 Commits! Final Commit Fetched: ${response.data.at(-1)?.sha ?? ""}`,
					);
					done();
				}
				return response.data;
			},
		);
		for (const commit of commits) {
			if (!commitAuthorCache.has(commit.sha))
				commitAuthorCache.set(commit.sha, commit.author?.login ?? "");
		}
	} catch (e) {
		logError(
			"Failed to get all Commit Authors of Repo. This may be because there are no commits, or because of rate limits.",
		);
	}
}

/**
 * Gets the Author, in mentionable form (@login), or default (**Display Name**), from a Commit.
 */
export async function formatAuthor(commit: Commit) {
	const defaultFormat = `**${commit.author_name}**`;

	if (commitAuthorCache.has(commit.hash)) {
		const login = commitAuthorCache.get(commit.hash);
		if (login) return `@${login}`;
		return defaultFormat;
	}

	if (!shouldTryGetInfo) return defaultFormat;

	try {
		// Try to retrieve, just in case
		const commitInfo = await octokit.repos.getCommit({
			owner: repoOwner,
			repo: repoName,
			ref: commit.hash,
		});
		if (commitInfo.status !== 200) {
			logError(
				`Failed to get the Author Info for Commit ${commit.hash}. Returned Status Code ${commitInfo.status}, expected Status 200.`,
			);
			commitAuthorCache.set(commit.hash, "");
			return defaultFormat;
		}
		if (!commitInfo.data.author?.login) {
			logError(
				`Failed to get the Author Info for Commit ${commit.hash}. Returned Null Data, Author or Login.`,
			);
			commitAuthorCache.set(commit.hash, "");
			return defaultFormat;
		}
		logInfo(
			`No Author Cache for Commit ${commit.hash}. Retrieved Specifically.`,
		);
		return `@${commitInfo.data.author.login}`;
	} catch (e) {
		logError(
			`Failed to get Commit Author for Commit ${commit.hash}. This may be because there are no commits, or because of rate limits.`,
		);
		commitAuthorCache.set(commit.hash, "");
		return defaultFormat;
	}
}

/**
 * List all Remotes in the Git Repository.
 */
export async function listRemotes(): Promise<string[]> {
	return git.getRemotes().then((r) => r.map((re) => re.name));
}

export const FORGE_VERSION_REG = /forge-(.+)/;
export const FORGE_MAVEN = "https://files.minecraftforge.net/maven/";

export async function getForgeJar(): Promise<{
	forgeJar: Buffer;
	forgeInstallerPath: string;
	forgeUniversalPath: string;
}> {
	const minecraft = modpackManifest.minecraft;

	/**
	 * Break down the Forge version defined in manifest.json.
	 */
	const parsedForgeEntry = FORGE_VERSION_REG.exec(
		minecraft.modLoaders.find((x) => x.id && x.id.indexOf("forge") !== -1)
			?.id || "",
	);

	if (!parsedForgeEntry) {
		throw new Error("Malformed Forge version in manifest.json.");
	}

	/**
	 * Transform Forge version into Maven library path.
	 */
	const forgeMavenLibrary = `net.minecraftforge:forge:${minecraft.version}-${parsedForgeEntry[1]}`;
	const forgeInstallerPath = `${libraryToPath(forgeMavenLibrary)}-installer.jar`;
	const forgeUniversalPath = path.join(
		"maven",
		`${libraryToPath(forgeMavenLibrary)}.jar`,
	);

	/**
	 * Fetch the Forge installer
	 */
	const forgeJar = await fs.promises.readFile(
		(
			await downloadOrRetrieveFileDef({
				url: FORGE_MAVEN + forgeInstallerPath,
			})
		).cachePath,
	);

	return { forgeJar, forgeInstallerPath, forgeUniversalPath };
}

export interface ArrayUnique<T> {
	arr1Unique: T[];
	arr2Unique: T[];
}

/**
 * Returns the values unique to each array, via lodash.
 */
export function getUniqueToArray<T>(
	arr1: T[],
	arr2: T[],
	mappingFunc?: (val: T) => unknown,
): ArrayUnique<T> {
	if (mappingFunc)
		return {
			arr1Unique: lodash.differenceBy(arr1, arr2, mappingFunc),
			arr2Unique: lodash.differenceBy(arr2, arr1, mappingFunc),
		};
	return {
		arr1Unique: lodash.difference(arr1, arr2),
		arr2Unique: lodash.difference(arr2, arr1),
	};
}

export function shouldSkipChangelog(): boolean {
	if (!isEnvVariableSet("SKIP_CHANGELOG")) return false;

	let skip = false;
	try {
		skip = JSON.parse((process.env.SKIP_CHANGELOG ?? "false").toLowerCase());
	} catch (err) {
		throw new Error("Skip Changelog Env Variable set to Invalid Value.");
	}

	if (skip) logInfo("Skipping Changelogs...");
	return skip;
}

export type Task = Promise<unknown> | (() => Promise<unknown>);

export function series(...tasks: Task[]): () => Promise<void> {
	return async () => {
		for (const task of tasks) {
			if (typeof task === "function") {
				await task();
			} else {
				await task;
			}
		}
	};
}

export function parallel(...tasks: Task[]): () => Promise<void> {
	return async () => {
		await Promise.all(tasks);
	};
}

export function filesize(size: number) {
	let bytes = size;
	const units = ["B", "KB", "MB", "GB", "TB"];
	let i = 0;

	while (bytes >= 1024 && i < units.length - 1) {
		bytes /= 1024;
		i++;
	}

	return `${bytes.toFixed(2)} ${units[i]}`;
}
