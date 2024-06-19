import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HomeBGIcon } from "@/components/home-bg-icon";
import { DefaultLayout } from "@/components/root-layout";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getTranslations({ locale, namespace: "Index" });

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
