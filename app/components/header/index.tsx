import HomeIcon from "@/assets/svg/home.svg";
import { getServerI18n } from "@/utils/i18n";
import { auth } from "auth";
import Link from "next/link";
import { ActiveLinks } from "./_component/active-links";
import { Progress } from "./_component/progress";

export const headerConfig = (t: Awaited<ReturnType<typeof getServerI18n>>) => [
	{
		href: "/learn/beginner",
		label: `🚧${t("beginner")}`,
	},
	{
		href: "/learn/intermediate",
		label: `🚧${t("intermediate")}`,
	},
	{
		href: "/topik",
		label: "🚧TOPIK",
	},
];

const Header = async () => {
	const session = await auth();
	const t = await getServerI18n("Header");

	return (
		<header className="sticky top-0 h-[--header-height] flex border-b border-slate-900/10 w-full backdrop-blur-lg select-none bg-slate-300/10 text-base-content">
			<div className="w-full px-4 flex justify-between items-center">
				<Link href="/">
					<HomeIcon width={32} height={32} viewBox="0 0 24 24" />
				</Link>
				<div className="flex">
					{<ActiveLinks links={headerConfig(t)} />}
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
			<Progress />
		</header>
	);
};

export { Header };
