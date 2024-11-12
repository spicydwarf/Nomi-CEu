import type {
	Category,
	ChangelogMessage,
	SubCategory,
} from "#types/changelogTypes.ts";
import { categories } from "./definitions.ts";

export function categoriesSetup(): void {
	// Initialize Category Lists
	for (const categoryKey of categories) {
		initializeCategorySection(categoryKey);
	}
}

/**
 * Initializes the categorySection field of the categoryKey.
 * @param category The Category to initialize the categorySection of.
 */
function initializeCategorySection(category: Category): void {
	const categorySection = new Map<SubCategory, ChangelogMessage[]>();
	for (const subCategory of category.subCategories) {
		categorySection.set(subCategory, []);
	}
	category.changelogSection = categorySection;
}
