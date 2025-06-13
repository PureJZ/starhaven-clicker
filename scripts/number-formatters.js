function sgnnum(x) {
	if (x > 0) return 1;
	return (x < 0) ? -1 : 0;
}

function sgnstr(x) {
	if (x.length === 0) return 0;
	return (x[0] === '-') ? -1 : 1;
}

function sgnbool(x) {
	return (x ? 1 : -1);
}

function absstr(x) {
	if (x.length === 0) return '';
	return (x[0] === '-') ? x.slice(1) : x;
}

function sgn(x) {
	if (typeof x === 'number') return sgnnum(x);
	if (typeof x === 'string') return sgnstr(x);
	return (typeof x === 'boolean') ? sgnbool(x) : 0;
}

function abs(x) {
	if (typeof x === 'number') return Math.abs(x);
	return (typeof x === 'string') ? absstr(x) : x;
}

export {
	sgnnum,
	sgnstr,
	sgnbool,
	absstr,
	sgn,
	abs,
};
