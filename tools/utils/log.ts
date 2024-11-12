import colors from "yoctocolors";

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
	hour12: false,
});

function withTimestamp(str: string) {
	return `[${TIME_FORMAT.format(new Date())}] ${str}`;
}

export function logNotImportant(message: string): void {
	console.info(withTimestamp(colors.dim(message)));
}

export function logInfo(message: string): void {
	console.info(withTimestamp(message));
}

export function logWarn(message: string): void {
	console.warn(withTimestamp(colors.yellow(message)));
}

export function logError(message: string): void {
	console.error(withTimestamp(colors.red(colors.bold(message))));
}
