import CloseIcon from "@/assets/svg/close.svg";
import SearchIcon from "@/assets/svg/search.svg";
import { ClientOnly } from "@/components/client-only";
import type { HomeSetting } from "@/types";
import { type Dict, Dicts, type UserDicts } from "@/types/dict";
import { getTranslation } from "@/utils/convert-input";
import { isServer } from "@/utils/is-server";
import { removeLocalDict } from "@/utils/local-dict";
import { timeOut } from "@/utils/time-out";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DictMenu } from "./dict-menu";

const HomeDrawer = ({
	isLocalDict,
	isUserDict,
	dict,
	userDicts,
	curWordIndex,
	onClick,
	onShuffle,
	onLocalDictUpdate,
	drawerRef,
	setting,
	onSettingChange,
}: {
	isLocalDict: boolean;
	isUserDict: boolean;
	dict: Dict;
	userDicts: UserDicts;
	curWordIndex: number;
	onClick: (index: number) => void;
	drawerRef: React.RefObject<{ open: () => void }>;
	onShuffle: () => void;
	onLocalDictUpdate: () => void;
	setting: HomeSetting;
	onSettingChange: (val: Partial<HomeSetting>) => void;
}) => {
	const drawerListRef = useRef<HTMLUListElement>(null);
	const locale = useLocale();
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

	const handleUserDictUpdate = useMemoizedFn(async () => {
		onLocalDictUpdate();
		await timeOut(100);
		drawerListRef.current?.parentElement?.scrollTo({
			top: drawerListRef.current?.parentElement?.scrollHeight,
			behavior: "smooth",
		});
	});

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
						<ul
							ref={drawerListRef}
							className="menu bg-base-100 text-base-content min-h-full w-5/6 sm:w-80 p-4"
						>
							<DictMenu
								isUserDict={isUserDict}
								isLocalDict={isLocalDict}
								userDicts={userDicts}
								setting={setting}
								onSettingChange={onSettingChange}
								onShuffle={onShuffle}
								onLocalDictUpdate={handleUserDictUpdate}
							/>
							{/* Sidebar content here */}
							{dict.map((item, index) => (
								<li
									key={item.name}
									className={clsx(
										"cursor-pointer relative group mb-1 last:mb-0",
									)}
								>
									<div
										className={clsx("block", {
											active: index === curWordIndex,
										})}
										onClick={() => onClick(index)}
									>
										<div className="grid grid-flow-col">
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
										{isLocalDict && dict.length > 1 && (
											<div
												className="absolute -top-2 -right-1 btn-circle btn btn-xs items-center justify-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity"
												onClick={(e) => {
													e.stopPropagation();
													if (confirm()) {
														removeLocalDict(item.name);
														onLocalDictUpdate();
													}
												}}
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
													"_blank",
												);
											}}
										>
											<SearchIcon className="w-4 h-4" />
										</div>
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
