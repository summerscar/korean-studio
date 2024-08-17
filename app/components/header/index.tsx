import { getServerI18n } from "@/utils/i18n";
import { auth } from "auth";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

const Header = async () => {
	const session = await auth();
	const t = await getServerI18n("Header");

	/*
	TODO: active
	https://github.com/vercel/next.js/issues/43704#issuecomment-2090798307
	const path = getPathname().path;
	console.log("[path]", path);
	*/
	const path = "";
	const headerConfig = [
		{
			href: "/learn/beginner",
			label: `🚧${t("beginner")}`,
			active: path.includes("/learn/beginner"),
		},
		{
			href: "/learn/intermediate",
			label: `🚧${t("intermediate")}`,
			active: path.includes("/learn/intermediate"),
		},
		{
			href: "/topik",
			label: "🚧TOPIK",
			active: path.includes("/topik"),
		},
	];
	return (
		<header className="sticky top-0 h-[--header-height] flex border-b border-slate-900/10 w-full backdrop-blur-lg select-none bg-slate-300/10 text-base-content">
			<div className="w-full px-4 flex justify-between items-center">
				<Link href="/">
					<Image
						src="/vercel.svg"
						alt="Vercel Logo"
						className="dark:invert"
						width={100}
						height={24}
						priority
					/>
				</Link>
				<div className="flex">
					{headerConfig.map(({ href, label }) => (
						<Link
							key={href}
							href={href}
							className={clsx("mr-4 hover:underline")}
						>
							<span>{label}</span>
						</Link>
					))}
					<span>
						{session ? (
							<div>
								<span>{session.user?.name}</span>
								<Link className="ml-4" href="/api/auth/signout">
									Signout
								</Link>
							</div>
						) : (
							<Link href="/api/auth/signin">Sign In</Link>
						)}
					</span>
				</div>
			</div>
		</header>
	);
};

export { Header };
