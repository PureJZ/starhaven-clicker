const TAG_DISPLAY = {
	SPAN: 'inline',
	BUTTON: 'inline-block',
	DIV: 'block',
	UL: 'block',
	OL: 'block',
	P: 'block',
	TABLE: 'table',
	CAPTION: 'table-caption',
	THEAD: 'table-header-group',
	TBODY: 'table-row-group',
	TFOOT: 'table-footer-group',
	TR: 'table-row',
	COL: 'table-column',
	TD: 'table-cell',
	LI: 'list-item',
};

const ui = {
	findAll(selector) {
		if (typeof selector === 'string') {
			return document.querySelectorAll(selector);
		}
		if (typeof selector === 'object') {
			return selector;
		}
		return undefined;
	},
	find(selector) {
		if (typeof selector === 'string') {
			
			return document.querySelectorAll(selector)[0];
		}
		if (typeof selector === 'object') {
			return selector;
		}
		return undefined;
	},
	isHidden(selector) {

		const elt = ui.find(selector);
		return (elt.offsetParent === null);
	},
	toggle(selector /* , force */) {
		const elt = ui.find(selector);
		if (ui.isHidden(elt)) {
			elt.style.display = 'block';
			return true;
		}
		elt.style.display = 'none';
		return false;
	},

	show(selector, visibleParam) {
		const elt = ui.find(selector);
		if (!elt) return undefined;
		let displayVal;

		const visible = (visibleParam === undefined) ? (elt.style.display === 'none') : visibleParam;
		const tagName = elt.tagName.toUpperCase();


		if (visible) {
			displayVal = 'initial';

			const tagDisplay = TAG_DISPLAY[tagName];
			if (!tagDisplay) console.warn('Unsupported tag <', tagName, '> passed to ui.show');
			else displayVal = tagDisplay;
		} else {
			displayVal = 'none';
		}
		elt.style.display = displayVal;
		return visible;
	},
	hide(selector, notVisible = true) {
		return this.show(selector, !notVisible);
	},
	body: null,
	setup() {

		this.body = document.getElementsByTagName('body')[0];
	},

	async prompt(text, defaultText) {
		return new Promise((resolve) => {
			const ret = window.prompt(text, defaultText);
			resolve(ret);
		});
	},
	alert(text) {
		window.alert(text);
	},
};

export default ui;

if (window) {
	window.ui = ui;
	document.addEventListener('DOMContentLoaded', () => { ui.setup(); });
} else {
	console.error('ui instantiation failed');
}
