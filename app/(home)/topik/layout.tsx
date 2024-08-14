import { notoKR } from "@/utils/fonts";
import clsx from "clsx";

export default function Layout({
	children,
	breadcrumbs,
}: Readonly<{
	children: React.ReactNode;
	breadcrumbs: React.ReactNode;
}>) {
	return (
		<div
			className={clsx(
				"w-10/12 lg:w-3/4 xl:w-[1024px] mx-auto py-6",
				notoKR.className,
			)}
		>
			{breadcrumbs}
			{children}
		</div>
	);
}
