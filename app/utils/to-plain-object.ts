const toPlainObject = <T extends object>(obj: T): T => {
	// CanIuse: https://caniuse.com/?search=structuredClone
	return structuredClone(obj);
};

export { toPlainObject };
