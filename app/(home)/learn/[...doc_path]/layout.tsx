import { Levels } from "@/types";
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
	params?: Promise<{ doc_path: string[] }>;
}) {
	const doc_path = (await params)?.doc_path || [Levels.Beginner];

	return (
		<DocsLayout category={<DocsCategory doc_path={doc_path} />}>
			{children}
		</DocsLayout>
	);
}
