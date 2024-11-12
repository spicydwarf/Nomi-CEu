// noinspection JSUnusedGlobalSymbols,UnnecessaryLocalVariableJS

import { parallel, series } from "#utils/util.ts";

import { makeArtifactNames } from "#tasks/misc/makeArtifactNames.ts";
import * as changelog from "./tasks/changelog/index.ts";
import checkTasks from "./tasks/checks/index.ts";
import clientTasks from "./tasks/client/index.ts";
import { deployCurseForge } from "./tasks/deploy/curseforge.ts";
import * as release from "./tasks/deploy/releases.ts";
import * as checkFix from "./tasks/helpers/questChecks/index.ts";
import * as qbPort from "./tasks/helpers/questPorting/index.ts";
import langTasks from "./tasks/lang/index.ts";
import * as modTasks from "./tasks/misc/downloadMods.ts";
import pruneCache from "./tasks/misc/pruneCache.ts";
import * as transformFiles from "./tasks/misc/transformFiles.ts";
import {
	zipAll,
	zipClient,
	zipClientCF,
	zipLang,
	zipMMC,
	zipServer,
	zipServerCF,
} from "./tasks/misc/zip.ts";
import mmcTasks from "./tasks/mmc/index.ts";
import serverTasks from "./tasks/server/index.ts";
import * as sharedTasks from "./tasks/shared/index.ts";

const TASKS = {
	pruneCache,

	updateFilesIssue: transformFiles.updateFilesIssue,
	updateFilesLabsVersion: transformFiles.updateFilesVersion,
	updateFilesMainMenu: transformFiles.updateFilesMainMenu,
	updateFilesAll: transformFiles.updateAll,

	createChangelog: changelog.createRootChangelog,

	buildClient: series(sharedTasks.default, clientTasks),
	buildServer: series(
		parallel(sharedTasks.default, modTasks.downloadSharedAndServer),
		serverTasks,
	),
	buildLang: series(sharedTasks.default, langTasks),
	buildMMC: series(
		parallel(sharedTasks.default, modTasks.downloadSharedAndClient),
		mmcTasks,
	),
	buildAll: series(
		sharedTasks.default,
		parallel(
			clientTasks,
			langTasks,
			series(modTasks.downloadSharedAndServer, serverTasks),
		),
	),
	buildChangelog: sharedTasks.buildChangelog,
	check: checkTasks,

	zipClient,
	zipServer,
	zipLang,
	zipMMC,
	zipClientCF,
	zipServerCF,
	zipAll,

	makeArtifactNames,

	checkQB: checkFix.check,
	fixQB: checkFix.fix,
	portQB: series(qbPort.default, checkFix.fix),

	deployCurseForge,
	deployReleases: release.default,
} as const;

const args = process.argv.slice(2);

if (args.length === 0) {
	await TASKS.buildAll();
	process.exit();
} else if (args[0] && args[0] === "tasks") {
	console.log("Available Tasks:");
	console.log(
		Object.keys(TASKS)
			.map((task) => `\t${task}`)
			.join("\n"),
	);
	process.exit();
} else if (args[0]) {
	const task = TASKS[args[0] as keyof typeof TASKS];

	await task();
}
