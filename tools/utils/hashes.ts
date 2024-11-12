import { createHash } from "node:crypto";
import type { HashDef } from "#types/hashDef.ts";

/**
 * Returns the hash sum of bytes of given bytes using SHA1.
 *
 * This is what CurseForge and Forge are using to check files.
 */
export async function sha1(data: string | Buffer): Promise<string> {
	const hash = createHash("sha1");

	hash.update(typeof data === "string" ? Buffer.from(data) : data);

	return hash.digest("hex");
}

/**
 * Returns the hash sum of bytes of given bytes using MD5.
 *
 * This is what CF is using to check files.
 */
export async function md5(data: string | Buffer): Promise<string> {
	const hash = createHash("md5");
	hash.update(typeof data === "string" ? Buffer.from(data) : data);
	return hash.digest("hex");
}

const hashFuncs: Record<string, (data: string | Buffer) => Promise<string>> = {
	sha1,
	md5,
};

/**
 * Compare buffer to the given HashDef.
 *
 * @param {Buffer} buffer
 * @param {HashDef} hashDef
 *
 * @throws {Error} Throws a generic error if hashes don't match.
 */
export async function compareBufferToHashDef(
	buffer: Buffer,
	hashDef: HashDef,
): Promise<boolean> {
	if (!hashFuncs[hashDef.id]) {
		throw new Error(`No hash function found for ${hashDef.id}.`);
	}

	const sum = await hashFuncs[hashDef.id]?.(buffer);
	return (
		(Array.isArray(hashDef.hashes) && hashDef.hashes.includes(sum)) ||
		hashDef.hashes === sum
	);
}
