import Link from "next/link";

export default function Beginner() {
	return (
		<div className="flex">
			Beginner Index Page
			<Link href="/beginner/keyboard">To keyboard page</Link>
		</div>
	);
}
