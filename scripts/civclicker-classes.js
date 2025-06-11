
import { copyProps, isValid } from './jsutils.js';

function getCurCiv() {
	return window.cc.getCiv();
}

function getCivData() {
	return window.cc.getCivData();
}

function VersionData(major, minor, sub, mod) {
	this.major = major;
	this.minor = minor;
	this.sub = sub;
	this.mod = mod;
}

VersionData.prototype.toNumber = function toNumber() {
	return this.major * 1000 + this.minor + this.sub / 1000;
};

VersionData.prototype.toString = function toString() {
	return [
		String(this.major),
		String(this.minor),
		String(this.sub) + String(this.mod),
	].join('.');
};


function CivObj(props, asProto) {
	// Prevent accidental namespace pollution
	if (!(this instanceof CivObj)) { return new CivObj(props); }
	// xxx Should these just be taken off the prototype's property names?
	const names = asProto ? null : [
		"id", "name", "subType", "owned", "prereqs", "require", "salable",
		"vulnerable", "effectText",
		"prestige", "initOwned", "init", "reset", "limit", "hasVariableCost",
	];
	Object.call(this, props);
	copyProps(this, props, names, true);
	return this;
}


CivObj.prototype = {
	constructor: CivObj,
	subType: "normal",
	get data() {
		return getCurCiv()[this.id];
	},
	set data(value) {
		getCurCiv()[this.id] = value;
	},
	get owned() { return this.data.owned; },
	set owned(value) { this.data.owned = value; },
	prereqs: {},
	require: {}, // Default to free.  If this is undefined, makes the item unpurchaseable
	salable: false,
	vulnerable: true,
	effectText: "",
	prestige: false,

	initOwned: 0,
	init: function init(fullInit = true) {
		if (fullInit || !this.prestige) {
			this.data = {};
			if (this.initOwned !== undefined) { this.owned = this.initOwned; }
		}
		return true;
	},
	reset: function reset() {
		return this.init(false); 
	},
	get limit() {

		if (typeof this.initOwned === "number") return Infinity;
		return (typeof this.initOwned === "boolean") ? true : 0;
	},

	hasVariableCost: function hasVariableCost() {
		let i;

		const requireDesc = Object.getOwnPropertyDescriptor(this, "require");
		if (!requireDesc) { return false; } // Unpurchaseable
		if (requireDesc.get !== undefined) { return true; }

		for (i in this.require) {
			if (typeof this.require[i] === "function") { return true; }
		}
		return false;
	},


	getQtyName: function getQtyName(qty) {
		if (qty === 1 && this.singular) { return this.singular; }
		if (typeof qty === "number" && this.plural) { return this.plural; }
		return this.name || this.singular || "(UNNAMED)";
	},
};

function Resource(props) { 

	if (!(this instanceof Resource)) { return new Resource(props); }
	CivObj.call(this, props);
	copyProps(this, props, null, true);
	// Occasional Properties: increment, specialChance, net
	return this;
}
Resource.prototype = new CivObj({
	constructor: Resource,
	type: "resource",

	get net() {
		if (typeof this.data.net !== "number") {

			return 0;
		}
		return this.data.net;
	},
	set net(value) { this.data.net = value; },
	increment: 0,
	specialChance: 0,
	specialMaterial: "",
	activity: "gathering", // I18N
}, true);

function Building(props) { 
	if (!(this instanceof Building)) { return new Building(props); }
	CivObj.call(this, props);
	copyProps(this, props, null, true);

	return this;
}
// Common Properties: type="building",customQtyId
Building.prototype = new CivObj({
	constructor: Building,
	type: "building",
	alignment: "player",
	place: "home",
	get vulnerable() { return this.subType !== "altar"; }, 
	customQtyId: "buildingCustomQty",
}, true);

function Upgrade(props) { 
	if (!(this instanceof Upgrade)) { return new Upgrade(props); }
	CivObj.call(this, props);
	copyProps(this, props, null, true);
	// Occasional Properties: subType, efficiency, extraText, onGain
	if (this.subType === "prayer") { this.initOwned = undefined; } // Prayers don't get initial values.
	if (this.subType === "pantheon") { this.prestige = true; } // Pantheon upgrades are not lost on reset.
	return this;
}
// Common Properties: type="upgrade"
Upgrade.prototype = new CivObj({
	constructor: Upgrade,
	type: "upgrade",
	initOwned: false,
	vulnerable: false,
	get limit() { return 1; }, // Can't re-buy these.
	// set limit(value) { return this.limit; } // Only here for JSLint.
}, true);

function Unit(props) { // props is an object containing the desired properties.
	if (!(this instanceof Unit)) { return new Unit(props); } // Prevent accidental namespace pollution
	CivObj.call(this, props);
	copyProps(this, props, null, true);

	return this;
}
// Common Properties: type="unit"
Unit.prototype = new CivObj({
	constructor: Unit,
	type: "unit",
	salable: true,
	get customQtyId() {
		return `${this.place}CustomQty`;
	},
	// set customQtyId(value) { return this.customQtyId; }, // Only here for JSLint.
	alignment: "player", // Also: "enemy"
	species: "human", // Also:  "animal", "mechanical", "undead"
	place: "home", // Also:  "party"
	combatType: "", // Default noncombatant.  Also "infantry","cavalry","animal"
	onWin: function onWin() { return null; }, // Do nothing.
	get vulnerable() {
		return ((this.place === "home") && (this.alignment === "player") && (this.subType === "normal"));
	},
	// set vulnerable(value) { return this.vulnerable; }, // Only here for JSLint.
	get isPopulation() {
		if (this.alignment !== "player") return false;
		if (this.subType === "special" || this.species === "mechanical") {
			return false;
		}
		// return (this.place == "home")
		return true;
	},
	// set isPopulation(v) { return this.isPopulation; },
	init: function init(fullInit) {
		CivObj.prototype.init.call(this, fullInit);
		// Right now, only vulnerable human units can get sick.
		if (this.vulnerable && (this.species === "human")) {
			this.setIllObj({ owned: 0 });
		}
		return true;
	},

	getIllObj: function getIllObj() {
		const curCiv = getCurCiv();
		return curCiv[`${this.id}Ill`];
	},
	setIllObj: function setIllObj(value) {
		const curCiv = getCurCiv();
		curCiv[`${this.id}Ill`] = value;
	},
	get ill() {
		const illObj = this.getIllObj();
		return isValid(illObj) ? illObj.owned : undefined;
	},
	set ill(value) {
		const illObj = this.getIllObj();
		if (isValid(illObj)) { illObj.owned = value; }
	},
	get partyObj() {
		const civData = getCivData();
		return civData[`${this.id}Party`];
	},

	get party() {
		return isValid(this.partyObj) ? this.partyObj.owned : undefined;
	},
	set party(value) {
		if (isValid(this.partyObj)) {
			this.partyObj.owned = value;
		}
	},

	isDest: function isDest() {
		const civData = getCivData();
		return (this.source !== undefined) && (civData[this.source].partyObj === this);
	},
	get limit() {
		const civData = getCivData();
		return (this.isDest())
			? civData[this.source].limit : Object.getOwnPropertyDescriptor(CivObj.prototype, "limit").get.call(this);
	},

	get total() {
		const civData = getCivData();
		return (this.isDest())
			? civData[this.source].total : (this.owned + (this.ill || 0) + (this.party || 0));
	},

}, true);

function Achievement(props) { 
	if (!(this instanceof Achievement)) {
		return new Achievement(props);
	}
	CivObj.call(this, props);
	copyProps(this, props, null, true);
	// Occasional Properties: test
	return this;
}


Achievement.prototype = new CivObj({
	constructor: Achievement,
	type: "achievement",
	initOwned: false,
	prestige: true, // Achievements are not lost on reset.
	vulnerable: false,
	get limit() { return 1; }, 
}, true);

export {
	VersionData,
	CivObj,
	Resource,
	Building,
	Upgrade,
	Unit,
	Achievement,
};
