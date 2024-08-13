import { notoKR } from "@/utils/fonts";
import clsx from "clsx";

export default function TopikLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div
			className={clsx(
				"w-10/12 lg:w-3/4 xl:w-[1024px] mx-auto py-6",
				notoKR.className,
			)}
		>
			{children}
		</div>
	);
}
