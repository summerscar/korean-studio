import StarIcon from "@/assets/svg/star.svg";
import TrashIcon from "@/assets/svg/trash.svg";
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
			data-active={index === curWordIndex}
		>
			<div
				className={clsx("block", {
					active: index === curWordIndex,
				})}
				onClick={() => onClick(index)}
			>
				<div className="grid grid-flow-col relative">
					{isStarred && (
						<StarIcon className="size-4 fill-current absolute -left-4 sm:-left-4 top-0.5" />
					)}
					<span className="truncate">
						{index + 1}. {item.name}
					</span>
					<span
						className="text-right truncate pl-12 text-gray-400"
						title={getTranslation(item, locale)}
					>
						{getTranslation(item, locale)}
					</span>
				</div>
				{(isAdmin || isLocalDict || isUserDict) && (
					<div
						className="absolute -top-2 -right-1 btn-circle btn btn-xs items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow"
						onClick={(e) => handleRemove(e, item)}
					>
						<TrashIcon className="w-4 h-4" />
					</div>
				)}
			</div>
		</li>
	);
};

export { DictMenuItem };
