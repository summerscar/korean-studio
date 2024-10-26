import { type ToolName, toolsNames } from "@/types/tools";
import { getServerI18n } from "@/utils/i18n";
import clsx from "clsx";
import Link from "next/link";

const list: {
	href: string;
	intlKey: string;
	title: ToolName;
	descIntlKey: string;
}[] = [
	{
		title: "assemble",
		href: "/tools/assemble",
		intlKey: "assemble",
		descIntlKey: "assembleDescription",
	},
	{
		title: "disassemble",
		href: "/tools/disassemble",
		intlKey: "disassemble",
		descIntlKey: "disassembleDescription",
	},
	{
		title: "romanize",
		href: "/tools/romanize",
		intlKey: "romanize",
		descIntlKey: "romanizeDescription",
	},
	{
		title: "standardize-pronunciation",
		href: "/tools/standardize-pronunciation",
		intlKey: "standardizePronunciation",
		descIntlKey: "standardizePronunciationDescription",
	},
];

export async function generateMetadata(props: {
	params: Promise<{ tool: string[] }>;
}) {
	const tHeader = await getServerI18n("Header");
	const tTools = await getServerI18n("Tools");
	const tool = ((await props.params).tool || [])[0] as ToolName;
	return {
		title: tool
			? `${tHeader("tools")} - ${tTools(
					list.find((t) => t.title === tool)?.intlKey as Parameters<
						typeof tTools
					>[0],
				)}`
			: tHeader("tools"),
		description: tool
			? `${tTools(
					list.find((t) => t.title === tool)?.descIntlKey as Parameters<
						typeof tTools
					>[0],
				)}`
			: tHeader("tools"),
	};
}

export async function generateStaticParams() {
	return [
		{
			tool: [],
		},
		...toolsNames.map((tool) => ({
			tool: [tool],
		})),
	];
}

export default async function Layout({
	children,
	params,
}: { children: React.ReactNode; params: Promise<{ tool: string[] }> }) {
	const tTools = await getServerI18n("Tools");
	const tool = ((await params).tool || [])[0] as ToolName;

	return (
		<div className="flex flex-col w-full gap-4">
			<div className="tabs tabs-bordered tabs-sm sm:tabs-lg">
				{list.map(({ href, intlKey, title }) => (
					<Link
						key={href}
						href={href}
						className={clsx("tab", {
							"tab-active": tool === title,
						})}
					>
						{tTools(intlKey as Parameters<typeof tTools>[0])}
					</Link>
				))}
			</div>
			{children}
		</div>
	);
}
