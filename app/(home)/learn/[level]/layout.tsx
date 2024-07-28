import { DocsLayout } from "@/components/docs-layout";
import { type DocsTitleParams, type LevelParams, Levels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import type { Metadata } from "next";

// 这层 layout 获取不到下层 title 的动态参数，下层页面直接导入使用
export async function generateMetadata({
	params,
}: {
	params: LevelParams & Partial<DocsTitleParams>;
}): Promise<Metadata> {
	const t = await getServerI18n("Header");
	const tIndex = await getServerI18n("Index");
	const level = params.level;
	const subTitle = params.title ? params.title : t(level);
	return {
		title: `${tIndex("title")}-${subTitle}`,
	};
}

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
