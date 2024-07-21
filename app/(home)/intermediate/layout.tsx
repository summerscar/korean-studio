import { DocsLayout } from "@/components/docs-layout";

export default function Layout({
	children,
	category,
}: { children: React.ReactNode; category: React.ReactNode }) {
	return <DocsLayout category={category}>{children}</DocsLayout>;
}
