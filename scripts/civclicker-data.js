import {
	Resource, Building, Upgrade, Unit, Achievement, CivObj,
} from './civclicker-classes.js';
import { indexArrayByAttr } from './jsutils.js';
const NEVER_CLICK_THRESHOLD = 22;
const civSizes = [
	{ min_pop: 0, name: "Outpost", id: "thorp" },
	{ min_pop: 20, name: "Depot", id: "hamlet" },
	{ min_pop: 60, name: "Module", id: "village" },
	{ min_pop: 200, name: "Hub", id: "smallTown" },
	{ min_pop: 2000, name: "Sprawl", id: "largeTown" },
	{ min_pop: 5000, name: "Station", id: "smallCity" },
	{ min_pop: 10000, name: "Port-City", id: "largeCity" },
	{ min_pop: 20000, name: "Mega-Sprawl", id: "metropolis" },
	{ min_pop: 50000, name: "Colony", id: "smallNation" },
	{ min_pop: 100000, name: "Core-World", id: "nation" },
	{ min_pop: 200000, name: "Large Core-World", id: "largeNation" },
	{ min_pop: 500000, name: "Empire-World", id: "empire" },
];
function typeToId(deityType) {
	if (deityType === "Battle") { return "battle"; }
	if (deityType === "Cats") { return "cats"; }
	if (deityType === "the Fields") { return "fields"; }
	if (deityType === "the Underworld") { return "underworld"; }
	return deityType;
}

function idToType(domainId) {
	if (domainId === "battle") { return "Battle"; }
	if (domainId === "cats") { return "Cats"; }
	if (domainId === "fields") { return "the Fields"; }
	if (domainId === "underworld") { return "the Underworld"; }
	return domainId;
}


function uselessSet(val, obj) {
	// console.warn('Useless set', val, 'for this:', obj);
}


function makeCivData(curCiv, civInterface, population) {
  const civData = [

    new Resource({
      id: 'food',
      name: 'nutri‑packs',
      increment: 1,
      specialChance: 0.1,
      subType: 'basic',
      specialMaterial: 'xeno‑tissues',
      verb: 'harvest',
      activity: 'gathering',
      get limit() {
        const siloBonus = ((civData.granaries.owned ? 2 : 1) * 200);
        return 200 + (civData.barn.owned * siloBonus);
      },
      set limit(v) { /* noop */ },
    }),

    new Resource({
      id: 'wood',
      name: 'synth‑fiber',
      increment: 1,
      specialChance: 0.1,
      subType: 'basic',
      specialMaterial: 'bio‑gel',
      verb: 'shear',
      activity: 'fiber‑spooling',
      get limit() { return 200 + (civData.woodstock.owned * 200); },
      set limit(v) { /* noop */ },
    }),

    new Resource({
      id: 'stone',
      name: 'uranium ore',
      increment: 1,
      specialChance: 0.1,
      subType: 'basic',
      specialMaterial: 'asteroid‑ore',
      verb: 'mine',
      activity: 'drilling',
      get limit() { return 200 + (civData.stonestock.owned * 200); },
      set limit(v) { /* noop */ },
    }),

    new Resource({ id: 'skins',  singular: 'bio-hide',  plural: 'bio-hides' }),
    new Resource({ id: 'herbs',  singular: 'med-herb',      plural: 'med-herbs' }),
    new Resource({ id: 'ore',    name: 'raw ore' }),
    new Resource({ id: 'leather',name: 'synth‑leather' }),
    new Resource({ id: 'metal',  name: 'refined alloy' }),
    new Resource({ id: 'piety',  name: 'faith crystals', vulnerable: false }),
    new Resource({ id: 'gold',   name: 'credits',  vulnerable: false }),
    new Resource({
      id: 'corpses',
      singular: 'cryo‑pod',
      plural: 'cryo‑pods',
      vulnerable: false,
    }),
    new Resource({ id: 'devotion', name: 'devotion', vulnerable: false }),
		// Buildings
		new Building({
			id: "freeLand",
			name: "free land",
			plural: "free land",
			subType: "land",
			prereqs: undefined, // Cannot be purchased.
			require: undefined, // Cannot be purchased.
			vulnerable: false, // Cannot be stolen
			initOwned: 1000,
			effectText: "Conquer more from your neighbors.",
		}),
		new Building({
      id: 'tent',
      singular: 'hab‑tent',
      plural: 'hab‑tents',
      require: { wood: 2, skins: 2 },
      effectText: '+1 max pop.',
    }),
    new Building({
      id: 'hut',
      singular: 'prefab pod',
      plural: 'prefab pods',
      require: { wood: 20, skins: 1 },
      effectText: '+3 max pop.',
    }),
		new Building({
			id: "cottage",
			singular: "cottage",
			plural: "cottages",
			prereqs: { masonry: true },
			require: { wood: 10, stone: 30 },
			effectText: "+6 max pop.",
		}),
		new Building({
			id: "house",
			singular: "house",
			plural: "houses",
			prereqs: { construction: true },
			require: { wood: 30, stone: 70 },
			get effectText() {
				const maxPop = 10 + 2 * (civData.slums.owned + civData.tenements.owned);
				return `+${maxPop} max pop.`;
			},
			set effectText(value) { uselessSet(value, this); },
			update: function updateHouse() {
				// TODO: need better way to do this
				document.getElementById(`${this.id}Note`).innerHTML = `: ${this.effectText}`;
			},
		}),
		new Building({
			id: "mansion",
			singular: "mansion",
			plural: "mansions",
			prereqs: { architecture: true },
			require: { wood: 200, stone: 200, leather: 20 },
			effectText: "+50 max pop.",
		}),
		new Building({
  id: "barn",
  singular: "nutri-vault",
  plural: "nutri-vaults",
  require: { wood: 100 },
  get effectText() {
    const vaultBonus = ((civData.granaries.owned ? 2 : 1) * 200);
    return `+${vaultBonus} nutri-pack storage`;
  },
  set effectText(v) { uselessSet(v, this); },
  update() {
    document.getElementById(`${this.id}Note`).innerHTML = `: ${this.effectText}`;
  },
}),
		new Building({
  id: "woodstock",
  singular: "fiber cache",
  plural: "fiber caches",
  require: { wood: 100 },
  effectText: "+200 synth-fiber storage",
}),
new Building({
  id: "stonestock",
  singular: "core cache",
  plural: "core caches",
  require: { wood: 100 },
  effectText: "+200 uranium-ore storage",
}),
		new Building({
  id: "tannery",
  singular: "biochemical lab",
  plural: "biochemical labs",
  prereqs: { masonry: true },
  require: { wood: 30, stone: 70, skins: 2 },
  effectText: "allows 1 biochemist",
}),
new Building({
  id: "smithy",
  singular: "alloy-forge",
  plural: "alloy-forges",
  prereqs: { masonry: true },
  require: { wood: 30, stone: 70, ore: 2 },
  effectText: "allows 1 alloy-smith",
}),
new Building({
  id: "apothecary",
  singular: "med-bay",
  plural: "med-bays",
  prereqs: { masonry: true },
  require: { wood: 30, stone: 70, herbs: 2 },
  effectText: "allows 1 med-officer",
}),
		new Building({
			id: "temple",
			singular: "temple",
			plural: "temples",
			prereqs: { masonry: true },
			require: { wood: 30, stone: 120 },
			effectText: "allows 1 cleric",

			onGain: function onGain(num) {
				if (civData.aesthetics && civData.aesthetics.owned && num) {
					civInterface.adjustMorale((num * 25) / population.living);
				}
			},
		}),
		new Building({
			id: "barracks",
			name: "barracks",
			prereqs: { masonry: true },
			require: {
				food: 20, wood: 60, stone: 120, metal: 10,
			},
			effectText: "allows 10 soldiers",
		}),
		new Building({
			id: "stable",
			singular: "stable",
			plural: "stables",
			prereqs: { horseback: true },
			require: {
				food: 60, wood: 60, stone: 120, leather: 10,
			},
			effectText: "allows 10 cavalry",
		}),
		new Building({
			id: "graveyard",
			singular: "graveyard",
			plural: "graveyards",
			prereqs: { masonry: true },
			require: { wood: 50, stone: 200, herbs: 50 },
			vulnerable: false, // Graveyards can't be sacked
			effectText: "contains 100 graves",
			onGain: function onGain(num = 1) {
				civInterface.digGraves(num);
			},
		}),
		new Building({
			id: "mill",
			singular: "mill",
			plural: "mills",
			prereqs: { wheel: true },
			get require() {
				return {
					wood: 100 * (this.owned + 1) * (1.05 ** this.owned),
					stone: 100 * (this.owned + 1) * (1.05 ** this.owned),
				};
			},
			set require(value) { uselessSet(value, this); },
			effectText: "improves Agro-Techs",
		}),
		new Building({
			id: "fortification",
			singular: "fortification",
			plural: "fortifications",
			efficiency: 0.01,
			prereqs: { architecture: true },

			get require() {
				return {
					stone: function stone() {
						return 100 * (this.owned + 1) * (1.05 ** this.owned);
					}.bind(this),
				};
			},
			set require(value) { uselessSet(value, this); },
			effectText: "helps protect against attack",
		}),

		new Building({
			id: "battleAltar",
			name: "Build Altar",
			singular: "battle altar",
			plural: "battle altars",
			subType: "altar",
			devotion: 1,
			prereqs: { deity: "battle" },
			get require() { return { stone: 200, piety: 200, metal: 50 + (50 * this.owned) }; },
			set require(value) { uselessSet(value, this); },
			effectText: "+1 Devotion",
		}),
		new Building({
			id: "fieldsAltar",
			name: "Build Altar",
			singular: "fields altar",
			plural: "fields altars",
			subType: "altar",
			devotion: 1,
			prereqs: { deity: "fields" },
			get require() {
				return {
					stone: 200,
					piety: 200,
					food: 500 + (250 * this.owned),
					wood: 500 + (250 * this.owned),
				};
			},
			set require(value) { uselessSet(value, this); },
			effectText: "+1 Devotion",
		}),
		new Building({
			id: "underworldAltar",
			name: "Build Altar",
			singular: "underworld altar",
			plural: "underworld altars",
			subType: "altar",
			devotion: 1,
			prereqs: { deity: "underworld" },
			get require() { return { stone: 200, piety: 200, corpses: 1 + this.owned }; },
			set require(value) { uselessSet(value, this); },
			effectText: "+1 Devotion",
		}),
		new Building({
			id: "catAltar",
			name: "Build Altar",
			singular: "cat altar",
			plural: "cat altars",
			subType: "altar",
			devotion: 1,
			prereqs: { deity: "cats" },
			get require() { return { stone: 200, piety: 200, herbs: 100 + (50 * this.owned) }; },
			set require(value) { uselessSet(value, this); },
			effectText: "+1 Devotion",
		}),
		// Upgrades
		new Upgrade({
			id: "skinning",
			name: "Skinning",
			subType: "upgrade",
			require: { skins: 10 },
			effectText: "Agro-Techs can collect bio-hides",
		}),
		new Upgrade({
			id: "harvesting",
			name: "Harvesting",
			subType: "upgrade",
			require: { herbs: 10 },
			effectText: "Harveseter Drones can collect herbs",
		}),
		new Upgrade({
			id: "prospecting",
			name: "Prospecting",
			subType: "upgrade",
			require: { ore: 10 },
			effectText: "Excavator Bots can collect ore",
		}),
		new Upgrade({
			id: "domestication",
			name: "Domestication",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { leather: 20 },
			effectText: "Increase Agro-Techs food output",
		}),
		new Upgrade({
			id: "ploughshares",
			name: "Ploughshares",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { metal: 20 },
			effectText: "Increase Agro-Techs food output",
		}),
		new Upgrade({
			id: "irrigation",
			name: "Irrigation",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { wood: 500, stone: 200 },
			effectText: "Increase Agro-Techs food output",
		}),
		new Upgrade({
			id: "butchering",
			name: "Butchering",
			subType: "upgrade",
			prereqs: { construction: true, skinning: true },
			require: { leather: 40 },
			effectText: "More Agro-Techs collect more bio-hides",
		}),
		new Upgrade({
			id: "gardening",
			name: "Gardening",
			subType: "upgrade",
			prereqs: { construction: true, harvesting: true },
			require: { herbs: 40 },
			effectText: "More Excavator Bots collect more herbs",
		}),
		new Upgrade({
			id: "extraction",
			name: "Extraction",
			subType: "upgrade",
			prereqs: { construction: true, prospecting: true },
			require: { metal: 40 },
			effectText: "More Excavator Bots collect more ore",
		}),
		new Upgrade({
			id: "flensing",
			name: "Flensing",
			subType: "upgrade",
			prereqs: { architecture: true },
			require: { metal: 1000 },
			effectText: "Collect bio-hides more frequently",
		}),
		new Upgrade({
			id: "macerating",
			name: "Macerating",
			subType: "upgrade",
			prereqs: { architecture: true },
			require: { leather: 500, stone: 500 },
			effectText: "Collect ore more frequently",
		}),
		new Upgrade({
			id: "croprotation",
			name: "Crop Rotation",
			subType: "upgrade",
			prereqs: { architecture: true },
			require: { herbs: 5000, piety: 1000 },
			effectText: "Increase Agro-Techs food output",
		}),
		new Upgrade({
			id: "selectivebreeding",
			name: "Selective Breeding",
			subType: "upgrade",
			prereqs: { architecture: true },
			require: { skins: 5000, piety: 1000 },
			effectText: "Increase Agro-Techs food output",
		}),
		new Upgrade({
			id: "fertilisers",
			name: "Fertilisers",
			subType: "upgrade",
			prereqs: { architecture: true },
			require: { ore: 5000, piety: 1000 },
			effectText: "Increase Agro-Techs food output",
		}),
		new Upgrade({
			id: "masonry",
			name: "Masonry",
			subType: "upgrade",
			require: { wood: 100, stone: 100 },
			effectText: "Unlock more buildings and upgrades",
		}),
		new Upgrade({
			id: "construction",
			name: "Construction",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { wood: 1000, stone: 1000 },
			effectText: "Unlock more buildings and upgrades",
		}),
		new Upgrade({
			id: "architecture",
			name: "Architecture",
			subType: "upgrade",
			prereqs: { construction: true },
			require: { wood: 10000, stone: 10000 },
			effectText: "Unlock more buildings and upgrades",
		}),
		new Upgrade({
			id: "tenements",
			name: "Tenements",
			subType: "upgrade",
			prereqs: { construction: true },
			require: { food: 200, wood: 500, stone: 500 },
			effectText: "Houses support +2 workers",
			onGain: function onGain() { civInterface.updateCivPopulation(); },
			// due to population limits changing
		}),
		new Upgrade({
			id: "slums",
			name: "Slums",
			subType: "upgrade",
			prereqs: { architecture: true },
			require: { food: 500, wood: 1000, stone: 1000 },
			effectText: "Houses support +2 workers",
			onGain: function onGain() { civInterface.updateCivPopulation(); },
			// due to population limits changing
		}),
		new Upgrade({
			id: "granaries",
			name: "Granaries",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { wood: 1000, stone: 1000 },
			effectText: "Barns store double the amount of food",
			onGain: function onGain() { civInterface.updateResourceTotals(); },
			// due to resource limits increasing
		}),
		new Upgrade({
			id: "palisade",
			name: "Palisade",
			subType: "upgrade",
			efficiency: 0.01, // Subtracted from attacker efficiency.
			prereqs: { construction: true },
			require: { wood: 2000, stone: 1000 },
			effectText: "Enemies do less damage",
		}),
		new Upgrade({
			id: "weaponry",
			name: "Basic Weaponry",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { wood: 500, metal: 500 },
			effectText: "Improve soldiers",
		}),
		new Upgrade({
			id: "shields",
			name: "Basic Shields",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { wood: 500, leather: 500 },
			effectText: "Improve soldiers",
		}),
		new Upgrade({
			id: "horseback",
			name: "Horseback Riding",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { food: 500, wood: 500 },
			effectText: "Build stables",
		}),
		new Upgrade({
			id: "wheel",
			name: "The Wheel",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { wood: 500, stone: 500 },
			effectText: "Build mills",
		}),
		new Upgrade({
			id: "writing",
			name: "Writing",
			subType: "upgrade",
			prereqs: { masonry: true },
			require: { skins: 500 },
			effectText: "Increase cleric piety generation",
		}),
		new Upgrade({
			id: "administration",
			name: "Administration",
			subType: "upgrade",
			prereqs: { writing: true },
			require: { stone: 1000, skins: 1000 },
			effectText: "Increase land gained from raiding",
		}),
		new Upgrade({
			id: "codeoflaws",
			name: "Code of Laws",
			subType: "upgrade",
			prereqs: { writing: true },
			require: { stone: 1000, skins: 1000 },
			effectText: "Reduce unhappiness caused by overcrowding",
		}),
		new Upgrade({
			id: "mathematics",
			name: "Mathematics",
			subType: "upgrade",
			prereqs: { writing: true },
			require: { herbs: 1000, piety: 1000 },
			effectText: "Create siege engines",
		}),
		new Upgrade({
			id: "aesthetics",
			name: "Aesthetics",
			subType: "upgrade",
			prereqs: { writing: true },
			require: { piety: 5000 },
			effectText: "Building temples increases morale",
		}),
		new Upgrade({
			id: "civilservice",
			name: "Civil Service",
			subType: "upgrade",
			prereqs: { architecture: true },
			require: { piety: 5000 },
			effectText: "Increase basic resources from clicking",
		}),
		new Upgrade({
			id: "feudalism",
			name: "Feudalism",
			subType: "upgrade",
			prereqs: { civilservice: true },
			require: { piety: 10000 },
			effectText: "Further increase basic resources from clicking",
		}),
		new Upgrade({
			id: "guilds",
			name: "Guilds",
			subType: "upgrade",
			prereqs: { civilservice: true },
			require: { piety: 10000 },
			effectText: "Increase special resources from clicking",
		}),
		new Upgrade({
			id: "serfs",
			name: "Serfs",
			subType: "upgrade",
			prereqs: { civilservice: true },
			require: { piety: 20000 },
			effectText: "Idle workers increase resources from clicking",
		}),
		new Upgrade({
			id: "nationalism",
			name: "Nationalism",
			subType: "upgrade",
			prereqs: { civilservice: true },
			require: { piety: 50000 },
			effectText: "Soldiers increase basic resources from clicking",
		}),
		new Upgrade({
			id: "worship",
			name: "Worship",
			subType: "deity",
			prereqs: { temple: 1 },
			require: { piety: 1000 },
			effectText: "Begin worshipping a deity (requires temple)",
			onGain: function onGain() {
				civInterface.updateUpgrades();
				civInterface.renameDeity(); // Need to add in some handling for when this returns NULL.
			},
		}),
		// Pantheon Upgrades
		new Upgrade({
			id: "lure",
			name: "Lure of Civilisation",
			subType: "pantheon",
			prereqs: { deity: "cats", devotion: 10 },
			require: { piety: 1000 },
			effectText: "increase chance to get cats",
		}),
		new Upgrade({
			id: "companion",
			name: "Warmth of the Companion",
			subType: "pantheon",
			prereqs: { deity: "cats", devotion: 30 },
			require: { piety: 1000 },
			effectText: "cats help heal the sick",
		}),
		new Upgrade({
			id: "comfort",
			name: "Comfort of the Hearthfires",
			subType: "pantheon",
			prereqs: { deity: "cats", devotion: 50 },
			require: { piety: 5000 },
			effectText: "traders marginally more frequent",
		}),
		new Upgrade({
			id: "blessing",
			name: "Blessing of Abundance",
			subType: "pantheon",
			prereqs: { deity: "fields", devotion: 10 },
			require: { piety: 1000 },
			effectText: "increase Agro-Techs food output",
		}),
		new Upgrade({
			id: "waste",
			name: "Abide No Waste",
			subType: "pantheon",
			prereqs: { deity: "fields", devotion: 30 },
			require: { piety: 1000 },
			effectText: "workers will eat corpses if there is no food left",
		}),
		new Upgrade({
			id: "stay",
			name: "Stay With Us",
			subType: "pantheon",
			prereqs: { deity: "fields", devotion: 50 },
			require: { piety: 5000 },
			effectText: "traders stay longer",
		}),
		new Upgrade({
			id: "riddle",
			name: "Riddle of Steel",
			subType: "pantheon",
			prereqs: { deity: "battle", devotion: 10 },
			require: { piety: 1000 },
			effectText: "improve soldiers",
		}),
		new Upgrade({
			id: "throne",
			name: "Throne of Skulls",
			subType: "pantheon",
			prereqs: { deity: "battle", devotion: 30 },
			require: { piety: 1000 },
			init: function initThrone(fullInit) {
				Upgrade.prototype.init.call(this, fullInit); this.count = 0;
			},
			get count() { return this.data.count; }, // Partial temples from Throne
			set count(value) { this.data.count = value; },
			effectText: "slaying enemies creates temples",
		}),
		new Upgrade({
			id: "lament",
			name: "Lament of the Defeated",
			subType: "pantheon",
			prereqs: { deity: "battle", devotion: 50 },
			require: { piety: 5000 },
			effectText: "Successful raids delay future invasions",
		}),
		new Upgrade({
			id: "book",
			name: "The Book of the Dead",
			subType: "pantheon",
			prereqs: { deity: "underworld", devotion: 10 },
			require: { piety: 1000 },
			effectText: "gain piety with deaths",
		}),
		new Upgrade({
			id: "feast",
			name: "A Feast for Crows",
			subType: "pantheon",
			prereqs: { deity: "underworld", devotion: 30 },
			require: { piety: 1000 },
			effectText: "corpses are less likely to cause illness",
		}),
		new Upgrade({
			id: "secrets",
			name: "Secrets of the Tombs",
			subType: "pantheon",
			prereqs: { deity: "underworld", devotion: 50 },
			require: { piety: 5000 },
			effectText: "graveyards increase cleric piety generation",
		}),
		// Special Upgrades
		new Upgrade({
			id: "standard",
			name: "Battle Standard",
			subType: "conquest",
			prereqs: { barracks: 1 },
			require: { leather: 1000, metal: 1000 },
			effectText: "Lets you build an army (requires barracks)",
		}),
		new Upgrade({
			id: "trade",
			name: "Trade",
			subType: "trade",
			prereqs: { gold: 1 },
			require: { gold: 1 },
			effectText: "Open the trading post",
		}),
		new Upgrade({
			id: "currency",
			name: "Currency",
			subType: "trade",
			require: { ore: 1000, gold: 10 },
			effectText: "Traders arrive more frequently, stay longer",
		}),
		new Upgrade({
			id: "commerce",
			name: "Commerce",
			subType: "trade",
			require: { piety: 10000, gold: 100 },
			effectText: "Traders arrive more frequently, stay longer",
		}),
		// Prayers
		new Upgrade({
			id: "smite",
			name: "Smite Invaders",
			subType: "prayer",
			prereqs: { deity: "battle", devotion: 20 },
			require: { piety: 100 },
			effectText: "(per invader killed)",
		}),
		new Upgrade({
			id: "glory",
			name: "For Glory!",
			subType: "prayer",
			prereqs: { deity: "battle", devotion: 40 },
			require: { piety: 1000 },
			init: function initGlory(fullInit) {
				Upgrade.prototype.init.call(this, fullInit); this.data.timer = 0;
			},
			get timer() { return this.data.timer; }, // Glory time left (sec)
			set timer(value) { this.data.timer = value; },
			effectText: "Temporarily makes raids more difficult, increases rewards",
		}),
		new Upgrade({
			id: "wickerman",
			name: "Burn Wicker Man",
			subType: "prayer",
			prereqs: { deity: "fields", devotion: 20 },
			require: { wood: 500 }, // xxx +1 Worker
			effectText: "Sacrifice 1 worker to gain a random bonus to a resource",
		}),
		new Upgrade({
			id: "walk",
			name: "Walk Behind the Rows",
			subType: "prayer",
			prereqs: { deity: "fields", devotion: 40 },
			require: { }, // xxx 1 Worker/sec
			init: function initWalk(fullInit) {
				Upgrade.prototype.init.call(this, fullInit); this.rate = 0;
			},
			get rate() { return this.data.rate; }, // Sacrifice rate
			set rate(value) { this.data.rate = value; },
			effectText: "boost food production by sacrificing 1 worker/sec.",
			extraText: "<br /><button id='ceaseWalk' onmousedown='walk(false)' disabled='disabled'>Cease Walking</button>",
		}),
		new Upgrade({
			id: "raiseDead",
			name: "Raise Dead",
			subType: "prayer",
			prereqs: { deity: "underworld", devotion: 20 },
			require: { corpses: 1, piety: 4 }, // xxx Nonlinear cost
			effectText: "Piety to raise the next zombie",
			extraText: `<button onmousedown='raiseDead(100)' id='raiseDead100' class='x100' disabled='disabled'">+100</button>
					<button onmousedown='raiseDead(Infinity)' id='raiseDeadMax' class='xInfinity' disabled='disabled'>+&infin;</button>`,
		}),
		new Upgrade({
			id: "summonShade",
			name: "Summon Shades",
			subType: "prayer",
			prereqs: { deity: "underworld", devotion: 40 },
			require: { piety: 1000 }, // xxx Also need slainEnemies
			effectText: "Souls of the defeated rise to fight for you",
		}),
		new Upgrade({
			id: "pestControl",
			name: "Pest Control",
			subType: "prayer",
			prereqs: { deity: "cats", devotion: 20 },
			require: { piety: 100 },
			init: function initPest(fullInit) {
				Upgrade.prototype.init.call(this, fullInit); this.timer = 0;
			},
			get timer() { return this.data.timer; }, // Pest hunting time left
			set timer(value) { this.data.timer = value; },
			effectText: "Give temporary boost to food production",
		}),
		new Upgrade({
			id: "grace",
			name: "Grace",
			subType: "prayer",
			prereqs: { deity: "cats", devotion: 40 },
			require: { piety: 1000 }, // xxx This is not fixed; see civInterface.graceCost
			init: function initGrace(fullInit) {
				Upgrade.prototype.init.call(this, fullInit); this.cost = 1000;
			},
			get cost() { return this.data.cost; }, // Increasing cost to use Grace to increase morale.
			set cost(value) { this.data.cost = value; },
			effectText: "Increase Morale",
		}),
		// Units
		new Unit({
			id: "totalSick",
			singular: "sick citizens",
			plural: "sick citizens",
			subType: "special",
			prereqs: undefined, // Hide until we get one.
			require: undefined, // Cannot be purchased.
			salable: false, // Cannot be sold.
			// xxx This (alternate data location) could probably be cleaner.
			get owned() { return population[this.id]; },
			set owned(value) {
				population[this.id] = value; // eslint-disable-line no-param-reassign
			},
			init: function initTotalSick() { this.owned = this.initOwned; },
			// xxx Verify this override ^ is needed.
			effectText: "Use healers and herbs to cure them",
		}),
		new Unit({
			id: "unemployed",
			singular: "idle citizen",
			plural: "idle citizens",
			require: undefined, // Cannot be purchased (through normal controls) xxx Maybe change this?
			salable: false, // Cannot be sold.
			customQtyId: "spawnCustomQty",
			effectText: "Playing idle games",
		}),
		new Unit({
			id: "farmer",
			singular: "agro-tech",
			plural: "agro-techs",
			source: "unemployed",
			efficiency_base: 0.2,
			get efficiency() {
				return this.efficiency_base + (0.1 * (
					civData.domestication.owned + civData.ploughshares.owned + civData.irrigation.owned
					+ civData.croprotation.owned + civData.selectivebreeding.owned + civData.fertilisers.owned
					+ civData.blessing.owned
				));
			},
			set efficiency(value) { this.efficiency_base = value; },
			effectText: "Automatically harvest nutri-packs",
		}),
		new Unit({
			id: "woodcutter",
			singular: "harvester drone",
			plural: "harvester drones",
			source: "unemployed",
			efficiency: 0.5,
			effectText: "Automatically cut synth-fiber",
		}),
		new Unit({
			id: "miner",
			singular: "excavator bot",
			plural: "excavator bots",
			source: "unemployed",
			efficiency: 0.2,
			effectText: "Automatically mine uranium",
		}),
		new Unit({
			id: "tanner",
			singular: "tanner",
			plural: "tanners",
			source: "unemployed",
			efficiency: 0.5,
			prereqs: { tannery: 1 },
			get limit() { return civData.tannery.owned; },
			set limit(value) { uselessSet(value, this); },
			effectText: "Convert bio-hides to synth-leather",
		}),
		new Unit({
			id: "blacksmith",
			singular: "blacksmith",
			plural: "blacksmiths",
			source: "unemployed",
			efficiency: 0.5,
			prereqs: { smithy: 1 },
			get limit() { return civData.smithy.owned; },
			set limit(value) { uselessSet(value, this); },
			effectText: "Convert uranium ore to refined alloy",
		}),
		new Unit({
			id: "healer",
			singular: "healer",
			plural: "healers",
			source: "unemployed",
			efficiency: 0.1,
			prereqs: { apothecary: 1 },
			init: function initHealer(fullInit) {
				Unit.prototype.init.call(this, fullInit);
				this.cureCount = 0;
			},
			get limit() { return civData.apothecary.owned; },
			set limit(value) { uselessSet(value, this); },
			get cureCount() { return this.data.cureCount; }, // Carryover fractional healing
			set cureCount(value) { this.data.cureCount = value; },
			effectText: "Cure sick workers",
		}),
		new Unit({
			id: "cleric",
			singular: "cleric",
			plural: "clerics",
			source: "unemployed",
			efficiency: 0.05,
			prereqs: { temple: 1 },
			get limit() { return civData.temple.owned; },
			set limit(value) { uselessSet(value, this); },
			effectText: "Generate piety, bury corpses",
		}),
		new Unit({
			id: "labourer",
			singular: "labourer",
			plural: "labourers",
			source: "unemployed",
			efficiency: 1.0,
			prereqs: { wonderStage: 1 }, // xxx This is a hack
			effectText: "Use resources to build wonder",
		}),
		new Unit({
			id: "soldier",
			singular: "soldier",
			plural: "soldiers",
			source: "unemployed",
			combatType: "infantry",
			efficiency_base: 0.05,
			get efficiency() {
				return this.efficiency_base + civInterface.getPlayerCombatMods();
			},
			set efficiency(value) { this.efficiency_base = value; },
			prereqs: { barracks: 1 },
			require: { leather: 10, metal: 10 },
			get limit() { return 10 * civData.barracks.owned; },
			set limit(value) { uselessSet(value, this); },
			effectText: "Protect from attack",
		}),
		new Unit({
			id: "cavalry",
			singular: "cavalry",
			plural: "cavalry",
			source: "unemployed",
			combatType: "cavalry",
			efficiency_base: 0.08,
			get efficiency() {
				return this.efficiency_base + civInterface.getPlayerCombatMods();
			},
			set efficiency(value) { this.efficiency_base = value; },
			prereqs: { stable: 1 },
			require: { food: 20, leather: 20 },
			get limit() { return 10 * civData.stable.owned; },
			set limit(value) { uselessSet(value, this); },
			effectText: "Protect from attack",
		}),
		new Unit({
			id: "cat",
			singular: "cat",
			plural: "cats",
			subType: "special",
			require: undefined, // Cannot be purchased (through normal controls)
			prereqs: { cat: 1 }, // Only visible if you have one.
			prestige: true, // Not lost on reset.
			salable: false, // Cannot be sold.
			species: "animal",
			effectText: "Our feline companions",
		}),
		new Unit({
			id: "shade",
			singular: "shade",
			plural: "shades",
			subType: "special",
			prereqs: undefined, // Cannot be purchased (through normal controls) xxx Maybe change this?
			require: undefined, // Cannot be purchased.
			salable: false, // Cannot be sold.
			species: "undead",
			effectText: "Insubstantial spirits",
		}),
		new Unit({
			id: "wolf",
			singular: "wolf",
			plural: "wolves",
			alignment: "enemy",
			combatType: "animal",
			prereqs: undefined, // Cannot be purchased.
			efficiency: 0.05,
			onWin: function onWin() { civInterface.combat.doSlaughter(this); },
			killFatigue: (1.0), // Max fraction that leave after killing the last person
			killExhaustion: (1 / 2), // Chance of an attacker leaving after killing a person
			species: "animal",
			effectText: "Eat your workers",
		}),
		new Unit({
			id: "bandit",
			singular: "bandit",
			plural: "bandits",
			alignment: "enemy",
			combatType: "infantry",
			prereqs: undefined, // Cannot be purchased.
			efficiency: 0.07,
			onWin: function onWin() { civInterface.combat.doLoot(this); },
			lootFatigue: (1 / 8), // Max fraction that leave after cleaning out a resource
			effectText: "Steal your resources",
		}),
		new Unit({
			id: "barbarian",
			singular: "barbarian",
			plural: "barbarians",
			alignment: "enemy",
			combatType: "infantry",
			prereqs: undefined, // Cannot be purchased.
			efficiency: 0.09,
			onWin: function onWin() { civInterface.combat.doHavoc(this); },
			lootFatigue: (1 / 24), // Max fraction that leave after cleaning out a resource
			killFatigue: (1 / 3), // Max fraction that leave after killing the last person
			killExhaustion: (1.0), // Chance of an attacker leaving after killing a person
			effectText: "Slaughter, plunder, and burn",
		}),
		new Unit({
			id: "esiege",
			singular: "siege engine",
			plural: "siege engines",
			alignment: "enemy",
			prereqs: undefined, // Cannot be purchased.
			efficiency: 0.1, // 10% chance to hit
			species: "mechanical",
			effectText: "Destroy your fortifications",
		}),
		new Unit({
			id: "soldierParty",
			singular: "soldier",
			plural: "soldiers",
			source: "soldier",
			combatType: "infantry",
			efficiency_base: 0.05,
			get efficiency() { return this.efficiency_base + civInterface.getPlayerCombatMods(); },
			set efficiency(value) { this.efficiency_base = value; },
			prereqs: { standard: true, barracks: 1 },
			place: "party",
			effectText: "Your raiding party",
		}),
		new Unit({
			id: "cavalryParty",
			singular: "cavalry",
			plural: "cavalry",
			source: "cavalry",
			combatType: "cavalry",
			efficiency_base: 0.08,
			get efficiency() { return this.efficiency_base + civInterface.getPlayerCombatMods(); },
			set efficiency(value) { this.efficiency_base = value; },
			prereqs: { standard: true, stable: 1 },
			place: "party",
			effectText: "Your mounted raiders",
		}),
		new Unit({
			id: "siege",
			singular: "siege engine",
			plural: "siege engines",
			efficiency: 0.1, // 10% chance to hit
			prereqs: { standard: true, mathematics: true },
			require: { wood: 200, leather: 50, metal: 50 },
			species: "mechanical",
			place: "party",
			salable: false,
			effectText: "Destroy enemy fortifications",
		}),
		new Unit({
			id: "esoldier",
			singular: "soldier",
			plural: "soldiers",
			alignment: "enemy",
			combatType: "infantry",
			prereqs: undefined, // Cannot be purchased.
			efficiency: 0.05,
			place: "party",
			effectText: "Defending enemy troops",
		}),
		/* Not currently used.
		new Unit({
			id:"ecavalry",
			name:"cavalry",
			alignment:"enemy",
			combatType:"cavalry",
			prereqs: undefined, // Cannot be purchased.
			efficiency: 0.08,
			place: "party",
			effectText:"Mounted enemy troops"
		}),
		*/
		new Unit({
			id: "efort",
			singular: "fortification",
			plural: "fortifications",
			alignment: "enemy",
			prereqs: undefined, // Cannot be purchased.
			efficiency: 0.01, // -1% damage
			species: "mechanical",
			place: "party",
			effectText: "Reduce enemy casualties",
		}),
		// Achievements
		// conquest
		new Achievement({
			id: "raiderAch",
			name: "Raider",
			test: function testAch() { return civInterface.getRaid().victory; },
		}),
		// xxx Technically this also gives credit for capturing a siege engine.
		new Achievement({
			id: "engineerAch",
			name: "Engi&shy;neer",
			test: function testAch() { return civData.siege.owned > 0; },
		}),
		// If we beat the largest possible opponent, grant bonus achievement.
		new Achievement({
			id: "dominationAch",
			name: "Domi&shy;nation",
			test: function testAch() {
				const raid = civInterface.getRaid();
				return raid.victory && (raid.last === civSizes[civSizes.length - 1].id);
			},
		}),
		// Morale
		new Achievement({
			id: "hatedAch",
			name: "Hated",
			test: function testAch() { return civInterface.getMoraleEfficiency() <= 0.5; },
		}),
		new Achievement({
			id: "lovedAch",
			name: "Loved",
			test: function testAch() { return civInterface.getMoraleEfficiency() >= 1.5; },
		}),
		// cats
		new Achievement({
			id: "catAch",
			name: "Cat!",
			test: function testAch() { return civData.cat.owned >= 1; },
		}),
		new Achievement({
			id: "glaringAch",
			name: "Glaring",
			test: function testAch() { return civData.cat.owned >= 10; },
		}),
		new Achievement({
			id: "clowderAch",
			name: "Clowder",
			test: function testAch() { return civData.cat.owned >= 100; },
		}),

		new Achievement({
			id: "plaguedAch",
			name: "Plagued",
			test: function testAch() { return population.totalSick > population.healthy; },
		}),
		new Achievement({
			id: "ghostTownAch",
			name: "Ghost Town",
			test: function testAch() { return (population.living === 0 && population.limit >= 1000); },
		}),

		new Achievement({
			id: "battleAch",
			name: "Battle",
			test: function testAch() { return civInterface.getCurDeityDomain() === "battle"; },
		}),
		new Achievement({
			id: "fieldsAch",
			name: "Fields",
			test: function testAch() { return civInterface.getCurDeityDomain() === "fields"; },
		}),
		new Achievement({
			id: "underworldAch",
			name: "Under&shy;world",
			test: function testAch() { return civInterface.getCurDeityDomain() === "underworld"; },
		}),
		new Achievement({
			id: "catsAch",
			name: "Cats",
			test: function testAch() { return civInterface.getCurDeityDomain() === "cats"; },
		}),
		// xxx It might be better if this checked for all domains in the Pantheon at once
		// (no iconoclasming old ones away).
		new Achievement({
			id: "fullHouseAch",
			name: "Full House",
			test: function testAch() {
				return (
					civData.battleAch.owned && civData.fieldsAch.owned
					&& civData.underworldAch.owned && civData.catsAch.owned
				);
			},
		}),
		// wonders
		new Achievement({
			id: "wonderAch",
			name: "Wonder",
			test: function testAch() { return civInterface.getCurrentWonder().stage === 3; },
		}),
		new Achievement({
			id: "sevenAch",
			name: "Seven!",
			test: function testAch() { return civInterface.getWonders().length >= 7; },
		}),
		// trading
		new Achievement({
			id: "merchantAch",
			name: "Merch&shy;ant",
			test: function testAch() { return civData.gold.owned > 0; },
		}),
		new Achievement({
			id: "rushedAch",
			name: "Rushed",
			test: function testAch() { return civInterface.getCurrentWonder().rushed; },
		}),
		// other
		new Achievement({
			id: "neverclickAch",
			name: "Never&shy;click",
			test: function testAch() {
				return (
					civInterface.getCurrentWonder().stage === 3
					&& civInterface.getResourceClicks() <= NEVER_CLICK_THRESHOLD
				);
			},
		}),
	];

	function augmentCivData() {
		let i;
		function testCivSizeAch() {
			return (this.id === `${civSizes.getCivSize(population.living).id}Ach`);
		}
		// Add the civ size based achivements to the front of the data, so that they come first.
		for (i = civSizes.length - 1; i > 0; --i) { // eslint-disable-line no-plusplus
			civData.unshift(
				new Achievement({
					id: `${civSizes[i].id}Ach`,
					name: civSizes[i].name,
					test: testCivSizeAch,
				}),
			);
		}
		// xxx TODO: Add deity domain based achievements here too.
	}
	augmentCivData();


	indexArrayByAttr(civData, "id");

	// Initialize our data.
	civData.forEach((item) => {
		if (item instanceof CivObj) {
			item.init();
		}
	});

	return civData;
}

function getWonderResources(civData) {

	return [
		civData.food,
		civData.wood,
		civData.stone,
		civData.skins,
		civData.herbs,
		civData.ore,
		civData.leather,
		civData.metal,
		civData.piety,
	];
}

export {
	civSizes,
	typeToId,
	idToType,
	makeCivData,
	getWonderResources,
};
