import { getServerI18n } from "@/utils/i18n";
import { auth } from "auth";
import Image from "next/image";
import Link from "next/link";

const Header = async () => {
	const session = await auth();
	const t = await getServerI18n("Header");
	console.log("[Header]", session);
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
					<Link href="/learn/beginner" className="mr-4">
						<span>🚧{t("beginner")}</span>
					</Link>
					<Link href="/learn/intermediate" className="mr-4">
						<span>🚧{t("intermediate")}</span>
					</Link>
					<Link href="/topik" className="mr-4">
						<span>🚧TOPIK</span>
					</Link>
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
