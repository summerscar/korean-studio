import HomeIcon from "@/assets/svg/home.svg";
import { isAdminBySession } from "@/hooks/use-user";
import { getServerI18n } from "@/utils/i18n";
import { auth } from "auth";
import clsx from "clsx";
import Link from "next/link";
import { ActiveLinks } from "./_component/active-links";
import { CheckClientSession } from "./_component/check-client-session";
import { CleanCache } from "./_component/clean-cache";
import { MobileMenu } from "./_component/mobile-menu";
import { Progress } from "./_component/progress";
import { Search } from "./_component/search";

export const headerConfig = (t: Awaited<ReturnType<typeof getServerI18n>>) => [
	{
		href: "/learn/beginner",
		label: `🔨${t("beginner")}`,
	},
	{
		href: "/learn/intermediate",
		label: `🔨${t("intermediate")}`,
	},
	{
		href: "/topik",
		label: "🔨TOPIK",
	},
	{
		href: "/tools",
		label: `${t("tools")}`,
	},
];

const Header = async () => {
	const session = await auth();
	const t = await getServerI18n("Header");

	return (
		<header className="before-backdrop-shadow sticky top-0 h-[--header-height] flex border-b border-slate-900/10 w-full select-none bg-slate-300/10 text-base-content z-20 before:">
			<div className="w-full px-4 flex justify-between items-center">
				<Link href="/">
					<HomeIcon width={32} height={32} viewBox="0 0 24 24" />
				</Link>
				<div className="mr-0 sm:mr-4 flex-auto flex justify-center items-center sm:justify-end">
					<Search />
				</div>
				<div className="flex items-center mobile:hidden *:mr-4 *:py-1 *:px-2 *:rounded-md *:cursor-pointer hover:*:bg-slate-400/40">
					{<ActiveLinks links={headerConfig(t)} />}
					{session ? (
						<>
							<Link
								href="/account"
								className={clsx(
									isAdminBySession(session) ? "text-yellow-200 font-bold" : "",
								)}
							>
								{session.user?.name}
							</Link>
							<CleanCache session={session} />
							<Link href="/api/auth/signout">{t("signOut")}</Link>
						</>
					) : (
						<Link href="/api/auth/signin">{t("signIn")}</Link>
					)}
				</div>
				<div className="hidden mobile:block">
					<MobileMenu links={headerConfig(t)} session={session} />
				</div>
			</div>
			<CheckClientSession serverSession={session} />
			<Progress />
		</header>
	);
};

export { Header };
