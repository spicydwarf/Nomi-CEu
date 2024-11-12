import type { HashDef } from "./hashDef.ts";

export type FileDef = {
	url: string;
	hashes?: HashDef[];
};
