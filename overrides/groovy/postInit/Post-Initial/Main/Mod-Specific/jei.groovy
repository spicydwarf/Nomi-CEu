import com.nomiceu.nomilabs.util.LabsModeHelper

import static com.nomiceu.nomilabs.groovy.GroovyHelpers.JEIHelpers.*

/* Item Removals */

// Unobtainable Ores
mods.jei.ingredient.removeAndHide(item('gregtech:ore_trona_0', 0)) // Trona Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_trona_0', 1)) // Trona Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_trona_0', 2)) // Trona Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_small', 2031)) // Small Dust
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_purified', 2031) // Purified Crushed Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed', 2031)) // Crushed Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_tiny', 2031)) // Tiny Dust
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_centrifuged', 2031)) // Centrifuged Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_impure', 2031)) // Impure Dust
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_pure', 2031 )) // Pure Dust
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust', 2031)) // Dust
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed', 2031)) // Crushed Ore

if (LabsModeHelper.normal) {
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_darmstadtite_0', 0)) // Darmstadite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_darmstadtite_0', 1)) // Darmstadite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_darmstadtite_0', 2)) // Darmstadite Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_crushed_purified', 32110)) // Purified Crushed Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_pure', 32110)) // Pure Dust
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_small', 32110)) // Small Dust
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_tiny', 32110)) // Tiny Dust
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_centrifuged', 32110)) // Centrifuged Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_impure', 32110)) // Impure Dust
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed', 32110)) // Crushed Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_crushed_centrifuged', 32110)) // Crushed Centrifuged Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust', 32110)) // Dust
}

if (LabsModeHelper.normal) {
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_dulysite_0', 0)) // Dulysite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_dulysite_0', 1)) // Dulysite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_dulysite_0', 2)) // Dulysite Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_crushed_purified', 32111)) // Purified Crushed Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_pure', 32111)) // Pure Dust
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_small', 32111)) // Small Dust
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_tiny', 32111)) // Tiny Dust
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_centrifuged', 32111)) // Centrifuged Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust_impure', 32111)) // Impure Dust
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed', 32111)) // Crushed Ore
	mods.jei.ingredient.removeAndHide(item('nomilabs:meta_dust', 32111)) // Dust
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_block_compressed_2006', 15)) // Block
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_gem_exquisite', 32111)) // Exquisite Gem
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_gem_flawless', 32111)) // Flawless Gem
	mods.jei.ingredient.removeAndHide(item('gregtech:meta_gem', 32111)) // Gem
}

mods.jei.ingredient.removeAndHide(item('gregtech:ore_plutonium_0', 0)) // Plutonium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_plutonium_0', 1)) // Plutonium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_plutonium_0', 2)) // Plutonium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed', 81)) // Crushed Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_centrifuged', 81)) // Centrifuged Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_impure', 81)) // Impure Dust
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_purified', 81)) // Crushed Purified Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_pure', 81)) // Pure Dust

mods.jei.ingredient.removeAndHide(item('gregtech:ore_cobalt_0', 0)) // Cobalt Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_cobalt_0', 1)) // Cobalt Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_cobalt_0', 2)) // Cobalt Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_purified', 23)) // Crushed Purified Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed', 23)) // Crushed Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_crushed_centrifuged', 23)) // Centrifuged Ore
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_impure', 23)) // Impure Dust
mods.jei.ingredient.removeAndHide(item('gregtech:meta_dust_pure', 23)) // Pure Dust

mods.jei.ingredient.removeAndHide(item('densemetals:dense_platinum_ore')) // Dense Platinum Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_quartz_ore')) // Dense Quartz Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_copper_ore')) // Dense Copper Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_thorium_ore')) // Dense Thorium Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_plutonium_ore')) // Dense Plutonium Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_lead_ore')) // Dense Lead Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_silver_ore')) // Dense Silver Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_iridium_ore')) // Dense Iridium Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_aluminum_ore')) // Dense Aluminum Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_mithril_ore')) // Dense Mithrill Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_nickel_ore')) // Dense Nickel Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_tin_ore')) // Dense Tin Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_beryllium_ore')) // Dense Beryllium Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_gold_ore')) // Dense Gold Ore
mods.jei.ingredient.removeAndHide(item('densemetals:dense_rutile_ore')) // Dense Rutile Ore

mods.jei.ingredient.removeAndHide(item('gregtech:ore_aluminium_0', 1)) // Nether Aluminum Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_beryllium_0', 2)) // End Beryllium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_iron_0', 1)) // Nether Iron Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_iron_0', 2) // End Iron Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lead_0', 1)) // Nether Lead Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lead_0', 2) // End Lead Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lithium_0', 1) // Nether Lithium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_molybdenum_0', 2) // End Molybdenum Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_neodymium_0', 2) // End Neodymium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_nickel_0', 1) // Nether Nickel Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_nickel_0', 2) // End Nickel Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_palladium_0', 1) // Nether Palladium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_platinum_0', 1) // Nether Platinum Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_silver_0', 2) // End Silver Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_sulfur_0', 2) // End Sulfur Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_thorium_0', 2) // End Thorium Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_tin_0', 2) // End Tin Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_naquadah_0', 1) // Nether Naquadah Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_naquadah_0', 2) // End Naquadah Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_certus_quartz_0', 2) // End Certus Quartz Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_almandine_0', 2) // End Almandine Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_asbestos_0', 2) // End Asbestos Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_asbestos_0', 1) // Nether Asbestos Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_banded_iron_0', 2) // End Banded Iron Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_blue_topaz_0', 0) // Overworld Blue Topaz Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_blue_topaz_0', 2) // End Blue Topaz Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_brown_limonite_0', 2) // End Brown Limonite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_calcite_0', 2) // End Calcite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_calcite_0', 1) // Nether Calcite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_cassiterite_sand_0', 1) // Nether Cassiterite Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_cassiterite_sand_0', 2) // End Cassiterite Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_chalcopyrite_0', 2) // End Chalcopyrite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_chalcopyrite_0', 1) // Nether Chalcopyrite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_chromite_0', 1) // Nether Chromite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_chromite_0', 0) // Overworld Chromite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_cinnabar_0', 2) // End Cinnabar Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_coal_0', 2) // End Coal Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_coal_0', 1) // Nether Coal Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_cobaltite_0', 2) // End Cobaltite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_diamond_0', 2) // End Diamond Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_diamond_0', 1) // Nether Diamond Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_emerald_0', 2) // Nether Emerald Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_galena_0', 1) // Nether Galena Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_galena_0', 2) // End Galena Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_garnierite_0', 2) // End Garnierite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_garnierite_0', 1) // Nether Garnierite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_green_sapphire_0', 1) // Nether Green Saphire Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_green_sapphire_0', 2) // End Green Saphire Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_grossular_0', 2) // End Grossular Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_bauxite_0', 1) // Nether Bauxite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lazurite_0', 1) // Nether Lazurite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lazurite_0', 2) // End Lazurite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_magnesite_0', 1) // Nether Magnesite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_magnesite_0', 2) // End Magnesite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_magnetite_0', 1) // Nether Magnesite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_molybdenite_0', 2) // End Molybdenite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_powellite_0', 2) // End Powellite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pyrite_0', 2) // End Pyrite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pyrolusite_0', 2) // End Pyrolusite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pyrope_0', 2) // End Pyrope Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pyrope_0', 1) // Nether Pyrope Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_rock_salt_0', 2) // End Rock Salt Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_rock_salt_0', 1) // Nether Rock Salt Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_ruby_0', 2) // End Ruby Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_salt_0', 2) // End Salt Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_salt_0', 1) // Nether Salt Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_saltpeter_0', 2) // End Saltpeter Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_sapphire_0', 2) // End Sapphire Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_sodalite_0', 2) // End Sodalite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_sodalite_0', 1) // Nether Sodalite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_spessartine_0', 1) // Nether Spressartine Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_spessartine_0', 2) // End Spressartine Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_stibnite_0', 2) // End Stibnite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_tetrahedrite_0', 2) // End Tetrahedrite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_topaz_0', 2) // End Topaz Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_uraninite_0', 1) // Nether Uraninite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_wulfenite_0', 2) // End Wulfenite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_yellow_limonite_0', 2) // End Limonite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_nether_quartz_0', 2) // End Nether Quartz Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_quartzite_0', 2) // End Quartzite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_graphite_0', 2) // End Graphite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_graphite_0', 1) // Nether Graphite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_bornite_0', 0) // Overworld Graphite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_chalcocite_0', 0) // Overworld Chalcocite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_chalcocite_0', 2) // End Chalcocite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_realgar_0', 2) // End Realgar Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_realgar_0', 1) // Nether Realgar Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_bastnasite_0', 2) // End Bastnasite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pentlandite_0', 2) // End Pentlandite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_spodumene_0', 2) // End Spodumene Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_spodumene_0', 1) // Nether Spodumene Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lepidolite_0', 2) // End Lepidolite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_glauconite_sand_0', 2) // End Glauconite Sand
mods.jei.ingredient.removeAndHide(item('gregtech:ore_glauconite_sand_0', 1) // Nether Glauconite Sand
mods.jei.ingredient.removeAndHide(item('gregtech:ore_malachite_0', 2) // End Malachite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_malachite_0', 1) // Nether Malachite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_mica_0', 1) // Nether Mica Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_mica_0', 2) // End Mica Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_barite_0', 2) // End Barite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_alunite_0', 2) // End Alunite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_alunite_0', 0) // Overworld Alunite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_talc_0', 2) // End Talc Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_talc_0', 1) // Nether Talc Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_soapstone_0', 2) // End Soapstone Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_talc_0', 1) // Nether Soapstone Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_kyanite_0', 1) // Nether Kyanite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_kyanite_0', 2) // End Kyanite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_oilsands_0', 1) // Nether Oilsands Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_olivine_0', 1) // Nether Olivine Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_opal_0', 1) // Nether Opal Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_opal_0', 2) // End Opal Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_amethyst_0', 2) // End Amethyst Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_amethyst_0', 1) // Nether Amethyst Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lapis_0', 1) // Nether Lapis Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_lapis_0', 2) // End Lapis Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_apatite_0', 2) // End Apatite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_apatite_0', 1) // Nether Apatite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_tricalcium_phosphate_0', 1) // Nether Tricalcium Phosphate Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_tricalcium_phosphate_0', 2) // End Tricalcium Phosphate Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_red_garnet_0', 2) // End Red Garnet Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_red_garnet_0', 1) // Nether Red Garnet Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_yellow_garnet_0', 2) // End Yellow Garnet Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_yellow_garnet_0', 1) // Nether Yellow Garnet Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pollucite_0', 1) // Nether Pollucite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pollucite_0', 2) // End Pollucite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_bentonite_0', 2) // End Bentonite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_bentonite_0', 1) // Nether Bentonite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_fullers_earth_0', 1) // Nether Fullers Earth Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_fullers_earth_0', 2) // End Fullers Earth Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_pitchblende_0', 1) // Nether Pitchblende Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_monazite_0', 2) // End Monazite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_gypsum_0', 2) // End Gypsum Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_gypsum_0', 1) // Nether Gypsum Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_zeolite_0', 1) // Nether Zeolite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_zeolite_0', 2) // End Zeolite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_redstone_0', 2) // End Redstone Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_electrotine_0', 2) // End Electrotine Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_diatomite_0', 2) // End Diatomite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_granatic_mineral_sand_0', 2) // End Granatic Mineral Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_granatic_mineral_sand_0', 1) // Nether Granatic Mineral Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_garnet_sand_0', 2) // End Garnet Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_garnet_sand_0', 1) // Nether Garnet Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_basaltic_mineral_sand_0', 2) // End Basaltic Mineral Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_basaltic_mineral_sand_0', 1) // Nether Basaltic Mineral Sand Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_draconium_0', 1) // Nether Draconicum Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_draconium_0', 0) // Overworld Draconicum Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_osmiridium_8020_0', 1) // Nether Osmiridium 80/20 Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_osmiridium_8020_0', 2) // End Osmiridium 80/20 Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_iridosmine_8020_0', 1) // Nether Iridosmine 80/20 Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_iridosmine_8020_0', 2) // End Iridosmine 80/20 Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_kaemanite_0', 1) // Nether Kaemanite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_kaemanite_0', 2) // End Kaemanite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_fluorite_0', 1) // Nether Fluorite Ore
mods.jei.ingredient.removeAndHide(item('gregtech:ore_fluorite_0', 2) // End Fluorite Ore

if (LabsModeHelper.expert) {
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_lithium_0', 0) // Overworld Lithium Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_neodymium_0', 0) // Overworld Neodyminum Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_platinum_0', 0) // Overworld Platinum Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_sulfur_0', 0) // Overworld Sulfur Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_thorium_0', 0) // Overworld Thorium Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_naquadah_0', 0) // Overworld Naquadah Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_cobaltite_0', 1) // Nether Cobaltite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_sheldonite_0', 0) // Overworld Sheldonite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_powellite_0', 0) // Overworld Powellite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_saltpeter_0', 0) // Overworld Saltpeter Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_topaz_0', 0) // Overworld Topaz Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_barite_0', 0) // Overworld Barite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_electrotine_0', 0) // Overworld Electrotine Ore
}

if (LabsModeHelper.normal) {
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_sheldonite_0', 1) // Nether Sheldonite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_sheldonite_0', 2) // End Tantalite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_pentlandite_0', 1) // Nether Pentlandite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_lepidolite_0', 1) // Nether Lepidolite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_vanadium_magnetite_0', 1) // Nether Vanadium Magnetite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_snowchestite_0', 0) // Overworld Snowchestite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_snowchestite_0', 1) // Nether Snowchestite Ore
	mods.jei.ingredient.removeAndHide(item('gregtech:ore_snowchestite_0', 2) // End Snowchestite Ore	
}

// AR
mods.jei.ingredient.removeAndHide(item('advancedrocketry:crystal:*')) // Random Crystal Blocks

// Armor Plus
mods.jei.ingredient.removeAndHide(item('armorplus:block_melting_obsidian')) // Null Texture Item

// Thermal
removeAndHideItemIgnoreNBT(item('thermalexpansion:machine', 13)) // Arcane Ensorcellator
removeAndHideItemIgnoreNBT(item('thermalexpansion:device', 9)) // Decoctive Diffuser
removeAndHideItemIgnoreNBT(item('thermalexpansion:device', 8)) // Insightful Condenser

// Nomi Labs
if (LabsModeHelper.expert) {
	mods.jei.ingredient.removeAndHide(item('nomilabs:impossiblerealmdata'))
}

/* Remove Categories (Appear Randomly after /gs reload) */
// Avatitia
mods.jei.category.hideCategory('Avatitia.Extreme')

// DME
if (LabsModeHelper.expert) {
	mods.jei.category.hideCategory('deepmoblearning.simulation_chamber')
	mods.jei.category.hideCategory('deepmoblearning.extraction_chamber')
	mods.jei.category.hideCategory('deepmoblearning.trial_keystone')
}

// EIO
mods.jei.category.hideCategory('CombustionGenerator')
mods.jei.category.hideCategory('Enchanter')
mods.jei.category.hideCategory('GrindingBall')
mods.jei.category.hideCategory('SagMill')
mods.jei.category.hideCategory('SolarPanel')
mods.jei.category.hideCategory('StirlingGenerator')

// AR
mods.jei.category.hideCategory('zmaster587.AR.rollingMachine')
mods.jei.category.hideCategory('zmaster587.AR.lathe')
mods.jei.category.hideCategory('zmaster587.AR.precisionAssembler')
mods.jei.category.hideCategory('zmaster587.AR.sawMill')
mods.jei.category.hideCategory('zmaster587.AR.chemicalReactor')
mods.jei.category.hideCategory('zmaster587.AR.crystallizer')
mods.jei.category.hideCategory('zmaster587.AR.electrolyzer')
mods.jei.category.hideCategory('zmaster587.AR.arcFurnace')
mods.jei.category.hideCategory('zmaster587.AR.platePresser')
mods.jei.category.hideCategory('zmaster587.AR.centrifuge')

// Armor Plus
mods.jei.category.hideCategory('armorplus:lava_infuser_infusing')
mods.jei.category.hideCategory('armorplus:high_tech_bench')
mods.jei.category.hideCategory('armorplus:ulti_tech_bench')
mods.jei.category.hideCategory('armorplus:workbench')

// Vanilla
if (LabsModeHelper.expert) {
	mods.jei.category.hideCategory('jeresources.mob')
}
