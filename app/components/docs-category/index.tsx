import Link from "next/link";

const DocsCategory = ({ page }: { page: "beginner" | "intermediate" }) => {
	return (
		<ul>
			<li className="my-2">
				<Link href={`/${page}`}>Intro</Link>
			</li>
		</ul>
	);
};
export { DocsCategory };
