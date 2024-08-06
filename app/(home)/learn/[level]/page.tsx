import { type DocsTitleParams, type LevelParams, Levels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import { loadMDX } from "@/utils/load-mdx";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

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

// TODO: mdx
// https://www.zenryoku-kun.com/new-post/nextjs-mdx-remote
export default async function LevelPage({
	params: { level },
}: { params: LevelParams }) {
	if (![Levels.Beginner, Levels.Intermediate].includes(level)) {
		redirect("/learn/beginner");
	}

	const mdx = await loadMDX(level, "_intro");

	return <article className="markdown-body">{mdx.content}</article>;
}
