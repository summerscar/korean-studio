import type { DocPathParams } from "@/types";
import type { Metadata } from "next";
import LevelPage from "./[...doc_path]/page";

export async function generateMetadata(props: {
	params: Promise<DocPathParams>;
}): Promise<Metadata> {
	const params = await props.params;
	const level = params.level;

	const title = `介绍 - 韩语${level === "beginner" ? "入门" : "中级"}语法`;

	return {
		title,
		description: "title",
	};
}

export default LevelPage;
