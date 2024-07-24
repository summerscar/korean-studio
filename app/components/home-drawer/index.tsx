import { ClientOnly } from "@/components/client-only";
import type { Dict } from "@/types/dict";
import { getTranslation } from "@/utils/convert-input";
import { isServer } from "@/utils/is-server";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { useLocale } from "next-intl";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const HomeDrawer = ({
	dict,
	curWordIndex,
	onClick,
	drawerRef,
}: {
	dict: Dict;
	curWordIndex: number;
	onClick: (index: number) => void;
	drawerRef: React.RefObject<{ open: () => void }>;
}) => {
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

	if (isServer) return null;
	return (
		<ClientOnly>
			{createPortal(
				<div className="drawer drawer-end">
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
						<ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
							{/* Sidebar content here */}
							{dict.map((item, index) => (
								<li
									key={item.name}
									className={clsx("cursor-pointer")}
									onClick={() => onClick(index)}
								>
									<div
										className={clsx({
											"list-active": index === curWordIndex,
										})}
									>
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
