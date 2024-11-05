const downloadFile = (content: string, filename: string) => {
	const blob = new Blob([content]);
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	URL.revokeObjectURL(a.href);
};

export { downloadFile };
