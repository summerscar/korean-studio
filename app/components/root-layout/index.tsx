import { inter } from "@/utils/fonts";
import "@/globals.css";
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

	if (isAdmin) {
		return (
			<html lang="zh-CN">
				<body className={inter.className}>{children}</body>
			</html>
		);
	}
	return (
		<html lang={locale}>
			<body className={clsx(inter.className, bodyClassName)}>
				<NextIntlClientProvider messages={messages}>
					<main className="flex min-h-screen flex-col bg-slate-600/10">
						{children}
					</main>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
