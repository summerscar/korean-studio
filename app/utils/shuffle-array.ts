const shuffleArr = <T>(arr: T[]): T[] => {
	const arrCopy = [...arr];
	for (let i = arrCopy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
	}
	return arrCopy;
};

export { shuffleArr };
