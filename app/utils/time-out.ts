const timeOut = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export { timeOut };
