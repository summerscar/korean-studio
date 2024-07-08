import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";

import type { Dict } from "@/types/dict";
import clsx from "clsx";

const DictNav = ({
	dict,
	curWordIndex,
}: { dict: Dict; curWordIndex: number }) => {
	const prev = curWordIndex - 1 > 0 ? dict[curWordIndex - 1] : null;
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
						const Icon = index === 0 ? PrevIcon : NextIcon;
						return <Icon width={24} height={24} />;
					})()}
					<div className="flex-none">{item?.name}</div>
				</div>
			))}
		</div>
	);
};

export { DictNav };
