import { type ToolName, toolsNames } from "@/types/tools";
import clsx from "clsx";
import { Assemble } from "./_components/assemble";
import { Disassemble } from "./_components/disassemble";
import { Romanized } from "./_components/romanize";
import { StandardizePronunciation } from "./_components/standardize-pronunciation";

export default async function ToolPage({
	params,
}: { params: Promise<{ tool: string[] }> }) {
	const tool = ((await params).tool || [])[0] as ToolName;
	return (
		<div
			className={clsx("flex flex-col gap-8 w-full text-center", {
				"pt-24": tool,
			})}
		>
			{(!tool || tool === "assemble") && <Assemble />}
			{(!tool || tool === "disassemble") && <Disassemble />}
			{(!tool || tool === "romanize") && <Romanized />}
			{(!tool || tool === "standardize-pronunciation") && (
				<StandardizePronunciation />
			)}
			{tool && !toolsNames.includes(tool) && "😱"}
		</div>
	);
}
