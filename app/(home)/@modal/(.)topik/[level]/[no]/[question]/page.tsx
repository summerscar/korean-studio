import { TopikQuestionPage } from "@/(home)/topik/[level]/[no]/[question]/_components/question-page";
import { QuestionModal } from "./_components/question-modal";
import type { TopikLevelType } from ".keystone/types";
const PreviewTopikQuestionPage = async (props: {
	params: Promise<{ level: TopikLevelType; no: string; question: string }>;
}) => {
	return (
		<QuestionModal>
			<TopikQuestionPage params={props.params} isModal />
		</QuestionModal>
	);
};

export default PreviewTopikQuestionPage;
