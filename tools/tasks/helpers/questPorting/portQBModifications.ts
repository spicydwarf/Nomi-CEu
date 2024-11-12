import { editor, input, select } from "@inquirer/prompts";
import dedent from "dedent-js";
import lodash from "lodash";
import picomatch from "picomatch";
import colors from "yoctocolors";
import {
	type BunchedParserPath,
	type ChangeAndPath,
	type CustomDescriptionTaskTemplate,
	type DescriptionTaskChange,
	LogicType,
	Message,
	type Modified,
	type Parser,
	type QuestChange,
	type SimpleLogic,
	type TaskDifferentSolution,
	type YesIgnoreNo,
	type Operation,
} from "#types/actionQBTypes.ts";
import type { Quest, Task } from "#types/bqQuestBook.ts";
import { logError, logInfo, logNotImportant, logWarn } from "#utils/log.ts";
import type { ArrayUnique } from "#utils/util.ts";
import { booleanSelect, findQuest, id, name } from "../actionQBUtils.ts";
import type PortQBData from "./portQBData.ts";
import { applyChanges, formatDiff } from "#utils/diff.js";

let data: PortQBData;
const taskKey = "tasks";

const OPERATION_FORMATS = {
	add: "Addition",
	remove: "Removal",
	replace: "Modification",
} as const satisfies Record<Operation, string>;

export function setupModifications(dataIn: PortQBData): void {
	data = dataIn;
}

export async function performModification(modify: Modified): Promise<void> {
	const { formattedNames, callableFunctions } = findAllParsers(modify);
	if (formattedNames.length === 0 || callableFunctions.length === 0) {
		logNotImportant(
			`All Modification Changes on this Quest with ID ${id(modify.currentQuest)} and Name ${name(
				modify.currentQuest,
			)} were Skipped.`,
		);
		return;
	}

	// Relying on the fact that the messages are sorted, condense duplicates.
	const output: Message[] = [];
	let lastMsg: string | undefined = undefined;
	for (const [i, formattedName] of formattedNames.entries()) {
		if (i !== 0 && formattedName === lastMsg) {
			output[i - 1]?.incrementRepeats();
			continue;
		}
		output.push(new Message(formattedName));
		lastMsg = formattedName;
	}

	if (
		!(await booleanSelect(
			`Would you like to perform modifications on Quest with ID ${id(modify.currentQuest)} and Name ${name(
				modify.currentQuest,
			)}?\nChanges: ${output.map((msg) => msg.toFormattedString()).join(", ")}`,
		))
	) {
		logNotImportant("Skipping...");
		return;
	}
	const quest = await findQuest(id(modify.currentQuest));
	if (!quest) {
		logInfo("Skipping, Could not find Corresponding Quest...");
		return;
	}
	for (const func of callableFunctions) {
		await func(quest);
	}
}

function getSimpleFormattedParserName(
	parser: Parser,
	logic: SimpleLogic,
	path: string[],
	op: Operation,
) {
	if (!logic.formattedName) return `${parser.name} ${formatOp(op)}`;
	return logic.formattedName(path, op);
}

function formatOp(operation: Operation): string {
	return OPERATION_FORMATS[operation];
}

function findAllParsers(modify: Modified): {
	formattedNames: string[];
	callableFunctions: ((questToModify: Quest) => Promise<void>)[];
} {
	const outputFunctions: ((questToModify: Quest) => Promise<void>)[] = [];
	const outputFormatted: string[] = [];

	const foundBuncableParsers = new Map<string, BunchedParserPath[]>();
	const foundSimpleParserIds = new Set<string>();
	for (const change of modify.change) {
		const pathList = change.path.map((path) =>
			typeof path === "number" ? path.toString() : (path.split(":")[0] ?? ""),
		);

		const path = pathList.join("/");

		// Instead of filtering out ignored parsers before, we must check if the parser match is one that is ignored
		// This is because otherwise the general parser would be called instead
		for (const parser of modificationParsers) {
			if (!parser.condition(path)) continue;

			// ID Checks and Handles
			if (data.modifyParsersIgnore.has(parser.id)) {
				logNotImportant(
					`Skipping Change with Parser with id '${parser.id}'...`,
				);
				break;
			}
			if (parser.logic.type === LogicType.Simple) {
				if (foundSimpleParserIds.has(parser.id)) break;
				if (parser.logic.applyOnce) foundSimpleParserIds.add(parser.id);
			}

			// Simple Parser Logic
			if (parser.logic.type === LogicType.Simple) {
				outputFunctions.push(
					async (quest) =>
						await (parser.logic as SimpleLogic).func(
							quest,
							modify,
							change,
							pathList,
						),
				);
				outputFormatted.push(
					getSimpleFormattedParserName(
						parser,
						parser.logic,
						pathList,
						change.op,
					),
				);
				break;
			}

			// Bunched Parser Logic
			const changeAndPath: ChangeAndPath = { change: change, path: pathList };
			if (!foundBuncableParsers.has(parser.id)) {
				foundBuncableParsers.set(parser.id, [
					{ logic: parser.logic, changeAndPath: [changeAndPath] },
				]);
				break;
			}

			let foundBunch = false;
			for (const parserBunch of foundBuncableParsers.get(parser.id) ?? []) {
				if (
					parserBunch.changeAndPath[0] &&
					!parserBunch.logic.applyTogether(
						parserBunch.changeAndPath[0].path,
						pathList,
					)
				)
					continue;
				parserBunch.changeAndPath.push(changeAndPath);
				foundBunch = true;
			}
			if (!foundBunch) {
				foundBuncableParsers
					.get(parser.id)
					?.push({ logic: parser.logic, changeAndPath: [changeAndPath] });
			}
			break;
		}
	}

	// Change Bunched Parsers Into Function
	for (const bunchList of foundBuncableParsers.values()) {
		for (const bunch of bunchList) {
			outputFunctions.push(
				async (quest) =>
					await bunch.logic.func(quest, modify, bunch.changeAndPath),
			);
			outputFormatted.push(...bunch.logic.formattedName(bunch.changeAndPath));
		}
	}

	return {
		formattedNames: outputFormatted.sort(),
		callableFunctions: outputFunctions,
	};
}

function assertIsModification(change: QuestChange) {
	if (change.op !== "replace")
		throw new Error(dedent`
		  Runtime Exception: Addition/Removal Should Not Happen Here!
		  If this is a Proper Change, Report this to the Core Devs of Nomi-CEu!
        Path: ${change.path.toString()}
		`);
}

const modifyDesc = async (
	questToModify: Quest,
	modify: Modified,
	change: QuestChange,
) => {
	assertIsModification(change);
	const oldQuest =
		modify.oldQuest["properties:10"]["betterquesting:10"]["desc:8"];
	const newQuest =
		modify.currentQuest["properties:10"]["betterquesting:10"]["desc:8"];
	const originalQuest =
		questToModify["properties:10"]["betterquesting:10"]["desc:8"];

	logInfo(colors.bold("Change in Source Quest:"));
	console.log(formatDiff(oldQuest, newQuest));
	const apply = applyChanges(oldQuest, newQuest, originalQuest);
	logInfo(colors.bold("If Applied:"));
	console.log(formatDiff(originalQuest, apply));
	logInfo(colors.bold("If Replaced:"));
	console.log(formatDiff(originalQuest, newQuest));

	const applyMode = (await select({
		message: "How Should we Apply this Change to the Description?",
		choices: [
			{ name: "Apply Changes on top of Existing Description", value: "APPLY" },
			{ name: "Replace Existing Description", value: "REPLACE" },
			{ name: "Enter Own Description", value: "CUSTOM" },
			{ name: "Ignore this Change", value: "IGNORE" },
		],
	})) as DescriptionTaskChange;
	if (applyMode === "IGNORE") {
		logInfo("Ignoring...");
		return;
	}

	let description: string;
	switch (applyMode) {
		case "APPLY":
			logInfo("Applying Description Change...");
			description = apply;
			break;
		case "REPLACE":
			logInfo("Replacing Description...");
			description = newQuest;
			break;
		case "CUSTOM": {
			const template = (await select({
				message: "What Should the Original Text Be?",
				choices: [
					{ name: "Description with Changes Applied", value: "APPLY" },
					{ name: "Description with Changes Replaced", value: "REPLACE" },
					{ name: "Original Description", value: "ORIGINAL" },
				],
			})) as CustomDescriptionTaskTemplate;
			const templateStr =
				template === "APPLY"
					? apply
					: template === "REPLACE"
						? newQuest
						: originalQuest;
			description = await editor({
				message:
					"Enter your Custom Description. Enter an Empty String to Cancel!",
				default: templateStr,
			});
			if (!description) {
				logInfo("Cancelling...");
				return;
			}
			break;
		}
	}

	questToModify["properties:10"]["betterquesting:10"]["desc:8"] = description;
};

const modifyIcon = async (
	questToModify: Quest,
	modify: Modified,
	change: QuestChange,
) => {
	// Tag Compounds might be removed/added
	if (
		change.path.toString() !== "properties:10,betterquesting:10,icon:10,tag:10"
	)
		assertIsModification(change);

	const oldIcon =
		modify.oldQuest["properties:10"]["betterquesting:10"]["icon:10"];
	const newIcon =
		modify.currentQuest["properties:10"]["betterquesting:10"]["icon:10"];
	const currentIcon =
		questToModify["properties:10"]["betterquesting:10"]["icon:10"];

	const newIconString = JSON.stringify(newIcon, null, 2) ?? "";

	logInfo(colors.bold("Change in Source Quest:"));
	console.log(
		formatDiff(JSON.stringify(oldIcon, null, 2) ?? "", newIconString),
	);
	logInfo(colors.bold("If Applied to Current Quest:"));
	console.log(
		formatDiff(JSON.stringify(currentIcon, null, 2) ?? "", newIconString),
	);

	if (!(await booleanSelect("Should we Apply This Icon Change?"))) {
		logNotImportant("Skipping...");
		return;
	}

	logInfo("Applying Icon Change...");
	questToModify["properties:10"]["betterquesting:10"]["icon:10"] = newIcon;
};

const modifyTasks = async (
	questToModify: Quest,
	modify: Modified,
	changeAndPaths: ChangeAndPath[],
) => {
	logInfo("Performing Tasks Change...");
	const oldTasks = modify.oldQuest["tasks:9"];
	const newTasks = modify.currentQuest["tasks:9"];
	const currentTasks = questToModify["tasks:9"];

	let same = true;

	let toModify: Map<number, Task>;
	if (!lodash.isEqual(oldTasks, currentTasks)) {
		logWarn(
			"The Tasks Object in the Current Quest and the Original Source Quest is different!",
		);
		logInfo(colors.bold("Change:"));
		console.log(
			formatDiff(
				JSON.stringify(Object.values(currentTasks), null, 2) ?? "",
				JSON.stringify(Object.values(oldTasks), null, 2) ?? "",
			),
		);

		const solution = (await select({
			message: "What should we do?",
			choices: [
				{
					name: "Replace the Current Tasks with the Original Tasks",
					value: "APPLY",
				},
				{
					name: "Continue without Replacing (MAY CAUSE PROBLEMS!)",
					value: "CONTINUE",
				},
				{
					name: "Ignore this Change",
					value: "IGNORE",
				},
			],
		})) as TaskDifferentSolution;

		switch (solution) {
			case "APPLY":
				logInfo("Replacing...");
				toModify = new Map(
					Object.values(oldTasks).map((task) => [task["index:3"], task]),
				);
				break;
			case "CONTINUE":
				logWarn(
					"Warning: Please Check the Context of each Change in the JSON File before Applying!",
				);
				same = false;
				break;
			case "IGNORE":
				logNotImportant("Skipping...");
				return;
		}
	} else {
		if (!(await booleanSelect("Should we Apply Task Changes on this Quest?"))) {
			logNotImportant("Skipping...");
			return;
		}
	}

	toModify ??= new Map(
		Object.values(currentTasks).map((task) => [task["index:3"], task]),
	);

	// Sort Changes into Map of Index to Changes
	const changes = new Map<number, ChangeAndPath[]>();
	for (const change of changeAndPaths) {
		const index = getIndex(change.path, taskKey);
		if (!changes.has(index)) changes.set(index, [change]);
		else changes.get(index)?.push(change);
	}

	for (const entry of changes.entries()) {
		const [index, changes] = entry;

		if (index < 0)
			throw new Error("Invalid Path! Report to the Core Devs of Nomi-CEu!");

		// Are we adding/removing a whole task?
		if (
			changes.length === 1 &&
			changes[0] &&
			isAddingOrRemovingComplexTask(changes[0].path)
		) {
			let task: Task;
			const change = changes[0];

			if (change.change.op === "add") {
				task = newTasks[change.change.path.at(-1) ?? "0:10"] as Task;
			} else {
				const foundTask = toModify.get(index);
				if (!foundTask) {
					logError(
						`Current Task Object does not Contain Index ${index}! Skipping...`,
					);
					continue;
				}
				task = foundTask;
			}

			const id = task["taskID:8"];

			if (
				!(await booleanSelect(
					`Should we ${change.change.op === "add" ? "Add" : "Remove"} Task No. ${index + 1} with ID ${id}?`,
				))
			) {
				logNotImportant("Skipping...");
				continue;
			}

			if (change.change.op === "add") {
				const newIndex = same
					? index
					: (lodash.max(Array.from(toModify.keys())) ?? 0) + 1;

				const newTask: Task = { ...task };
				if (!same) newTask["index:3"] = newIndex;

				logInfo(`Adding Task No. ${newIndex + 1} and ID ${id}...`);
				toModify.set(newIndex, newTask);
			} else {
				logInfo(`Removing Task No. ${index + 1} and ID ${id}...`);
				toModify.delete(index);
			}
			continue;
		}

		// Modification of a Task
		const oldTask = Object.values(oldTasks)[index];
		const newTask = Object.values(newTasks)[index] as Task;
		let task = toModify.get(index);
		if (same) {
			if (!task) {
				throw new Error(
					`Current Task Object does not Contain Index ${index}! Please Report this to the Core Devs of Nomi-CEu!`,
				);
			}
			logInfo(colors.bold("Change:"));
			console.log(
				formatDiff(
					JSON.stringify(task, null, 2) ?? "",
					JSON.stringify(newTask, null, 2) ?? "",
				),
			);
			if (!(await booleanSelect("Should we Apply this Change?"))) {
				logNotImportant("Skipping...");
				continue;
			}
			logInfo("Applying Change...");
			toModify.set(index, { ...newTask });
			continue;
		}

		let confirmedTask: Task | undefined = undefined;
		let cancelled = false;
		while (!confirmedTask) {
			if (!task) {
				const retrievedIndex = Number.parseInt(
					await input({
						message: `Corresponding Index for Task with Index ${index} is Empty! Please enter the Corresponding Index: (-1 to Cancel/Ignore)`,
						validate: (value) => {
							const numValue = Number.parseInt(value);
							if (numValue === -1) return true; // Allow Cancelling
							if (Number.isNaN(numValue) || numValue < 0) {
								return "Please Enter a Number Value >= 0!";
							}
							const foundTask = toModify.get(numValue);
							if (!foundTask) {
								return "Please Enter a Valid 0-Based Index!";
							}
							return true;
						},
					}),
				);
				if (retrievedIndex === -1) {
					logNotImportant("Skipping...");
					cancelled = true;
					break;
				}
				task = toModify.get(retrievedIndex);
			}

			if (!task)
				throw new Error(
					"Task is Undefined! This should not Happen! Report this to the Core Devs of Nomi-CEu!",
				);

			logInfo(
				`Does Task with Index ${index} in Source Quest Correspond to Task with Index ${task["index:3"]} in the Target Quest?`,
			);
			logInfo(colors.bold("Difference:"));
			console.log(
				formatDiff(
					JSON.stringify(oldTask, null, 2) ?? "",
					JSON.stringify(task, null, 2) ?? "",
				),
			);

			const choice = (await select({
				message: "Is this Correct?",
				choices: [
					{
						name: "Yes",
						value: "YES",
					},
					{
						name: "No",
						value: "NO",
					},
					{
						name: "Ignore",
						value: "IGNORE",
					},
				],
			})) as YesIgnoreNo;
			if (choice === "IGNORE") {
				logNotImportant("Skipping...");
				cancelled = true;
				break;
			}
			if (choice === "NO") {
				logInfo("Please Enter the Correct Index Below.");
				task = undefined;
				continue;
			}
			confirmedTask = task;
		}
		if (cancelled) continue;

		const oldTaskString = JSON.stringify(oldTask, null, 2) ?? "";
		const newTaskString = JSON.stringify(newTask, null, 2) ?? "";
		const currentTaskString = JSON.stringify(confirmedTask, null, 2) ?? "";

		logInfo(colors.bold("Change in Source Quest:"));
		console.log(formatDiff(oldTaskString, newTaskString));
		const apply = applyChanges(oldTaskString, newTaskString, currentTaskString);
		logInfo(colors.bold("If Applied:"));
		console.log(formatDiff(currentTaskString, apply));
		logInfo(colors.bold("If Replaced:"));
		console.log(formatDiff(currentTaskString, newTaskString));

		const applyMode = (await select({
			message: "How Should we Apply this Task Change?",
			choices: [
				{
					name: "Apply Changes on top of Existing Task",
					value: "APPLY",
				},
				{ name: "Replace Existing Task", value: "REPLACE" },
				{ name: "Enter Own Task", value: "CUSTOM" },
				{ name: "Ignore this Change", value: "IGNORE" },
			],
		})) as DescriptionTaskChange;

		if (applyMode === "IGNORE") {
			logInfo("Ignoring...");
			return;
		}

		let taskObj: Task | undefined;
		switch (applyMode) {
			case "APPLY":
				logInfo("Applying Description Change...");
				try {
					taskObj = JSON.parse(apply) as Task;
				} catch (e) {
					logWarn("Invalid JSON! Enter your own Below!");
					taskObj = await getCustomTasks(
						currentTaskString,
						newTaskString,
						apply,
					);
				}
				break;
			case "REPLACE":
				logInfo("Replacing Description...");
				taskObj = { ...newTask };
				break;
			case "CUSTOM":
				taskObj = await getCustomTasks(currentTaskString, newTaskString, apply);
				break;
		}
		if (!taskObj) continue;
		logInfo("Performing Task Modification...");
		toModify.set(confirmedTask?.["index:3"] ?? 0, taskObj);
	}
	questToModify["tasks:9"] = {};
	for (const entry of toModify) {
		questToModify["tasks:9"][`${entry[0]}:10`] = entry[1];
	}
};

async function getCustomTasks(
	originalTask: string,
	newTask: string,
	apply: string,
): Promise<Task | undefined> {
	let foundTask: Task | undefined = undefined;

	while (!foundTask) {
		const template = (await select({
			message: "What Should the Default Text Be?",
			choices: [
				{ name: "Description with Changes Applied", value: "APPLY" },
				{ name: "Description with Changes Replaced", value: "REPLACE" },
				{ name: "Original Description", value: "ORIGINAL" },
			],
		})) as CustomDescriptionTaskTemplate;
		const templateStr =
			template === "APPLY"
				? apply
				: template === "REPLACE"
					? newTask
					: originalTask;

		const taskString = await editor({
			message: "Enter your Custom Task. Enter an Empty String to Cancel!",
			default: templateStr,
		});
		if (!taskString) {
			logInfo("Cancelling...");
			return undefined;
		}
		try {
			foundTask = JSON.parse(taskString) as Task;
		} catch (e) {
			logWarn("Invalid JSON!");
			foundTask = undefined;
		}
	}
	return foundTask;
}

const modifyPrerequisites = async (
	questToModify: Quest,
	modify: Modified,
	change: QuestChange,
) => {
	logInfo("Performing Prerequisite Modifications...");

	// Get Array Diff
	const arrayDiff = change.value as ArrayUnique<number>;

	const preRequisiteArrayCurrent = modify.currentQuest["preRequisites:11"];
	const preRequisiteTypeArrayCurrent =
		modify.currentQuest["preRequisiteTypes:7"];

	const preRequisiteArray = questToModify["preRequisites:11"];
	const preRequisiteTypeArray = questToModify["preRequisiteTypes:7"];

	const preRequisites = new Map<number, number>();

	preRequisiteArray.forEach((pre, index) =>
		preRequisites.set(pre, preRequisiteTypeArray?.[index] ?? 0),
	);

	// Unique to Current: Added.
	for (const added of arrayDiff.arr2Unique) {
		const toAdd = await findQuest(added);
		if (!toAdd) {
			logInfo("Skipping, Could not find Corresponding Quest...");
			return;
		}
		if (preRequisites.has(id(toAdd))) {
			logNotImportant("Quest Already Contains Added Prerequisite.");
			return;
		}
		if (
			!(await booleanSelect(
				`Should we Add Quest with ID ${id(toAdd)} and Name ${name(toAdd)} as a Prerequisite?`,
			))
		) {
			logNotImportant("Skipping...");
			return;
		}
		logInfo("Adding Prerequisite...");
		const index = preRequisiteArrayCurrent.indexOf(added);
		preRequisites.set(
			id(toAdd),
			index === -1 || !preRequisiteTypeArrayCurrent
				? 0
				: (preRequisiteTypeArrayCurrent[index] ?? 0),
		);
	}

	// Unique to Old: Removed.
	for (const removed of arrayDiff.arr1Unique) {
		const toRemove = await findQuest(removed);
		if (!toRemove) {
			logInfo("Skipping, Could not find Corresponding Quest...");
			return;
		}
		if (!preRequisites.has(id(toRemove))) {
			logNotImportant("Quest Does Not Contain Removed Prerequisite.");
			return;
		}
		if (
			!(await booleanSelect(
				`Should we Remove Quest with ID ${id(toRemove)} and Name ${name(toRemove)} as a Prerequisite?`,
			))
		) {
			logNotImportant("Skipping...");
			return;
		}
		logInfo("Removing Prerequisite...");
		preRequisites.delete(id(toRemove));
	}

	// Save
	questToModify["preRequisites:11"] = Array.from(preRequisites.keys()).sort(
		(a, b) => a - b,
	);
	if (
		Array.from(preRequisites.values()).findIndex((value) => value !== 0) === -1
	)
		return;
	const types: number[] = [];
	for (const [i, pre] of questToModify["preRequisites:11"].entries()) {
		types[i] = preRequisites.get(pre) ?? 0;
	}
	questToModify["preRequisiteTypes:7"] = types;
};

const modifyGeneral = async (
	questToModify: Quest,
	modify: Modified,
	change: QuestChange,
	path: string[],
): Promise<void> => {
	assertIsModification(change);
	logInfo(`Change in '${path.pop()}':`);

	const newValue = lodash.get(modify.currentQuest, change.path);
	const newValueAsString = JSON.stringify(newValue) ?? "";

	logInfo(colors.bold("Change in Source Quest:"));
	console.log(
		formatDiff(
			JSON.stringify(lodash.get(modify.oldQuest, change.path)) ?? "",
			newValueAsString,
		),
	);
	logInfo(colors.bold("Change if Applied:"));
	console.log(
		formatDiff(
			JSON.stringify(lodash.get(questToModify, change.path)) ?? "",
			newValueAsString,
		),
	);

	const shouldContinue = await booleanSelect(
		"Would you like to apply this Change?",
	);
	if (!shouldContinue) {
		logNotImportant("Skipping...");
		return;
	}

	logInfo("Applying Change...");
	lodash.set(questToModify, change.path, newValue);
};

function isAddingOrRemovingComplexTask(path: string[]): boolean {
	return path.length === 2;
}

function getIndex(path: string[], pathKey: string): number {
	const index = path.indexOf(pathKey) + 1;
	if (index === 0 || index >= path.length) return -1; // indexOf returns -1 if not found, +1 = 0
	const num = Number.parseInt(path[index] as string);
	if (Number.isNaN(num)) return -1;
	return num;
}

function getFormattedNameWithIndex(
	path: string[],
	op: Operation,
	pathKey: string,
	baseName: string,
): string {
	const defaultVal = `${baseName} ${formatOp(op)}`;

	if (op !== "replace") return defaultVal;
	const index = getIndex(path, pathKey);
	if (index === -1) return defaultVal;

	return `${baseName} No. ${index + 1} Modification`;
}

export const modificationParsers = [
	{
		id: "icon",
		name: "Icon",
		condition: picomatch("properties/betterquesting/icon/*"),
		logic: {
			type: LogicType.Simple,
			applyOnce: true,
			formattedName: () => "Icon Modification",
			func: modifyIcon,
		},
	},
	{
		id: "desc",
		name: "Description",
		condition: picomatch("properties/betterquesting/desc"),
		logic: {
			type: LogicType.Simple,
			applyOnce: true,
			func: modifyDesc,
		},
	},
	{
		id: taskKey,
		name: "Task",
		condition: picomatch("tasks/**/*"),
		logic: {
			type: LogicType.Bunched,
			applyTogether: () => true,
			formattedName: (changes) => {
				const result: string[] = [];
				const uniqueChanges = lodash.uniqBy(changes, (change) =>
					getIndex(change.path, taskKey),
				);

				for (const change of uniqueChanges) {
					if (
						!isAddingOrRemovingComplexTask(change.path) &&
						change.change.op !== "replace"
					)
						change.change.op = "replace";
					result.push(
						getFormattedNameWithIndex(
							change.path,
							change.change.op,
							taskKey,
							"Task",
						),
					);
				}
				return result;
			},
			func: modifyTasks,
		},
	},
	{
		id: "prerequisites",
		name: "Prerequisite",
		condition: picomatch("preRequisites-CUSTOM"),
		logic: {
			type: LogicType.Simple,
			applyOnce: false,
			func: modifyPrerequisites,
		},
	},
	{
		id: "general",
		name: "General Changes",
		condition: picomatch("**/*"),
		logic: {
			type: LogicType.Simple,
			applyOnce: false,
			formattedName: (path, op) => `'${path.at(-1)}' ${formatOp(op)}`,
			func: modifyGeneral,
		},
	},
] as Parser[];
