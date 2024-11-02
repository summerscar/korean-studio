import { type DocPathParams, Levels } from "@/types";
import { DocsCategory } from "./_components/category";
import { DocsLayout } from "./_components/docs-layout";

export async function generateStaticParams() {
	return [Levels.Beginner, Levels.Intermediate].map((level) => ({
		level,
	}));
}

export default async function Layout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<DocPathParams>;
}) {
	const { level } = await params;

	return (
		<DocsLayout category={<DocsCategory level={level} />}>
			{children}
		</DocsLayout>
	);
}
