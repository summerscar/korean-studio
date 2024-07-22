import type { LevelParams } from "@/types";
import Link from "next/link";

const DocsCategory = ({ level }: LevelParams) => {
	return (
		<ul>
			<li className="my-2">
				<Link href={`/learn/${level}`}>Intro {level}</Link>
			</li>
		</ul>
	);
};
export { DocsCategory };
