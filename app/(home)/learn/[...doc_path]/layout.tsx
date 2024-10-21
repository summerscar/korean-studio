import { Levels } from "@/types";
import { DocsLayout } from "./_components/docs-layout";

export async function generateStaticParams() {
	return [Levels.Beginner, Levels.Intermediate].map((level) => ({
		level,
	}));
}

export default function Layout({
	children,
	category,
}: {
	children: React.ReactNode;
	category: React.ReactNode;
}) {
	return <DocsLayout category={category}>{children}</DocsLayout>;
}
