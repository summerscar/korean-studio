import { getDictItemsByUserAction } from "@/actions/user-dict-action";
import { useUser } from "@/hooks/use-user";
import { timeOut } from "@/utils/time-out";
import { memo, useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";

const SWR_KEY = "user-dict-items";

const useUserDictItems = () => {
	const { isLogin, user } = useUser();
	const { data = [] } = useSWRImmutable(isLogin ? SWR_KEY : null, async () => {
		return await getDictItemsByUserAction(user?.id!);
	});

	return data;
};

export const refreshSWRUserDictItems = () => {
	mutate(SWR_KEY);
};

const useHighlightedDictItems = (text: string | React.ReactNode, wait = 0) => {
	const dictItems = useUserDictItems();
	const [textWithDictItem, setTextWithDictItem] = useState(text);

	useEffect(() => {
		if (dictItems.length === 0 || typeof text !== "string") return;
		(async () => {
			await timeOut(wait);
			requestIdleCallback(() => {
				const replacedText = dictItems.reduce(
					(acc, cur) => {
						return reactStringReplace(acc, cur.name, (match, index) => (
							<span
								key={`${cur.id}-${index}`}
								className="bg-yellow-200/80 dark:bg-slate-600 inline-block rounded-sm"
							>
								{match}
							</span>
						));
					},
					[text] as React.ReactNode[],
				);
				setTextWithDictItem(replacedText);
			});
		})();
	}, [dictItems, text, wait]);

	return textWithDictItem;
};

const HighLightedDictItems = memo(
	({ children }: { children: React.ReactNode }) => {
		const highLightedChildren = useHighlightedDictItems(children, 2000);
		return highLightedChildren;
	},
);

export { useUserDictItems, HighLightedDictItems };
