import Link from "next/link";

// TODO: mdx
// https://www.zenryoku-kun.com/new-post/nextjs-mdx-remote
export default function Beginner() {
	return (
		<div className="flex">
			Beginner Index Page
			<Link href="/beginner/keyboard">To keyboard page</Link>
		</div>
	);
}
