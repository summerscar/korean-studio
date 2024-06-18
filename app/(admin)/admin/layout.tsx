import { DefaultLayout } from "@/components/root-layout";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <DefaultLayout isAdmin>{children}</DefaultLayout>;
}
