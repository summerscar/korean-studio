import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";

import { HideText } from "@/components/hide-text";
import type { Dict, DictItem, Tran } from "@/types/dict";
import { getTranslation } from "@/utils/convert-input";
import { notoKR } from "@/utils/fonts";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "next-intl";

const DictNav = ({
	dict,
	curWordIndex,
	onPrev,
	onNext,
	hideMeaning,
}: {
	dict: Dict;
	curWordIndex: number;
	onPrev: () => void;
	onNext: () => void;
	hideMeaning: boolean;
}) => {
	const prev = curWordIndex - 1 >= 0 ? dict[curWordIndex - 1] : null;
	const next = curWordIndex + 1 < dict.length ? dict[curWordIndex + 1] : null;
	const locale = useLocale();

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
					<div className="flex-none px-1 select-none">
						<AnimatePresence mode="popLayout">
							<motion.div
								key={curWordIndex}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
							>
								<p className={clsx("font-bold text-nowrap", notoKR.className)}>
									{item?.name}
								</p>
								<p
									title={getTranslation(item, locale)}
									className="text-xs text-gray-500 max-w-28 sm:max-w-40"
								>
									{
										<HideText
											hide={hideMeaning}
											className="overflow-hidden text-ellipsis text-nowrap inline-block max-w-full px-0.5"
										>
											{getTranslation(item, locale)}
										</HideText>
									}
								</p>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>
			))}
		</div>
	);
};

export { DictNav };
