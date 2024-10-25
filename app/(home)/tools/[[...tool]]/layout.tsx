import type { ToolName } from "@/types/tools";
import { getServerI18n } from "@/utils/i18n";
import clsx from "clsx";
import Link from "next/link";

const list: { href: string; intlKey: string; title: ToolName }[] = [
	{
		title: "assemble",
		href: "/tools/assemble",
		intlKey: "assemble",
	},
	{
		title: "disassemble",
		href: "/tools/disassemble",
		intlKey: "disassemble",
	},
	{
		title: "romanize",
		href: "/tools/romanize",
		intlKey: "romanize",
	},
	{
		title: "standardize-pronunciation",
		href: "/tools/standardize-pronunciation",
		intlKey: "standardizePronunciation",
	},
];

export default async function Layout({
	children,
	params,
}: { children: React.ReactNode; params: Promise<{ tool: string[] }> }) {
	const tTools = await getServerI18n("Tools");
	const tool = ((await params).tool || [])[0] as ToolName;

	return (
		<div className="flex flex-col w-full gap-8">
			<div className="tabs tabs-bordered tabs-lg">
				{list.map(({ href, intlKey, title }) => (
					<Link
						key={href}
						href={href}
						className={clsx("tab tab-lg tab-bordered", {
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
