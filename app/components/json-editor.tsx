import { createErrorToast } from "@/hooks/use-toast";

const JSONEditor = ({
	editingJSON,
	onUpdate,
	onCancel,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	editingJSON: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	onUpdate: (value: any) => void;
	onCancel: () => void;
}) => {
	if (!editingJSON) {
		return null;
	}
	return (
		<textarea
			ref={(el) => {
				el?.focus();
			}}
			onBlur={(e) => {
				const dataString = e.target.value;
				try {
					const data = JSON.parse(dataString);
					if (JSON.stringify(data) === JSON.stringify(editingJSON)) {
						onCancel();
						return;
					}
					onUpdate(data);
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				} catch (error: any) {
					console.error("[updateDictItem][error]:", error);
					createErrorToast(error.message);
				}
			}}
			className="w-full h-96 bg-white/20 rounded-lg shadow-inner"
			defaultValue={JSON.stringify(editingJSON, null, 12)}
		/>
	);
};

export { JSONEditor };
