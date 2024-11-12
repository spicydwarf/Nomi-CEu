import { modpackManifest } from "#globals";
import { makeArtifactNameBody } from "#utils/util.ts";
import sanitize from "sanitize-filename";
import { setOutput } from "@actions/core";
import logInfo from "#utils/log.js";

export async function makeArtifactNames(): Promise<void> {
	const body = makeArtifactNameBody(modpackManifest.name);
	const names: Record<string, string> = {
		client: body + "-client",
		server: body + "-server",
		lang: body + "-lang",
		mmc: body + "-mmc",
	};

	for (const [type, name] of Object.entries(names)) {
		setOutput(type, sanitize(name.toLowerCase()));
		logInfo(`Made Name for Type '${type}': '${name.toLowerCase()}'`);
	}
}
