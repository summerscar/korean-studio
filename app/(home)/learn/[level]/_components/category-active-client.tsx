"use client";
import type { FileItem } from "@/utils/list-docs";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, PropsWithChildren } from "react";

const CategoryActiveClient = ({
	doc,
	className,
	...props
}: PropsWithChildren<ComponentProps<typeof Link> & { doc?: FileItem }>) => {
	/** pathname: /learn/[level]/[...doc_path] */
	const pathname = usePathname();
	const curFileName = decodeURIComponent(pathname)
		.split("/")
		.filter(Boolean)
		.slice(2)
		.pop();
	const isActive = doc?.fileName === curFileName;
	return (
		<Link
			className={clsx(className, { active: isActive })}
			onClick={async () => {
				// 太丑陋了， RSC 这情况太丑了
				if (isActive) return;
				(
					document.getElementById("category-drawer") as HTMLInputElement
				).checked = false;
			}}
			{...props}
		/>
	);
};

const MobileCategoryHeader = ({ level }: { level: string }) => {
	const pathname = usePathname();
	const curPath = decodeURIComponent(pathname)
		.split("/")
		.filter(Boolean)
		.slice(2);

	curPath.unshift(level);

	return curPath.join(" / ");
};

export { CategoryActiveClient, MobileCategoryHeader };
