import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";

import type { Dict, DictItem, Tran } from "@/types/dict";
import { notoKR } from "@/utils/fonts";
import clsx from "clsx";
import { useLocale } from "next-intl";

const DictNav = ({
	dict,
	curWordIndex,
	onPrev,
	onNext,
}: {
	dict: Dict;
	curWordIndex: number;
	onPrev: () => void;
	onNext: () => void;
}) => {
	const prev = curWordIndex - 1 >= 0 ? dict[curWordIndex - 1] : null;
	const next = curWordIndex + 1 < dict.length ? dict[curWordIndex + 1] : null;
	const locale = useLocale();

	const getTranslation = (currentWord: DictItem | null) => {
		if (!currentWord) return "";
		const trans =
			currentWord.trans[locale as keyof Tran] || currentWord.trans.en;
		return trans.join(", ");
	};

	return (
		<div className="w-[80vw] flex justify-between">
			{[prev, next].map((item, index) => (
				<div
					className={clsx(
						"flex",
						"items-center",
						{ "flex-row-reverse": index === 1 },
						index === 0 ? "text-left" : "text-right",
					)}
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={index}
				>
					{(() => {
						if (!item) return null;
						const Icon = index === 0 ? PrevIcon : NextIcon;
						return (
							<Icon
								className="cursor-pointer"
								width={24}
								height={24}
								onClick={index === 0 ? onPrev : onNext}
							/>
						);
					})()}
					<div className={clsx(notoKR.className, "flex-none px-1 select-none")}>
						{item?.name}
						<p
							title={getTranslation(item)}
							className="text-xs text-gray-500 max-w-40 overflow-hidden text-ellipsis text-nowrap"
						>
							{getTranslation(item)}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};

export { DictNav };
