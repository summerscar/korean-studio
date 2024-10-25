export const toolsNames = [
	"assemble",
	"disassemble",
	"romanize",
	"standardize-pronunciation",
] as const;
export type ToolName = (typeof toolsNames)[number];
