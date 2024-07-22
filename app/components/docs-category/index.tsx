import type { DocsTitleParams, LevelParams } from "@/types";
import Link from "next/link";

const DocsCategory = ({
	level,
	title,
}: LevelParams & Partial<DocsTitleParams>) => {
	return (
		<ul>
			<li className="my-2">
				<Link href={`/learn/${level}`}>Intro {level}</Link>
			</li>
			<li>title: {title}</li>
		</ul>
	);
};
export { DocsCategory };
