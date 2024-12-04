import {
	removeDictItemAction,
	toggleDictItemIdToFavListAction,
} from "@/actions/user-dict-action";
import { isFavDict } from "@/actions/user-dict-utils";
import { ClientOnly } from "@/components/client-only";
import { callModal } from "@/components/modal";
import { createLoadingToast, createSuccessToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { HomeSetting } from "@/types";
import type { Dict, DictItem, UserDicts } from "@/types/dict";
import { isServer } from "@/utils/is-server";
import { removeLocalDict } from "@/utils/local-dict";
import { serverActionTimeOut, timeOut } from "@/utils/time-out";
import { useMemoizedFn } from "ahooks";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DictMenu } from "./dict-menu";
import { DictMenuItem } from "./dict-menu-item";

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
	const isFavList = isFavDict(dictList.find((dict) => dict.id === dictId));
	const { isAdmin } = useUser();
	const drawerListRef = useRef<HTMLUListElement>(null);
	const locale = useLocale();
	const tHome = useTranslations("Home");
	const controllerRef = useRef<HTMLInputElement>(null);
	const open = useMemoizedFn(() => {
		if (controllerRef.current) {
			controllerRef.current.checked = true;
			setTimeout(() => {
				drawerListRef.current
					?.querySelector(`li[data-active="true"]`)
					?.scrollIntoView({
						block: "center",
						inline: "nearest",
						behavior: "smooth",
					});
			}, 350);
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
		if (
			await callModal({
				type: "confirm",
				title: tHome("removeWord"),
				message: `${tHome("removeWord")} 「${item.name}」 ?`,
			})
		) {
			if (isLocalDict) {
				removeLocalDict(item.name);
				onLocalDictUpdate();
			} else {
				const cancel = createLoadingToast(
					`【${item.name}】${tHome("removing")}`,
				);
				if (isFavList) {
					await toggleDictItemIdToFavListAction(item.id!, false, dictId);
				} else {
					await removeDictItemAction(dictId, item.id!);
				}
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
							className="menu bg-base-100 text-base-content min-h-full w-5/6 sm:w-96 sm:p-4"
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
								isFavDict={isFavList}
							/>
							{/* Sidebar content here */}
							{dict.map((item, index) => (
								<DictMenuItem
									key={item.id || item.name}
									item={item}
									curWordIndex={curWordIndex}
									index={index}
									onClick={onClick}
									handleRemove={handleRemove}
									isAdmin={isAdmin}
									isLocalDict={isLocalDict}
									isUserDict={isUserDict}
									locale={locale}
								/>
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
