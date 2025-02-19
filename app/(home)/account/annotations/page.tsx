import { listAnnotationActionWithArticle } from "@/actions/annotate-actions";
import { getTranslations } from "next-intl/server";
import Annotations from "../_components/annotations";

const AnnotationPage = async () => {
	const tAccount = await getTranslations("Account");

	const annotations = await listAnnotationActionWithArticle({
		// take: 5,
		orderBy: { createdAt: "desc" },
	});
	return (
		<div className="w-full">
			<h1 className="text-3xl pb-4">{tAccount("myAnnotation")}</h1>
			<Annotations annotations={annotations} />
		</div>
	);
};

export default AnnotationPage;
