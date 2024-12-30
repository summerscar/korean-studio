import { addWordsToUserDictAction } from "@/actions/user-dict-action";
import { refreshSWRUserDictItems } from "@/components/high-lighted-text";
import {
	createErrorToast,
	createLoadingToast,
	createSuccessToast,
} from "@/hooks/use-toast";
import type { useTranslations } from "next-intl";

const addWordsToUserDict = async (
	dictId: string,
	words: string[],
	translate: ReturnType<typeof useTranslations<never>>,
	onUpdate?: () => Promise<void>,
) => {
	const removeInfoToast = createLoadingToast(translate("Home.generating"));

	try {
		await addWordsToUserDictAction(dictId, words);
		createSuccessToast(translate("Home.generated"));
		await onUpdate?.();
		refreshSWRUserDictItems();
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error(`[createWord][${words.join}]:\n`, error);
		createErrorToast(translate("Home.generateError"));
	} finally {
		removeInfoToast();
	}
};

export { addWordsToUserDict };
