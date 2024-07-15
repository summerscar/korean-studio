import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";

import type { Dict } from "@/types/dict";
import { notoKR } from "@/utils/fonts";
import clsx from "clsx";

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

	return (
		<div className="w-[80vw] flex justify-between">
			{[prev, next].map((item, index) => (
				<div
					className={clsx("flex", { "flex-row-reverse": index === 1 })}
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
					<div className={clsx(notoKR.className, "flex-none select-none")}>
						{item?.name}
					</div>
				</div>
			))}
		</div>
	);
};

export { DictNav };
