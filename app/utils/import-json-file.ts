const importJSONFile = async () => {
	const { promise, resolve } = Promise.withResolvers();
	const file = document.createElement("input");
	file.type = "file";
	file.accept = "application/json";
	file.click();
	file.onchange = (e) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.readAsText(file);
	};
	return promise;
};

export { importJSONFile };
