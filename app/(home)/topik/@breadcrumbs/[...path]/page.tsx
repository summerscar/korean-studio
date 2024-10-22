import Link from "next/link";

export default async function Page(props: {
	params: Promise<{ path: string[] }>;
}) {
	const params = await props.params;

	const { path } = params;

	return (
		<nav className="breadcrumbs text-sm">
			<ul>
				<li>
					<Link href={"/topik"}>TOPIK</Link>
				</li>
				{path.slice(1).map((i, index, arr) => {
					const href = `/topik${arr.slice(0, index + 1).reduce((prev, cur) => `${prev}/${cur}`, "")}`;
					const text = index === 1 ? `제${i}회` : index === 2 ? `문제${i}` : i;

					return (
						<li key={i}>
							{index === arr.length - 1 ? (
								<>{text}</>
							) : (
								<Link href={href}>{text}</Link>
							)}
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
