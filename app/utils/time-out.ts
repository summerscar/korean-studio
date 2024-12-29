const timeOut = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

const timeOutOnce = (ms: number) => {
	let done = false;
	return () => {
		return done ? Promise.resolve() : timeOut(ms).then(() => (done = true));
	};
};

const serverActionTimeOut = (ms = 500) => timeOut(ms);

export { timeOut, serverActionTimeOut, timeOutOnce };
