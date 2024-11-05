const timeOut = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

const serverActionTimeOut = (ms = 500) => timeOut(ms);

export { timeOut, serverActionTimeOut };
