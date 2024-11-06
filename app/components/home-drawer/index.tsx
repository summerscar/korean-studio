import { removeDictItemAction } from "@/actions/user-dict-action";
import CloseIcon from "@/assets/svg/close.svg";
import SearchIcon from "@/assets/svg/search.svg";
import { ClientOnly } from "@/components/client-only";
import { createLoadingToast, createSuccessToast } from "@/hooks/use-toast";
import type { HomeSetting } from "@/types";
import { type Dict, type DictItem, Dicts, type UserDicts } from "@/types/dict";
import { getTranslation } from "@/utils/convert-input";
import { isServer } from "@/utils/is-server";
import { removeLocalDict } from "@/utils/local-dict";
import { serverActionTimeOut, timeOut } from "@/utils/time-out";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DictMenu } from "./dict-menu";

const HomeDrawer = ({
	isLocalDict,
	isUserDict,
	dict,
	dictList,
	curWordIndex,
	onClick,
	onShuffle,
	onLocalDictUpdate,
	drawerRef,
	setting,
	dictId,
	onSettingChange,
}: {
	isLocalDict: boolean;
	isUserDict: boolean;
	dict: Dict;
	dictId: string;
	dictList: UserDicts;
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
	const tHome = useTranslations("Home");
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

	const handleDictUpdate = useMemoizedFn(async () => {
		if (isLocalDict) {
			onLocalDictUpdate();
		}
		await timeOut(100);
		drawerListRef.current?.parentElement?.scrollTo({
			top: drawerListRef.current?.parentElement?.scrollHeight,
			behavior: "smooth",
		});
	});

	const handleRemove = async (e: React.MouseEvent, item: DictItem) => {
		e.stopPropagation();
		if (confirm()) {
			if (isLocalDict) {
				removeLocalDict(item.name);
				onLocalDictUpdate();
			} else {
				const cancel = createLoadingToast(
					`【${item.name}】${tHome("removing")}`,
				);
				await removeDictItemAction(dictId, item.id!);
				await serverActionTimeOut();
				cancel();
				createSuccessToast(tHome("removed"));
			}
		}
	};

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
							className="menu bg-base-100 text-base-content min-h-full w-5/6 sm:w-96 p-4"
						>
							<DictMenu
								isUserDict={isUserDict}
								isLocalDict={isLocalDict}
								dictId={dictId}
								dictList={dictList}
								dict={dict}
								setting={setting}
								onSettingChange={onSettingChange}
								onShuffle={onShuffle}
								onDictUpdate={handleDictUpdate}
							/>
							{/* Sidebar content here */}
							{dict.map((item, index) => (
								<li
									key={item.id || item.name}
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
										{(isLocalDict || isUserDict) && (
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
