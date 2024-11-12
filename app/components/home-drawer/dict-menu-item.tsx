import CloseIcon from "@/assets/svg/close.svg";
import SearchIcon from "@/assets/svg/search.svg";
import { useStarred } from "@/components/home-status/star";
import type { DictItem } from "@/types/dict";
import { getTranslation } from "@/utils/convert-input";
import clsx from "clsx";

const DictMenuItem = ({
	item,
	index,
	curWordIndex,
	onClick,
	handleRemove,
	isAdmin,
	isLocalDict,
	isUserDict,
	locale,
}: {
	item: DictItem;
	index: number;
	curWordIndex: number;
	onClick: (index: number) => void;
	handleRemove: (e: React.MouseEvent, item: DictItem) => void;
	isAdmin: boolean;
	isLocalDict: boolean;
	isUserDict: boolean;
	locale: string;
}) => {
	const isStarred = useStarred(item);
	return (
		<li
			key={item.id || item.name}
			className={clsx("cursor-pointer relative group mb-1 last:mb-0")}
		>
			<div
				className={clsx("block", isStarred && "bg-yellow-100", {
					active: index === curWordIndex,
				})}
				onClick={() => onClick(index)}
			>
				<div className="grid grid-flow-col">
					<span className="text-nowrap overflow-hidden text-ellipsis">
						{index + 1}. {item.name}
					</span>
					<span
						className="text-right text-nowrap overflow-hidden text-ellipsis pl-12 text-gray-400"
						title={getTranslation(item, locale)}
					>
						{getTranslation(item, locale)}
					</span>
				</div>
				{(isAdmin || isLocalDict || isUserDict) && (
					<div
						className="absolute -top-2 -right-1 btn-circle btn btn-xs items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
						onClick={(e) => handleRemove(e, item)}
					>
						<CloseIcon className="w-4 h-4" />
					</div>
				)}
				<div
					className="absolute -bottom-2 -right-1 btn-circle btn btn-xs items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						window.open(
							`https://papago.naver.com/?sk=ko&tk=${locale}&st=${item.name}`,
							"mini",
							"left=150, top=150, width=400, height=600, toolbar=no, scrollbars=yes, status=no, resizable=yes",
						);
					}}
				>
					<SearchIcon className="w-4 h-4" />
				</div>
			</div>
		</li>
	);
};

export { DictMenuItem };
