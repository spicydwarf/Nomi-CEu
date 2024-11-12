import PortQBData from "./portQBData.ts";
import {
	booleanSelect,
	dependencies,
	emptyQuest,
	findQuest,
	id,
	name,
	stripRewards,
} from "../actionQBUtils.ts";
import type { Quest } from "#types/bqQuestBook.ts";
import { performModification } from "./portQBModifications.ts";
import logInfo, { logNotImportant } from "../../../utils/log.ts";

let data: PortQBData;

export function setupLogic(dataIn: PortQBData): void {
	data = dataIn;
}

export async function additions(): Promise<void> {
	if (!(await booleanSelect("Port Additions?"))) {
		logNotImportant("Skipping...");
		return;
	}
	let newID =
		[...data.toChangeIDsToQuests.keys()].sort((a, b) => a - b).pop() ?? 0;
	const addingQuests: Quest[] = [];
	logNotImportant("Porting Additions...");
	for (const addition of data.changed.added) {
		if (
			!(await booleanSelect(
				`Would you like to add Quest with ID ${id(addition)} and Name ${name(addition)}?`,
				"Continue",
				"Cancel",
			))
		) {
			logInfo("Skipping...");
			continue;
		}

		const addingID = ++newID;
		logInfo(`Adding New Quest with ID ${addingID}...`);

		const newQuest = { ...addition } as Quest; // Copy Quest
		newQuest["questID:3"] = addingID;
		addingQuests.push(newQuest);

		// Add to Auto Quest Detection Map
		data.foundQuests.set(id(addition), newQuest);
	}

	// Sort out Dependencies (Do Afterwards, so if new quests dep on each other, that works)
	if (addingQuests.length === 0) return;
	for (const quest of addingQuests) {
		logInfo(
			`Modifying Deps for Quest with ID ${id(quest)} and Name ${name(quest)}...`,
		);
		const deps = dependencies(quest);
		const depTypes = quest["preRequisiteTypes:7"];
		const useDepTypes = depTypes && depTypes.length === deps.length;

		for (const [i, dep] of deps.entries()) {
			const depQuest = await findQuest(dep);
			if (!depQuest) {
				deps.splice(i, 1);
				if (useDepTypes) {
					depTypes.splice(i, 1);
				}
			} else deps[i] = id(depQuest);
		}

		// if we are porting TO expert, strip rewards
		if (data.type === "NORMAL") {
			logInfo("Stripping Rewards...");
			stripRewards(quest);
		}

		// Push to Output
		data.toChangeIDsToQuests.set(id(quest), quest);
	}
}

export async function modifications(): Promise<void> {
	if (!(await booleanSelect("Port Modifications?"))) {
		logNotImportant("Skipping...");
		return;
	}
	logNotImportant("Porting Modifications...");
	for (const modified of data.changed.modified) {
		await performModification(modified);
	}
}

export async function removals(): Promise<void> {
	if (!(await booleanSelect("Port Removals?"))) {
		logNotImportant("Skipping...");
		return;
	}
	logNotImportant("Porting Removals...");
	for (const removal of data.changed.removed) {
		if (
			!(await booleanSelect(
				`Would you like to remove Quest with ID ${id(removal)} and Name ${name(removal)}?`,
				"Continue",
				"Cancel",
			))
		) {
			logInfo("Skipping...");
			continue;
		}
		const quest = await findQuest(
			id(removal),
			data.oldIDsToQuests?.get(id(removal)),
		);
		if (!quest) {
			logInfo("Skipping, Could not find Corresponding Quest...");
			continue;
		}
		logInfo("Removing Quest...");
		const newId = id(quest);

		const newEmptyQuest = { ...emptyQuest } as Quest; // Copy Quest
		newEmptyQuest["questID:3"] = newId;
		data.toChangeIDsToQuests.set(newId, newEmptyQuest);

		// Remove quest from Quest Lines
		if (data.questLines) {
			for (const line of data.questLines) {
				for (const [key, questInfo] of Object.entries(line["quests:9"])) {
					if (newId === questInfo["id:3"]) {
						delete line["quests:9"][key];
					}
				}
			}
		}
	}
}
