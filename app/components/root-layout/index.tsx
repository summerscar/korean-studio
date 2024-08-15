import { inter } from "@/utils/fonts";
import "github-markdown-css";
import "@/globals.css";
import { getThemeFromCookie } from "@/actions/check-theme";
import { Themes } from "@/types";
import { isProd } from "@/utils/is-dev";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import clsx from "clsx";
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
				<body className={inter.className}>{children}</body>
			</html>
		);
	}
	return (
		<html lang={locale} data-theme={themeFromCookie || Themes.Light}>
			<body
				className={clsx(inter.className, bodyClassName, "text-base-content")}
			>
				<NextIntlClientProvider messages={messages}>
					<main className="flex min-h-screen flex-col">{children}</main>
				</NextIntlClientProvider>
				{isProd && <SpeedInsights />}
				{isProd && <Analytics />}
				{isProd && <GoogleAnalytics gaId={GAId} />}
			</body>
		</html>
	);
}
