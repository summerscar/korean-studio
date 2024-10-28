"use client";
import clsx from "clsx";
import type { Session } from "next-auth";
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
				<svg
					className="swap-off fill-current"
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 512 512"
				>
					<title>icon</title>
					<path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
				</svg>
				<svg
					className="swap-on fill-current"
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 512 512"
				>
					<title>icon</title>
					<polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
				</svg>
			</label>
			<div
				className={clsx(
					"absolute w-screen h-[calc(100vh-var(--header-height))] left-0 top-[--header-height] flex flex-col backdrop-blur-lg p-2",
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
					<div className="p-2">
						<span>{session.user?.name}</span>
						<Link className="ml-4" href="/api/auth/signout">
							Signout
						</Link>
					</div>
				) : (
					<Link className="p-2" href="/api/auth/signin">
						Sign In
					</Link>
				)}
			</div>
		</>
	);
};

export { MobileMenu };
