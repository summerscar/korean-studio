import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HomeBGIcon } from "@/components/home-bg-icon";
import { DefaultLayout } from "@/components/root-layout";
import { getServerI18n } from "@/utils/i18n";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getServerI18n("Index");
	return {
		title: t("title"),
		description: t("description"),
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<DefaultLayout>
			<HomeBGIcon />
			<Header />
			<section className="flex-auto flex items-stretch">{children}</section>
			<Footer />
		</DefaultLayout>
	);
}
