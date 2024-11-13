import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { DefaultLayout } from "@/components/root-layout";
import { getServerI18n } from "@/utils/i18n";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getServerI18n("Index");
	return {
		title: t("title"),
		description: t("description"),
		keywords: t("keywords").split(","),
		generator: "Next.js",
		authors: [{ name: "summerscar", url: "https://github.com/summerscar" }],
		openGraph: {
			title: t("title"),
			description: t("description"),
			type: "website",
			images: ["/api/og"],
			url: "https://korean.app.summerscar.me/",
			siteName: t("title"),
		},
		twitter: {
			card: "summary_large_image",
			site: "@summerscar",
			creator: "@summerscar",
			title: t("title"),
			description: t("description"),
			images: ["/api/og"],
		},
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<DefaultLayout bodyClassName="relative z-0">
			<Header />
			<section className="flex-auto flex items-stretch">{children}</section>
			<Footer />
		</DefaultLayout>
	);
}
