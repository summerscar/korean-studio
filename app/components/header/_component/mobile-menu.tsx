"use client";
import CloseIcon from "@/assets/svg/close.svg";
import MenuIcon from "@/assets/svg/menu.svg";
import { isAdmin } from "@/hooks/use-user";
import clsx from "clsx";
import type { Session } from "next-auth";
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
					className="hidden"
					onChange={handleOnChange}
					checked={isOpen}
				/>
				<MenuIcon className="swap-off fill-current w-8 h-8" />
				<CloseIcon className="swap-on fill-current w-8 h-8" />
			</label>
			<div
				className={clsx(
					"absolute w-screen h-[calc(100dvh-var(--header-height))] left-0 top-[--header-height] flex flex-col backdrop-blur-xl p-2",
					!isOpen && "hidden",
				)}
			>
				{links.map(({ href, label }) => (
					<Link
						key={href}
						href={href}
						onClick={() => setIsOpen(false)}
						className={clsx(
							isActive(href) && "bg-slate-400/40",
							"p-2 rounded-md cursor-pointer hover:bg-slate-400/40",
						)}
					>
						<span>{label}</span>
					</Link>
				))}
				{session ? (
					<div className="p-2 flex flex-col">
						<span
							className={isAdmin(session) ? "text-yellow-200 font-bold" : ""}
						>
							{session.user?.name}
						</span>
						<Link className="py-3" href="/api/auth/signout">
							{tHeader("signOut")}
						</Link>
					</div>
				) : (
					<Link className="p-2" href="/api/auth/signin">
						{tHeader("signIn")}
					</Link>
				)}
			</div>
		</>
	);
};

export { MobileMenu };
