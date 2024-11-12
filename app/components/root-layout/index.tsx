import "github-markdown-css";
import "@/styles/globals.css";
import { getThemeFromCookie } from "@/actions/check-theme";
import { VConsole } from "@/components/vconsole";
import { ToastRoot } from "@/hooks/use-toast";
import { Themes } from "@/types";
import { isDev, isProd } from "@/utils/is-dev";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import clsx from "clsx";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export async function DefaultLayout({
	isAdmin = false,
	children,
	bodyClassName = "",
}: Readonly<{
	children: React.ReactNode;
	isAdmin?: boolean;
	bodyClassName?: string;
}>) {
	const locale = await getLocale();
	const messages = await getMessages();
	const themeFromCookie = await getThemeFromCookie();
	const GAId = process.env.NEXT_PUBLIC_GA_ID || "";

	if (isAdmin) {
		return (
			<html lang="zh-CN">
				<body>{children}</body>
			</html>
		);
	}
	return (
		<html lang={locale} data-theme={themeFromCookie || Themes.Light}>
			<body className={clsx(bodyClassName, "text-base-content")}>
				<div id="bg" />
				<SessionProvider>
					<NextIntlClientProvider messages={messages}>
						<main className="flex min-h-dvh flex-col">{children}</main>
					</NextIntlClientProvider>
				</SessionProvider>
				<ToastRoot />
				{/* {isDev && <CacheToolbar />} */}
				{isDev && <VConsole />}
				{isProd && <SpeedInsights />}
				{isProd && <Analytics />}
				{isProd && <GoogleAnalytics gaId={GAId} />}
			</body>
		</html>
	);
}
