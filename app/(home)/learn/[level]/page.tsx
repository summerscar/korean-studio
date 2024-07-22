import { type LevelParams, Levels } from "@/types";
import Link from "next/link";
import { redirect } from "next/navigation";

// TODO: mdx
// https://www.zenryoku-kun.com/new-post/nextjs-mdx-remote
export default function LevelPage({
	params: { level },
}: { params: LevelParams }) {
	if (![Levels.Beginner, Levels.Intermediate].includes(level)) {
		redirect("/learn/beginner");
	}

	return (
		<div className="flex">
			{level} Intro Page
			<Link href="/learn/beginner/keyboard">To keyboard page</Link>
		</div>
	);
}
