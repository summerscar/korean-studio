import { TopikLevels } from "@/types";
import type { Metadata } from "next";
import { TopikQuestionPage } from "./_components/question-page";
import type { TopikLevelType } from ".keystone/types";

export async function generateMetadata(props: {
	params: Promise<{ level: TopikLevelType; no: string; question: string }>;
}): Promise<Metadata> {
	const params = await props.params;
	return {
		title: `${TopikLevels[params.level]}-${params.no}th-${params.question}`,
	};
}

export default function Page(props: {
	params: Promise<{ level: TopikLevelType; no: string; question: string }>;
}) {
	return <TopikQuestionPage {...props} />;
}
