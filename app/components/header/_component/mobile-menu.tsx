"use client";
import CloseIcon from "@/assets/svg/close.svg";
import MenuIcon from "@/assets/svg/menu.svg";
import { isAdminBySession } from "@/hooks/use-user";
import clsx from "clsx";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { headerConfig } from "..";

const MobileMenu = ({
	links,
	session,
}: { links: ReturnType<typeof headerConfig>; session: Session | null }) => {
	const pathname = usePathname();
	const isActive = (href: string) => pathname.includes(href);
	const [isOpen, setIsOpen] = useState(false);
	const tHeader = useTranslations("Header");

	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsOpen(e.target.checked);
	};

	return (
		<>
			<label className="btn btn-circle btn-ghost swap swap-rotate">
				<input
					type="checkbox"
					className="hidden drawer-toggle"
					onChange={handleOnChange}
					checked={isOpen}
				/>
				<MenuIcon className="swap-off fill-current w-8 h-8" />
				<CloseIcon className="swap-on fill-current w-8 h-8" />
			</label>
			<div
				className={clsx(
					"absolute w-screen h-[calc(100dvh-var(--header-height))] left-0 top-[--header-height] flex flex-col backdrop-blur-xl p-2",
					"*:p-2 *:rounded-md *:cursor-pointer hover:*:bg-slate-400/40",
					!isOpen && "hidden",
				)}
			>
				{links.map(({ href, label }) => (
					<Link
						key={href}
						href={href}
						onClick={() => setIsOpen(false)}
						className={clsx(isActive(href) && "bg-slate-400/40")}
					>
						<span>{label}</span>
					</Link>
				))}
				{session ? (
					<>
						<Link
							className={clsx(
								isAdminBySession(session) && "text-yellow-200 font-bold",
								isActive("/account") && "bg-slate-400/40",
							)}
							onClick={() => setIsOpen(false)}
							href="/account"
						>
							{session.user?.name}
						</Link>
						<div onClick={() => signOut()}>{tHeader("signOut")}</div>
					</>
				) : (
					<div className="p-2" onClick={() => signIn()}>
						{tHeader("signIn")}
					</div>
				)}
			</div>
		</>
	);
};

export { MobileMenu };
