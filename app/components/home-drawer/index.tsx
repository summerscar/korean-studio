import CloseIcon from "@/assets/svg/close.svg";
import { ClientOnly } from "@/components/client-only";
import { type Dict, Dicts } from "@/types/dict";
import { getTranslation } from "@/utils/convert-input";
import { isServer } from "@/utils/is-server";
import { removeUserDict } from "@/utils/user-dict";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DictMenu } from "./dict-menu";

const HomeDrawer = ({
	dict,
	curWordIndex,
	onClick,
	onShuffle,
	onUserDictUpdate,
	drawerRef,
}: {
	dict: Dict;
	curWordIndex: number;
	onClick: (index: number) => void;
	drawerRef: React.RefObject<{ open: () => void }>;
	onShuffle: () => void;
	onUserDictUpdate: () => void;
}) => {
	const locale = useLocale();
	const searchParams = useSearchParams();
	const currentDict = searchParams.get("dict") || Dicts.popular;
	const isUserDict = currentDict === Dicts.user;

	const controllerRef = useRef<HTMLInputElement>(null);
	const open = useMemoizedFn(() => {
		if (controllerRef.current) {
			controllerRef.current.checked = true;
			return;
		}
		throw new Error("controllerRef.current is null");
	});

	useEffect(() => {
		if (drawerRef.current) {
			drawerRef.current.open = open;
		}
	}, [drawerRef, open]);

	if (isServer) return null;
	return (
		<ClientOnly>
			{createPortal(
				<div className="drawer drawer-end z-30">
					<input
						ref={controllerRef}
						id="my-drawer-4"
						type="checkbox"
						className="drawer-toggle"
					/>
					<div className="drawer-content hidden">
						{/* Page content here */}
						<label
							htmlFor="my-drawer-4"
							className="drawer-button btn btn-primary"
						>
							Open drawer
						</label>
					</div>
					<div className="drawer-side">
						<label
							htmlFor="my-drawer-4"
							aria-label="close sidebar"
							className="drawer-overlay"
						/>
						<ul className="menu bg-base-100 text-base-content min-h-full w-80 p-4">
							<DictMenu
								onShuffle={onShuffle}
								onUserDictUpdate={onUserDictUpdate}
							/>
							{/* Sidebar content here */}
							{dict.map((item, index) => (
								<li
									key={item.name}
									className={clsx("cursor-pointer relative group")}
								>
									<div
										className={clsx({
											active: index === curWordIndex,
										})}
									>
										<div className="contents" onClick={() => onClick(index)}>
											<span>
												{index + 1}. {item.name}
											</span>
											<span
												className="text-right text-nowrap overflow-hidden text-ellipsis pl-12 text-gray-400"
												title={getTranslation(item, locale)}
											>
												{getTranslation(item, locale)}
											</span>
										</div>
										{isUserDict && (
											<div
												className="absolute -top-1 -right-1 btn-circle btn btn-xs items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
												onClick={() => {
													removeUserDict(item.name);
													onUserDictUpdate();
												}}
											>
												<CloseIcon className="w-4 h-4" />
											</div>
										)}
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>,
				document.body,
			)}
		</ClientOnly>
	);
};

export { HomeDrawer };
